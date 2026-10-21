import { Response } from 'express';
import { AIConversation, Task, Project, MarketingCampaign, Workspace } from '../models';
import { AuthenticatedRequest } from '../types';
import { AIOrchestrator } from '../ai/ai.orchestrator';
import { AIToolRegistry } from '../ai/ai.tools';
import { AuditService } from '../services/audit.service';
import mongoose from 'mongoose';

const MAX_TOOL_ROUNDS = 3;   // safety cap per user message
const HISTORY_VERBATIM = 16; // number of recent messages passed verbatim to the LLM
const HISTORY_MAX = 60;      // messages above this trigger topic-digest compression

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic topic digest — no extra LLM call, no extra quota cost
// Extracts what topics were covered in the older part of the conversation so
// the model can resolve references like "it", "that number", "the earlier ones".
// ─────────────────────────────────────────────────────────────────────────────
function buildTopicDigest(
  olderMessages: Array<{ role: string; content: string }>,
): string {
  if (olderMessages.length === 0) return '';

  // Take every assistant message (they contain the synthesised data answers)
  const assistantTurns = olderMessages
    .filter((m) => m.role === 'assistant')
    .map((m) => m.content.slice(0, 200).replace(/\n+/g, ' '));

  if (assistantTurns.length === 0) return '';

  return (
    `[Earlier in this conversation the following topics were covered:\n` +
    assistantTurns.map((t, i) => `${i + 1}. ${t}…`).join('\n') +
    `\nUse this context to resolve follow-up references correctly.]`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Build the message list to send to the LLM for the initial (tool-selection)
// call. Combines: system prompt → optional topic digest → recent history.
// ─────────────────────────────────────────────────────────────────────────────
function buildContextMessages(
  systemPrompt: string,
  allMessages: Array<{ role: string; content: string }>,
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const total = allMessages.length;

  // Short conversation — everything verbatim
  if (total <= HISTORY_VERBATIM) {
    return [
      { role: 'system', content: systemPrompt },
      ...allMessages.map((m) => ({ role: m.role as any, content: m.content })),
    ];
  }

  // Long conversation — digest for the old part, verbatim for the recent part
  const olderMessages = allMessages.slice(0, total - HISTORY_VERBATIM);
  const recentMessages = allMessages.slice(-HISTORY_VERBATIM);
  const digest = buildTopicDigest(olderMessages);

  const systemWithDigest = digest
    ? `${systemPrompt}\n\n${digest}`
    : systemPrompt;

  return [
    { role: 'system', content: systemWithDigest },
    ...recentMessages.map((m) => ({ role: m.role as any, content: m.content })),
  ];
}

export class CopilotController {
  // ── POST /api/ai/copilot/chat ──────────────────────────────────────────────
  public static async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { message, conversationId } = req.body;

      if (!message || !message.trim()) {
        res.status(400).json({ success: false, error: 'User message is required' });
        return;
      }

      // ── Auth-scoped IDs — never trust model or user body for these ─────────
      const wsId = new mongoose.Types.ObjectId(req.workspace!.workspaceId);
      const userId = new mongoose.Types.ObjectId(req.user!.userId);
      const toolCtx = {
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        role: req.workspace!.role,
      };

      // ── Load or create conversation — strictly workspace-scoped ───────────
      let conversation: any;
      if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
        conversation = await AIConversation.findOne({
          _id: new mongoose.Types.ObjectId(conversationId),
          workspaceId: wsId,    // prevents cross-workspace access
          userId,               // prevents cross-user access within same workspace
        });
      }
      if (!conversation) {
        conversation = await AIConversation.create({
          workspaceId: wsId,
          userId,
          title: message.slice(0, 60) + (message.length > 60 ? '…' : ''),
          messages: [],
        });
      }

      // Trim stored history if it has grown very large (cap at HISTORY_MAX)
      if (conversation.messages.length > HISTORY_MAX) {
        conversation.messages = conversation.messages.slice(-HISTORY_MAX);
      }

      // Add current user turn
      conversation.messages.push({ role: 'user', content: message.trim(), createdAt: new Date() });

      // ── System prompt ───────────────────────────────────────────────────────
      const workspace = await Workspace.findById(wsId);
      const systemPrompt =
        `You are the VentureOS AI Business Copilot embedded in the ` +
        `"${workspace?.name || 'Venture'}" workspace (${workspace?.industry || 'Technology'} industry).\n\n` +
        `CAPABILITIES:\n` +
        `1. BUSINESS DATA — When the user asks about sales, leads, pipeline, revenue, expenses, MRR, ` +
        `ARR, burn rate, cash flow, customers, churn, projects, tasks, marketing campaigns, or documents ` +
        `— ALWAYS call the appropriate tool to retrieve verified live data. Never invent or estimate figures.\n\n` +
        `2. GENERAL KNOWLEDGE — Strategy, definitions, best practices, frameworks, or anything that does ` +
        `not require live workspace data — answer directly from training knowledge.\n\n` +
        `TOOL RULES:\n` +
        `- Pick the single most relevant tool per response. Do not call multiple tools simultaneously.\n` +
        `- Synthesise tool results into a clear, concise executive summary in markdown. ` +
        `Never expose raw data structures, JSON, or mention "tool" in your reply.\n` +
        `- For createTask / createProject / createMarketingCampaign: propose the action card. ` +
        `Never write to the database directly — the user must click Approve.\n` +
        `- If tool data shows empty records, report that honestly.\n\n` +
        `CONTEXT RULES:\n` +
        `- Maintain full conversational context. Resolve pronouns and follow-ups (e.g. "it", "that", ` +
        `"those numbers", "why was it lower?") using the conversation history above.\n` +
        `- When a follow-up question implies live data is needed again, call the relevant tool again ` +
        `to fetch fresh figures rather than relying only on what was already quoted.\n` +
        `- Never mix data from different workspaces or users.`;

      // ── Build LLM message list with smart history compression ──────────────
      const storedHistory = conversation.messages
        .slice(0, -1) // exclude the turn we just appended (included via baseMessages below)
        .map((m: any) => ({ role: m.role, content: m.content }));

      const baseMessages = buildContextMessages(systemPrompt, [
        ...storedHistory,
        { role: 'user', content: message.trim() }, // current turn
      ]);

      const orchestrator = AIOrchestrator.getInstance();
      const tools = AIToolRegistry.getToolDefinitions();

      // ── Multi-turn tool loop ────────────────────────────────────────────────
      // Within a single user request, we may execute up to MAX_TOOL_ROUNDS tools.
      // Tool results are injected using the proper Gemini functionResponse format
      // so the model understands it called a tool — not just "here is some text".
      let finalContent = '';
      let actionProposal: any;
      const toolsUsed: string[] = [];

      // We build up a mutable "intra-request" turn list that extends baseMessages.
      // These turns are NOT stored to MongoDB — only the final synthesis answer is.
      let currentMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        ...baseMessages,
      ];

      let toolRound = 0;
      let lastAiRes: any = null;

      while (toolRound < MAX_TOOL_ROUNDS) {
        const aiRes = await orchestrator.generate(currentMessages, {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'copilot',
          tools: tools as any,
        });
        lastAiRes = aiRes;

        // ── No tool call → this IS the final answer ─────────────────────────
        if (!aiRes.toolCalls || aiRes.toolCalls.length === 0) {
          finalContent = aiRes.content;
          break;
        }

        // ── Execute tool — always using auth context, never model-supplied IDs
        const toolCall = aiRes.toolCalls[0];
        let toolResult: any;
        try {
          toolResult = await AIToolRegistry.executeTool(toolCall.name, toolCall.args || {}, toolCtx);
        } catch (toolErr: any) {
          toolResult = { error: true, message: toolErr.message || 'Tool execution failed' };
        }

        // ── Action proposal → stop loop immediately ──────────────────────────
        if (toolResult?.isActionProposal) {
          actionProposal = {
            actionType: toolResult.actionType,
            payload: toolResult.payload,
            status: 'pending',
          };
          finalContent =
            `I have prepared the following **Action Proposal** for your review:\n\n` +
            `${toolResult.summary}\n\n` +
            `Please click **Approve Action** to execute this change through the system.`;
          toolsUsed.push(toolCall.name);
          break;
        }

        toolsUsed.push(toolCall.name);

        // ── Inject tool result as a proper function-response turn ─────────────
        // Pattern: model signals it called a tool → we add the response → model synthesizes.
        // This preserves the tool-call semantics so the LLM understands what happened
        // when it reads back the intra-request history.
        const toolResultSummary = JSON.stringify(toolResult, null, 2);

        currentMessages = [
          ...currentMessages,
          // Assistant acknowledged tool invocation
          {
            role: 'assistant' as const,
            content: `I'm retrieving "${toolCall.name}" data now.`,
          },
          // Inject verified tool result with synthesis instruction
          {
            role: 'user' as const,
            content:
              `Here is the verified live data returned by "${toolCall.name}":\n\n` +
              `\`\`\`json\n${toolResultSummary}\n\`\`\`\n\n` +
              `Now synthesise a clear, professional executive summary in markdown. ` +
              `Do not mention "tool", "JSON", field names, or raw data structures in your reply. ` +
              `If "dataAvailable" is false, honestly tell the user there is no data yet and ` +
              `explain what they would need to do to populate it.`,
          },
        ];

        toolRound++;
      }

      // Safety: if loop exhausted without a text response, do one final synthesis
      if (!finalContent && toolsUsed.length > 0) {
        const synthRes = await orchestrator.generate(currentMessages, {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'copilot',
          // No tools here — we want a text answer, not another tool call
        });
        finalContent = synthRes.content || 'I was unable to generate a response. Please try again.';
      }

      if (!finalContent) {
        finalContent = lastAiRes?.content || 'I was unable to generate a response. Please try again.';
      }

      // ── Persist the assistant turn (clean — no tool intermediaries) ─────────
      conversation.messages.push({
        role: 'assistant',
        content: finalContent,
        ...(actionProposal ? { actionProposal } : {}),
        createdAt: new Date(),
      });
      await conversation.save();

      res.status(200).json({
        success: true,
        data: {
          conversationId: conversation._id.toString(),
          message: finalContent,
          actionProposal,
          model: lastAiRes?.model,
          latencyMs: lastAiRes?.latencyMs,
          toolsUsed,
          turnCount: conversation.messages.filter((m: any) => m.role === 'user').length,
        },
      });
    } catch (error: any) {
      console.error('[Copilot] chat error:', error.message);
      res.status(500).json({ success: false, error: error.message || 'Failed to process Copilot request' });
    }
  }

  // ── GET /api/ai/copilot/conversation/:id ─────────────────────────────────
  // Load a specific conversation's messages (for frontend to restore history)
  public static async getConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id ?? '');
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, error: 'Invalid conversation ID' });
        return;
      }

      const conversation = await AIConversation.findOne({
        _id: new mongoose.Types.ObjectId(id),
        workspaceId: new mongoose.Types.ObjectId(req.workspace!.workspaceId),
        userId: new mongoose.Types.ObjectId(req.user!.userId),
      });

      if (!conversation) {
        res.status(404).json({ success: false, error: 'Conversation not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          conversationId: conversation._id.toString(),
          title: conversation.title,
          messages: conversation.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            actionProposal: m.actionProposal,
            createdAt: m.createdAt,
          })),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ── POST /api/ai/copilot/approve-action ───────────────────────────────────
  public static async approveAction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { actionType, payload, conversationId, messageIndex } = req.body;

      if (!actionType || !payload) {
        res.status(400).json({ success: false, error: 'actionType and payload are required' });
        return;
      }

      const wsId = new mongoose.Types.ObjectId(req.workspace!.workspaceId);
      const userId = new mongoose.Types.ObjectId(req.user!.userId);
      let executedRecord: any;

      if (actionType === 'createTask') {
        executedRecord = await Task.create({
          workspaceId: wsId,
          title: payload.title,
          description: payload.description || 'Task created via AI Copilot',
          priority: payload.priority || 'medium',
          status: 'todo',
          originType: 'ai_project_plan',
          assigneeId: userId,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
          projectId: payload.projectId ? new mongoose.Types.ObjectId(payload.projectId) : undefined,
        });
      } else if (actionType === 'createProject') {
        executedRecord = await Project.create({
          workspaceId: wsId,
          name: payload.name,
          description: payload.description || '',
          priority: payload.priority || 'medium',
          budget: Number(payload.budget) || 0,
          ownerId: userId,
          aiGenerated: true,
        });
      } else if (actionType === 'createMarketingCampaign') {
        executedRecord = await MarketingCampaign.create({
          workspaceId: wsId,
          name: payload.name,
          product: payload.product,
          objective: payload.objective,
          platform: payload.platform || 'Multi-Channel',
          budget: Number(payload.budget) || 0,
          status: 'draft',
        });
      } else {
        res.status(400).json({ success: false, error: `Unsupported actionType: ${actionType}` });
        return;
      }

      await AuditService.record({
        workspaceId: wsId,
        userId: req.user!.userId,
        action: `ai.action_approved.${actionType}`,
        resource: actionType.replace('create', ''),
        resourceId: executedRecord._id.toString(),
        details: payload,
      });

      if (conversationId && messageIndex !== undefined) {
        const conv = await AIConversation.findOne({
          _id: conversationId,
          workspaceId: wsId,
          userId,
        });
        if (conv && conv.messages[messageIndex]?.actionProposal) {
          conv.messages[messageIndex].actionProposal!.status = 'executed';
          conv.messages[messageIndex].actionProposal!.executedResult = executedRecord;
          await conv.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Action approved and executed',
        data: executedRecord,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to approve action' });
    }
  }

  // ── GET /api/ai/copilot/history ───────────────────────────────────────────
  public static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversations = await AIConversation.find({
        workspaceId: new mongoose.Types.ObjectId(req.workspace!.workspaceId),
        userId: new mongoose.Types.ObjectId(req.user!.userId),
      })
        .sort({ updatedAt: -1 })
        .limit(20)
        .select('_id title updatedAt messages');

      res.status(200).json({
        success: true,
        data: conversations.map((c) => ({
          id: c._id.toString(),
          title: c.title,
          updatedAt: c.updatedAt,
          messageCount: c.messages.length,
          lastMessage: c.messages.length > 0
            ? c.messages[c.messages.length - 1].content.slice(0, 120)
            : '',
        })),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
