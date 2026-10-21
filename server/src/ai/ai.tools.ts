import mongoose from 'mongoose';
import {
  Lead, Customer, Project, Task, Feedback,
  FinancialRecord, MarketingCampaign,
  DocumentChunk, DocumentModel,
} from '../models';

export interface ToolExecutionContext {
  workspaceId: string;
  userId: string;
  role: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool Definitions forwarded verbatim to the LLM
// ─────────────────────────────────────────────────────────────────────────────
export class AIToolRegistry {
  public static getToolDefinitions() {
    return [
      {
        name: 'getRevenueData',
        description:
          'Get verified financial metrics: total revenue, expenses, net profit/loss, MRR, ARR, ' +
          'burn rate, estimated cash runway, and a 6-month monthly breakdown. ' +
          'Use for any question about revenue, income, profit, MRR, ARR, burn rate, or runway.',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'getSalesPipeline',
        description:
          'Get CRM sales pipeline: lead counts and deal value per stage ' +
          '(New, Contacted, Qualified, Proposal, Negotiation, Won, Lost), win rate, weighted pipeline. ' +
          'Use for any question about pipeline, deals, win rate, or CRM stages.',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'getLeads',
        description:
          'Retrieve CRM leads sorted by AI score. Supports filtering by stage. ' +
          'Use when the user asks about specific leads, top prospects, or wants a lead list.',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Max leads to return (default 10, max 25)' },
            status: {
              type: 'string',
              description: 'Filter stage: New|Contacted|Qualified|Proposal|Negotiation|Won|Lost',
            },
          },
        },
      },
      {
        name: 'getCustomers',
        description:
          'List workspace customers with health score, MRR contribution, churn risk, last contact. ' +
          'Use when the user asks about active customers, customer health, or churn risk overview.',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Max customers to return (default 10)' },
            churnRisk: { type: 'string', description: 'Filter: low|medium|high|critical' },
          },
        },
      },
      {
        name: 'getCustomerDetails',
        description:
          'Get full profile for a specific customer by ID or name. ' +
          'Use when the user asks about a specific named customer.',
        parameters: {
          type: 'object',
          properties: {
            customerId: { type: 'string', description: 'MongoDB ObjectId (if known)' },
            customerName: { type: 'string', description: 'Customer name to search if ID unknown' },
          },
        },
      },
      {
        name: 'getCustomerFeedback',
        description:
          'Get feedback sentiment breakdown, satisfaction rate, top topics, high-urgency complaints. ' +
          'Use when the user asks about customer sentiment, feedback, satisfaction, or complaints.',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'getProjectStatus',
        description:
          'Get projects overview: status breakdown, progress %, overdue tasks, completion rate. ' +
          'Use when the user asks about projects, sprints, deliverables, or overdue work.',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'getMarketingMetrics',
        description:
          'Get marketing campaign performance: spend, revenue, CTR, conversion rate, ROI, CAC, per-campaign detail. ' +
          'Use for any question about marketing, campaigns, ads, CTR, CAC, or ROI.',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'searchDocuments',
        description:
          'Semantic search through uploaded workspace documents (PDFs, DOCX, etc.). ' +
          'Use when the user asks about anything that might be in a document, contract, report, or file.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Natural-language search query' },
            limit: { type: 'number', description: 'Passages to return (default 5, max 10)' },
          },
          required: ['query'],
        },
      },
      {
        name: 'createTask',
        description:
          'Prepare a task creation proposal for user review and approval. ' +
          'The task is NOT created until the user explicitly approves. ' +
          'Use when the user asks to create, add, or schedule a task.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string', description: 'Task description' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            dueDate: { type: 'string', description: 'ISO 8601 date string' },
            projectId: { type: 'string', description: 'Project ObjectId to attach to (optional)' },
          },
          required: ['title'],
        },
      },
      {
        name: 'createProject',
        description:
          'Prepare a project creation proposal for user review and approval. ' +
          'The project is NOT created until the user explicitly approves. ' +
          'Use when the user asks to create or plan a project.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Project name' },
            description: { type: 'string', description: 'Project description and objectives' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            budget: { type: 'number', description: 'Estimated budget in USD' },
          },
          required: ['name'],
        },
      },
      {
        name: 'createMarketingCampaign',
        description:
          'Prepare a marketing campaign creation proposal for user review and approval. ' +
          'The campaign is NOT created until the user explicitly approves. ' +
          'Use when the user asks to create or launch a campaign.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Campaign name' },
            product: { type: 'string', description: 'Product or service being promoted' },
            objective: { type: 'string', description: 'Campaign goal or objective' },
            platform: {
              type: 'string',
              enum: ['Email', 'LinkedIn', 'Twitter', 'Google Ads', 'Meta Ads', 'SEO', 'Multi-Channel'],
            },
            budget: { type: 'number', description: 'Campaign budget in USD' },
          },
          required: ['name', 'product', 'objective'],
        },
      },
    ];
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Executors — workspace ID always taken from authenticated ctx, never model input
  // ──────────────────────────────────────────────────────────────────────────
  public static async executeTool(
    toolName: string,
    args: Record<string, any>,
    ctx: ToolExecutionContext,
  ): Promise<any> {
    if (!ctx.workspaceId || !mongoose.Types.ObjectId.isValid(ctx.workspaceId)) {
      throw new Error('Invalid workspace context — execution aborted');
    }
    const wsId = new mongoose.Types.ObjectId(ctx.workspaceId);

    switch (toolName) {
      // ── Finance ────────────────────────────────────────────────────────────
      case 'getRevenueData': {
        const records = await FinancialRecord.find({ workspaceId: wsId }).sort({ date: -1 });
        if (!records.length) {
          return { dataAvailable: false, message: 'No financial records found in this workspace.' };
        }
        let totalRevenue = 0;
        let totalExpenses = 0;
        let mrr = 0;
        const monthlyMap: Record<string, { revenue: number; expenses: number }> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthlyMap[key] = { revenue: 0, expenses: 0 };
        }
        for (const r of records) {
          if (r.type === 'revenue') {
            totalRevenue += r.amount;
            if (r.recurring) mrr += r.amount;
          } else {
            totalExpenses += r.amount;
          }
          if (r.date) {
            const d = new Date(r.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyMap[key]) {
              if (r.type === 'revenue') monthlyMap[key].revenue += r.amount;
              else monthlyMap[key].expenses += r.amount;
            }
          }
        }
        const burnRate = totalExpenses > totalRevenue
          ? Math.round((totalExpenses - totalRevenue) * 100) / 100
          : 0;
        return {
          dataAvailable: true,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          netProfit: Math.round((totalRevenue - totalExpenses) * 100) / 100,
          mrr: Math.round(mrr * 100) / 100,
          arr: Math.round(mrr * 12 * 100) / 100,
          burnRate,
          estimatedRunwayMonths: burnRate > 0
            ? Math.round((totalRevenue / burnRate) * 10) / 10
            : null,
          recordCount: records.length,
          monthlyBreakdown: monthlyMap,
        };
      }

      // ── Sales Pipeline ─────────────────────────────────────────────────────
      case 'getSalesPipeline': {
        const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
        const results = await Lead.aggregate([
          { $match: { workspaceId: wsId } },
          { $group: { _id: '$status', count: { $sum: 1 }, totalDealValue: { $sum: '$dealValue' } } },
        ]);
        const pipelineMap: Record<string, { count: number; totalDealValue: number }> = {};
        stages.forEach((s) => (pipelineMap[s] = { count: 0, totalDealValue: 0 }));
        results.forEach((r) => {
          if (pipelineMap[r._id]) {
            pipelineMap[r._id] = {
              count: r.count,
              totalDealValue: Math.round(r.totalDealValue * 100) / 100,
            };
          }
        });
        const total = results.reduce((s, r) => s + r.count, 0);
        if (!total) return { dataAvailable: false, message: 'No leads found in this workspace.' };
        const totalPipelineValue = results.reduce((s, r) => s + r.totalDealValue, 0);
        const closedTotal = pipelineMap['Won'].count + pipelineMap['Lost'].count;
        const winRate = closedTotal > 0
          ? Math.round((pipelineMap['Won'].count / closedTotal) * 1000) / 10
          : null;
        const weighted = Math.round(
          (pipelineMap['Qualified'].totalDealValue * 0.3 +
            pipelineMap['Proposal'].totalDealValue * 0.5 +
            pipelineMap['Negotiation'].totalDealValue * 0.75) * 100,
        ) / 100;
        return {
          dataAvailable: true,
          stages: pipelineMap,
          totalLeads: total,
          totalPipelineValue: Math.round(totalPipelineValue * 100) / 100,
          winRate,
          weightedPipelineValue: weighted,
        };
      }

      // ── Leads ──────────────────────────────────────────────────────────────
      case 'getLeads': {
        const limit = Math.min(Number(args.limit) || 10, 25);
        const query: any = { workspaceId: wsId };
        if (args.status) query.status = args.status;
        const leads = await Lead.find(query)
          .sort({ 'aiScore.score': -1, dealValue: -1 })
          .limit(limit)
          .select('name company email status dealValue aiScore createdAt');
        if (!leads.length) return { dataAvailable: false, message: 'No leads matching that filter.' };
        const nowMs = Date.now();
        return {
          dataAvailable: true,
          count: leads.length,
          leads: leads.map((l: any) => ({
            id: l._id,
            name: l.name,
            company: l.company || '—',
            email: l.email,
            status: l.status,
            dealValue: l.dealValue,
            aiScore: l.aiScore?.score ?? null,
            daysSinceCreated: Math.floor((nowMs - new Date(l.createdAt).getTime()) / 86400000),
          })),
        };
      }

      // ── Customers list ─────────────────────────────────────────────────────
      case 'getCustomers': {
        const limit = Math.min(Number(args.limit) || 10, 50);
        const query: any = { workspaceId: wsId };
        if (args.churnRisk) query.churnRisk = args.churnRisk;
        const customers = await Customer.find(query)
          .sort({ healthScore: 1 })
          .limit(limit)
          .select('name company email healthScore churnRisk mrr lastContactDate');
        if (!customers.length) return { dataAvailable: false, message: 'No customers found.' };
        return {
          dataAvailable: true,
          count: customers.length,
          customers: customers.map((c: any) => ({
            id: c._id,
            name: c.name,
            company: c.company || '—',
            healthScore: c.healthScore ?? null,
            churnRisk: c.churnRisk ?? 'unknown',
            mrr: c.mrr ?? 0,
            lastContact: c.lastContactDate ?? null,
          })),
        };
      }

      // ── Customer Detail ────────────────────────────────────────────────────
      case 'getCustomerDetails': {
        let customer: any = null;
        if (args.customerId && mongoose.Types.ObjectId.isValid(args.customerId)) {
          customer = await Customer.findOne({
            _id: new mongoose.Types.ObjectId(args.customerId),
            workspaceId: wsId,
          });
        }
        if (!customer && args.customerName) {
          customer = await Customer.findOne({
            workspaceId: wsId,
            name: new RegExp(args.customerName.trim(), 'i'),
          });
        }
        if (!customer) return { dataAvailable: false, message: 'Customer not found in this workspace.' };
        return { dataAvailable: true, customer };
      }

      // ── Feedback ───────────────────────────────────────────────────────────
      case 'getCustomerFeedback': {
        const feedback = await Feedback.find({ workspaceId: wsId })
          .sort({ createdAt: -1 })
          .limit(30)
          .select('customerName sentiment topic urgency content');
        if (!feedback.length) return { dataAvailable: false, message: 'No feedback records found.' };
        const sc = { positive: 0, neutral: 0, negative: 0 };
        const tc: Record<string, number> = {};
        feedback.forEach((f) => {
          if (f.sentiment in sc) (sc as any)[f.sentiment]++;
          tc[f.topic] = (tc[f.topic] || 0) + 1;
        });
        return {
          dataAvailable: true,
          totalSampled: feedback.length,
          satisfactionRate: Math.round((sc.positive / feedback.length) * 1000) / 10,
          sentimentCounts: sc,
          topTopics: Object.entries(tc)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([topic, count]) => ({ topic, count })),
          highUrgencyIssues: feedback
            .filter((f) => f.sentiment === 'negative' && (f.urgency === 'high' || f.urgency === 'critical'))
            .map((f) => ({ customerName: f.customerName, topic: f.topic, content: f.content.slice(0, 200) })),
        };
      }

      // ── Projects ───────────────────────────────────────────────────────────
      case 'getProjectStatus': {
        const projects = await Project.find({ workspaceId: wsId })
          .select('name status priority progressPercentage dueDate')
          .sort({ createdAt: -1 });
        const tasks = await Task.find({ workspaceId: wsId })
          .select('title status priority dueDate')
          .sort({ dueDate: 1 });
        if (!projects.length && !tasks.length) {
          return { dataAvailable: false, message: 'No projects or tasks found in this workspace.' };
        }
        const now = new Date();
        const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done');
        const done = tasks.filter((t) => t.status === 'done');
        return {
          dataAvailable: true,
          totalProjects: projects.length,
          byStatus: {
            planning: projects.filter((p) => p.status === 'planning').length,
            active: projects.filter((p) => p.status === 'in_progress').length,
            completed: projects.filter((p) => p.status === 'completed').length,
            onHold: projects.filter((p) => p.status === 'on_hold').length,
          },
          projects: projects.slice(0, 8).map((p) => ({
            name: p.name,
            status: p.status,
            priority: p.priority,
            progress: (p as any).progressPercentage ?? 0,
            dueDate: p.dueDate ?? null,
          })),
          totalTasks: tasks.length,
          completedTasks: done.length,
          completionRate: tasks.length > 0
            ? Math.round((done.length / tasks.length) * 1000) / 10
            : 0,
          overdueTasksCount: overdue.length,
          overdueTasksList: overdue.slice(0, 6).map((t) => ({
            title: t.title,
            priority: t.priority,
            dueDate: t.dueDate,
          })),
        };
      }

      // ── Marketing ──────────────────────────────────────────────────────────
      case 'getMarketingMetrics': {
        const campaigns = await MarketingCampaign.find({ workspaceId: wsId })
          .select('name status platform performanceMetrics budget')
          .sort({ createdAt: -1 });
        if (!campaigns.length) return { dataAvailable: false, message: 'No marketing campaigns found.' };
        let ts = 0, tr = 0, tc = 0, ti = 0, tconv = 0;
        const perCampaign = campaigns.map((c: any) => {
          const m = c.performanceMetrics || {};
          ts += m.spend || 0;
          tr += m.revenue || 0;
          tc += m.clicks || 0;
          ti += m.impressions || 0;
          tconv += m.conversions || 0;
          const ctr = (m.impressions || 0) > 0 ? (m.clicks / m.impressions) * 100 : 0;
          const roi = (m.spend || 0) > 0 ? ((m.revenue - m.spend) / m.spend) * 100 : 0;
          return {
            name: c.name,
            platform: c.platform,
            status: c.status,
            spend: m.spend || 0,
            revenue: m.revenue || 0,
            ctr: Math.round(ctr * 100) / 100,
            roi: Math.round(roi * 100) / 100,
            conversions: m.conversions || 0,
          };
        });
        return {
          dataAvailable: true,
          campaignsCount: campaigns.length,
          totalSpend: Math.round(ts * 100) / 100,
          totalRevenue: Math.round(tr * 100) / 100,
          overallCtr: ti > 0 ? Math.round((tc / ti) * 10000) / 100 : 0,
          overallRoi: ts > 0 ? Math.round(((tr - ts) / ts) * 10000) / 100 : 0,
          cac: tconv > 0 ? Math.round((ts / tconv) * 100) / 100 : null,
          totalConversions: tconv,
          perCampaign: perCampaign.slice(0, 6),
        };
      }

      // ── RAG Document Search ────────────────────────────────────────────────
      case 'searchDocuments': {
        if (!args.query?.trim()) {
          return { dataAvailable: false, message: 'Search query is required.' };
        }
        const limit = Math.min(Number(args.limit) || 5, 10);
        const chunkCount = await DocumentChunk.countDocuments({ workspaceId: wsId });
        if (chunkCount === 0) {
          const docs = await DocumentModel.find({ workspaceId: wsId, status: 'ready' })
            .select('title summary keyInfo')
            .limit(10);
          if (!docs.length) {
            return { dataAvailable: false, message: 'No documents uploaded to this workspace yet.' };
          }
          return {
            dataAvailable: true,
            searchType: 'document_list_fallback',
            message: 'Documents exist but have no indexed chunks. Showing summaries.',
            results: docs.map((d) => ({
              documentTitle: d.title,
              summary: d.summary || '(no summary)',
              keyInfo: d.keyInfo?.slice(0, 3) || [],
            })),
          };
        }
        // Generate query embedding (lazy import avoids circular dependency)
        const { AIOrchestrator } = await import('./ai.orchestrator.js');
        const embedding = await AIOrchestrator.getInstance().generateEmbedding(args.query.trim());
        if (!embedding?.length) {
          return { dataAvailable: false, message: 'Embedding service unavailable.' };
        }
        const candidates = await DocumentChunk.find({ workspaceId: wsId })
          .populate('documentId', 'title')
          .limit(200)
          .select('content embedding chunkIndex documentId');
        // Cosine similarity (deterministic computation — no LLM)
        const cosine = (a: number[], b: number[]): number => {
          if (a.length !== b.length || !a.length) return 0;
          let dot = 0, ma = 0, mb = 0;
          for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            ma += a[i] * a[i];
            mb += b[i] * b[i];
          }
          const denom = Math.sqrt(ma) * Math.sqrt(mb);
          return denom === 0 ? 0 : dot / denom;
        };
        const scored = candidates
          .filter((c) => c.embedding?.length)
          .map((c) => ({
            score: cosine(embedding, c.embedding),
            content: c.content,
            title: (c.documentId as any)?.title ?? 'Unknown Document',
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
        if (!scored.length) {
          return { dataAvailable: false, message: 'No embedded chunks found. Re-process documents.' };
        }
        return {
          dataAvailable: true,
          searchType: 'semantic_similarity',
          query: args.query,
          results: scored.map((r) => ({
            documentTitle: r.title,
            relevanceScore: Math.round(r.score * 1000) / 1000,
            passage: r.content.slice(0, 600),
          })),
        };
      }

      // ── Action Proposals (no DB write — require explicit user approval) ────
      case 'createTask': {
        const title = (args.title || '').trim();
        if (!title) throw new Error('Task title is required');
        return {
          isActionProposal: true,
          actionType: 'createTask',
          payload: {
            title,
            description: (args.description || '').trim(),
            priority: args.priority || 'medium',
            dueDate: args.dueDate,
            projectId: args.projectId,
          },
          summary: `**Create Task:** "${title}" | Priority: ${args.priority || 'medium'}${args.dueDate ? ` | Due: ${args.dueDate}` : ''}`,
        };
      }

      case 'createProject': {
        const name = (args.name || '').trim();
        if (!name) throw new Error('Project name is required');
        return {
          isActionProposal: true,
          actionType: 'createProject',
          payload: {
            name,
            description: (args.description || '').trim(),
            priority: args.priority || 'medium',
            budget: Number(args.budget) || 0,
          },
          summary: `**Create Project:** "${name}"${args.budget ? ` | Budget: $${args.budget}` : ''}`,
        };
      }

      case 'createMarketingCampaign': {
        const name = (args.name || '').trim();
        if (!name) throw new Error('Campaign name is required');
        return {
          isActionProposal: true,
          actionType: 'createMarketingCampaign',
          payload: {
            name,
            product: (args.product || '').trim(),
            objective: (args.objective || '').trim(),
            platform: args.platform || 'Multi-Channel',
            budget: Number(args.budget) || 0,
          },
          summary: `**Create Campaign:** "${name}" on ${args.platform || 'Multi-Channel'}${args.budget ? ` | Budget: $${args.budget}` : ''}`,
        };
      }

      default:
        throw new Error(`Unknown tool: "${toolName}"`);
    }
  }
}
