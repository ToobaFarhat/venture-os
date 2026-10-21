import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Bot, Sparkles, CheckCircle2, ShieldAlert, MessageSquare, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { CopilotService } from '../../services/api';

export interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actionProposal?: {
    actionType: string;
    payload: any;
    status: 'pending' | 'approved' | 'executed';
  };
}

// ── Lightweight markdown renderer ──────────────────────────────────────────
// Handles: **bold**, `code`, ## heading, - bullet, numbered list, blank lines
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let keyCounter = 0;

  const inlineFormat = (line: string): React.ReactNode => {
    // Split on **bold** and `code` spans
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1 py-0.5 bg-slate-100 text-indigo-700 rounded text-[10px] font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines (add spacing via margin on neighbouring elements)
    if (!line.trim()) { i++; continue; }

    // Headings: ## or ###
    if (/^#{1,3}\s/.test(line)) {
      const text = line.replace(/^#{1,3}\s/, '');
      elements.push(
        <p key={keyCounter++} className="font-bold text-slate-800 mt-2 mb-0.5">
          {inlineFormat(text)}
        </p>,
      );
      i++;
      continue;
    }

    // Bullet list block
    if (/^[-*•]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={keyCounter++} className="list-disc list-inside space-y-0.5 my-1 pl-1">
          {items.map((item, j) => (
            <li key={j} className="text-slate-700">{inlineFormat(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Numbered list block
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={keyCounter++} className="list-decimal list-inside space-y-0.5 my-1 pl-1">
          {items.map((item, j) => (
            <li key={j} className="text-slate-700">{inlineFormat(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={keyCounter++} className="text-slate-800 leading-relaxed">
        {inlineFormat(line)}
      </p>,
    );
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}

// ── localStorage key scoped to current workspace ───────────────────────────
function getStorageKey(): string {
  const wsId = localStorage.getItem('activeWorkspaceId') ?? 'default';
  return `copilot_conv_${wsId}`;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    `Hello! I'm your **VentureOS AI Business Copilot**.\n\n` +
    `I have authorized access to your live CRM, financial records, projects, customer feedback, and marketing campaigns.\n\n` +
    `Ask me anything about your business — I'll fetch verified live data and help you take action.`,
};

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [turnCount, setTurnCount] = useState(0);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll on new messages ──────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Restore prior conversation on open ───────────────────────────────────
  useEffect(() => {
    if (!isOpen || historyLoaded) return;

    const savedId = localStorage.getItem(getStorageKey());
    if (!savedId) {
      setHistoryLoaded(true);
      return;
    }

    // Attempt to load saved conversation from backend
    CopilotService.getConversation(savedId)
      .then((res) => {
        if (res.data.success && res.data.data.messages?.length > 0) {
          const loaded: ChatMessage[] = res.data.data.messages
            .filter((m: any) => m.role === 'user' || m.role === 'assistant')
            .map((m: any) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
              actionProposal: m.actionProposal,
            }));

          setMessages(loaded.length > 0 ? loaded : [WELCOME_MESSAGE]);
          setConversationId(savedId);
          setTurnCount(loaded.filter((m) => m.role === 'user').length);
        }
      })
      .catch(() => {
        // Conversation may have expired — start fresh
        localStorage.removeItem(getStorageKey());
      })
      .finally(() => setHistoryLoaded(true));
  }, [isOpen, historyLoaded]);

  // ── Persist conversationId to localStorage ───────────────────────────────
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(getStorageKey(), conversationId);
    }
  }, [conversationId]);

  // ── Start a new thread ───────────────────────────────────────────────────
  const handleNewThread = useCallback(() => {
    localStorage.removeItem(getStorageKey());
    setMessages([WELCOME_MESSAGE]);
    setConversationId(undefined);
    setTurnCount(0);
    setInput('');
  }, []);

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await CopilotService.chat(userText, conversationId);
      if (res.data.success) {
        const data = res.data.data;
        setConversationId(data.conversationId);
        setTurnCount(data.turnCount ?? turnCount + 1);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
            actionProposal: data.actionProposal,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ I encountered an issue. Please ensure the backend is running and your workspace is configured. If the problem persists, try starting a new conversation.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Approve action proposal ──────────────────────────────────────────────
  const handleApproveAction = async (msgIndex: number, actionProposal: any) => {
    try {
      const res = await CopilotService.approveAction({
        actionType: actionProposal.actionType,
        payload: actionProposal.payload,
        conversationId,
        messageIndex: msgIndex,
      });

      if (res.data.success) {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[msgIndex]?.actionProposal) {
            updated[msgIndex] = {
              ...updated[msgIndex],
              actionProposal: { ...updated[msgIndex].actionProposal!, status: 'executed' },
            };
          }
          updated.push({
            role: 'assistant',
            content: `✅ Done! **${actionProposal.actionType.replace('create', '')}** created successfully in your workspace.`,
          });
          return updated;
        });
      }
    } catch {
      alert('Failed to execute action. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col">

          {/* ── Header ── */}
          <div className="px-6 py-4 bg-gradient-to-r from-brand-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-500/20">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-600 shadow-ai-glow">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">AI Business Copilot</h3>
                <p className="text-[11px] text-indigo-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" />
                  {conversationId
                    ? `Active thread · ${turnCount} exchange${turnCount !== 1 ? 's' : ''}`
                    : 'Authorized tool-calling assistant'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {conversationId && (
                <button
                  onClick={handleNewThread}
                  title="Start new conversation"
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 mr-0.5"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button onClick={onClose} className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Quick suggestion pills ── */}
          {/* ── Quick suggestion pills — visible only on empty conversation ── */}
          {turnCount === 0 && !conversationId && (
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              {[
                { label: '📊 Sales Pipeline', q: 'What does our sales pipeline look like?' },
                { label: '💰 Cash & Runway', q: 'Show me our net revenue, MRR, and burn rate' },
                { label: '⚠️ Churn Risks', q: 'Which customers are at highest churn risk?' },
                { label: '📣 Marketing ROI', q: 'How are our marketing campaigns performing?' },
                { label: '✅ Overdue Tasks', q: 'How many tasks are overdue and which are highest priority?' },
              ].map(({ label, q }) => (
                <button
                  key={label}
                  onClick={() => setInput(q)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-700 hover:border-indigo-300 whitespace-nowrap transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* ── Conversation resumed banner ── */}
          {conversationId && turnCount > 0 && (
            <div className="px-4 py-1.5 bg-indigo-50 border-b border-indigo-100 text-[11px] text-indigo-700 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Conversation context restored — follow-up questions are understood in context.
            </div>
          )}

          {/* ── Messages stream ── */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center flex-shrink-0 text-indigo-600 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] ${
                    m.role === 'user'
                      ? 'bg-brand-900 text-white rounded-tr-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {m.role === 'assistant'
                    ? renderMarkdown(m.content)
                    : <div className="whitespace-pre-wrap">{m.content}</div>}

                  {/* Action proposal card */}
                  {m.actionProposal && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-200 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-1">
                        <ShieldAlert className="w-4 h-4 text-indigo-600" />
                        Proposed Action: {m.actionProposal.actionType}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded border border-slate-100 my-2 overflow-x-auto">
                        {JSON.stringify(m.actionProposal.payload, null, 2)}
                      </div>
                      {m.actionProposal.status === 'executed' ? (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Executed in Database
                        </div>
                      ) : (
                        <Button
                          variant="ai"
                          size="sm"
                          className="w-full mt-1"
                          onClick={() => handleApproveAction(idx, m.actionProposal)}
                        >
                          Approve &amp; Execute Action
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                Querying authorized backend tools and analysing context…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Chat input ── */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                conversationId
                  ? 'Follow up or ask something new…'
                  : 'Ask Copilot about leads, revenue, tasks…'
              }
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
            />
            <Button variant="ai" size="sm" type="submit" disabled={!input.trim() || loading}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
};
