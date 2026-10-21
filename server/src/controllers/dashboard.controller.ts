import { Response } from 'express';
import { Lead, Customer, Project, Task, Feedback, MarketingCampaign, FinancialRecord, Workspace } from '../models';
import { AuthenticatedRequest } from '../types';
import { FinancialAnalyticsService } from '../analytics/financial.analytics';
import { BusinessHealthService } from '../analytics/businessHealth.analytics';
import { CrossModuleRiskEngine } from '../analytics/risk.engine';
import { AIOrchestrator } from '../ai/ai.orchestrator';
import mongoose from 'mongoose';

export class DashboardController {
  public static async getDashboardData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const wsId = new mongoose.Types.ObjectId(req.workspace!.workspaceId);

      // 1. Source Business Data Aggregations
      const [leads, customers, projects, tasks, feedbackList, campaigns] = await Promise.all([
        Lead.find({ workspaceId: wsId }),
        Customer.find({ workspaceId: wsId }),
        Project.find({ workspaceId: wsId }),
        Task.find({ workspaceId: wsId }),
        Feedback.find({ workspaceId: wsId }),
        MarketingCampaign.find({ workspaceId: wsId }),
      ]);

      // Financials
      const finMetrics = await FinancialAnalyticsService.calculateMetrics(req.workspace!.workspaceId);

      // CRM Pipeline Funnel
      const pipelineStages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
      const pipelineCounts: Record<string, { count: number; totalValue: number }> = {};
      pipelineStages.forEach((s) => (pipelineCounts[s] = { count: 0, totalValue: 0 }));

      let wonDealsCount = 0;
      let closedDealsCount = 0;
      leads.forEach((l) => {
        if (pipelineCounts[l.status]) {
          pipelineCounts[l.status].count++;
          pipelineCounts[l.status].totalValue += l.dealValue || 0;
        }
        if (l.status === 'Won') wonDealsCount++;
        if (l.status === 'Won' || l.status === 'Lost') closedDealsCount++;
      });

      const conversionRate = closedDealsCount > 0 ? Number(((wonDealsCount / closedDealsCount) * 100).toFixed(1)) : 0;

      // Project & Task Statuses
      const completedTasks = tasks.filter((t) => t.status === 'done').length;
      const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

      // Customer Sentiment Breakdown
      const sentimentSummary = { positive: 0, neutral: 0, negative: 0 };
      feedbackList.forEach((f) => {
        if (sentimentSummary[f.sentiment] !== undefined) sentimentSummary[f.sentiment]++;
      });

      // 2. Deterministic Business Health & Risk Engine
      const healthReport = await BusinessHealthService.calculateHealth(req.workspace!.workspaceId);
      const activeRisks = await CrossModuleRiskEngine.evaluateRisks(req.workspace!.workspaceId);

      // 3. AI Strategic Insights (Distinguished from raw metrics)
      const prompt = `Review these verified operational facts:
- Total Revenue: $${finMetrics.totalRevenue} (MRR: $${finMetrics.mrr}, Net Profit: $${finMetrics.netProfit})
- Active Leads: ${leads.length} (Conversion Rate: ${conversionRate}%, Won Deals: ${wonDealsCount})
- Active Customers: ${customers.length} (Avg Health: ${healthReport.dimensions.customerHealth.score})
- Projects: ${projects.length} (${completedTasks}/${tasks.length} tasks done, ${overdueTasks} overdue)
- Top Risk: ${activeRisks[0]?.title || 'Nominal'}

Synthesize 3 concise, high-priority executive strategic insights for the dashboard.
Return a strict JSON array of objects with:
- "title": string
- "type": "opportunity" | "warning" | "achievement"
- "impact": string
- "recommendation": string`;

      const orchestrator = AIOrchestrator.getInstance();
      const aiRes = await orchestrator.generate(
        [
          { role: 'system', content: 'You are an executive operational analyst producing strict JSON output.' },
          { role: 'user', content: prompt },
        ],
        {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'dashboard_insights',
          responseFormat: 'json',
        }
      );

      const fallbackInsights = [
        {
          title: 'Healthy Revenue Momentum',
          type: 'achievement',
          impact: `Monthly recurring revenue is standing at $${finMetrics.mrr.toLocaleString()} with positive net margins.`,
          recommendation: 'Reinvest 15% of surplus into targeted top-of-funnel customer acquisition.',
        },
        {
          title: overdueTasks > 0 ? 'Operational Delivery Bottleneck' : 'High Delivery Velocity',
          type: overdueTasks > 0 ? 'warning' : 'achievement',
          impact: overdueTasks > 0 ? `${overdueTasks} overdue tasks risk milestone delivery.` : 'All project milestones on schedule.',
          recommendation: overdueTasks > 0 ? 'Reallocate engineering capacity to clear blocked tickets.' : 'Maintain current execution cadence.',
        },
        {
          title: 'Pipeline Acceleration Potential',
          type: 'opportunity',
          impact: `${leads.filter((l) => (l.aiScore?.score || 0) >= 75).length} qualified leads have high conversion probability.`,
          recommendation: 'Schedule executive follow-up meetings to close open proposals before month-end.',
        },
      ];

      res.status(200).json({
        success: true,
        data: {
          // Source Business Data
          sourceData: {
            kpis: {
              totalRevenue: finMetrics.totalRevenue,
              mrr: finMetrics.mrr,
              netProfit: finMetrics.netProfit,
              profitMargin: finMetrics.profitMarginPercent,
              cashRunwayMonths: finMetrics.cashRunwayMonths,
              totalLeads: leads.length,
              wonLeads: wonDealsCount,
              conversionRate,
              totalCustomers: customers.length,
              activeProjects: projects.filter((p) => p.status === 'in_progress').length,
              totalTasks: tasks.length,
              completedTasks,
              overdueTasks,
              customerSentiment: sentimentSummary,
            },
            charts: {
              revenueTrends: finMetrics.monthlyTrends,
              expensesByCategory: finMetrics.expensesByCategory,
              salesPipeline: Object.entries(pipelineCounts).map(([stage, data]) => ({
                stage,
                count: data.count,
                value: data.totalValue,
              })),
            },
          },
          // Deterministic Business Health
          businessHealth: healthReport,
          // Cross-Module Detected Risks
          risks: activeRisks,
          // AI-Generated Insights
          aiInsights: Array.isArray(aiRes.parsedJson) ? aiRes.parsedJson : fallbackInsights,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to aggregate dashboard data' });
    }
  }
}
