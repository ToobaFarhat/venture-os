import mongoose from 'mongoose';
import { Lead, Customer, Feedback, Task, FinancialRecord } from '../models';
import { FinancialAnalyticsService } from './financial.analytics';
import { AIOrchestrator } from '../ai/ai.orchestrator';

export interface DetectedRiskItem {
  id: string;
  category: 'Sales' | 'Retention' | 'Finance' | 'Operations';
  severity: 'high' | 'medium' | 'low';
  title: string;
  evidence: string[];
  impact: string;
  recommendation: string;
  proposedAction?: {
    actionType: 'create_task' | 'create_campaign' | 'send_notification';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: any;
  };
}

export class CrossModuleRiskEngine {
  public static async evaluateRisks(workspaceId: string): Promise<DetectedRiskItem[]> {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const risks: DetectedRiskItem[] = [];

    // Signal 1: Customer Feedback & Churn Risk
    const negativeFeedbacks = await Feedback.find({
      workspaceId: wsId,
      sentiment: 'negative',
    }).sort({ createdAt: -1 }).limit(10);

    const churnCustomers = await Customer.find({
      workspaceId: wsId,
      $or: [{ status: 'churn_risk' }, { customerHealthScore: { $lt: 70 } }],
    });

    if (negativeFeedbacks.length >= 2 || churnCustomers.length >= 1) {
      const pricingIssues = negativeFeedbacks.filter((f) => f.topic === 'pricing').length;
      risks.push({
        id: 'risk_retention_' + Date.now().toString().slice(-4),
        category: 'Retention',
        severity: churnCustomers.length >= 2 || negativeFeedbacks.length >= 4 ? 'high' : 'medium',
        title: 'Customer Churn & Retention Vulnerability',
        evidence: [
          `${churnCustomers.length} customer accounts flagged with health score < 70%`,
          `${negativeFeedbacks.length} recent negative feedback submissions recorded`,
          pricingIssues > 0 ? `${pricingIssues} complaints specifically cited pricing or billing` : 'Support response latency cited in feedback',
        ],
        impact: 'Potential loss of recurring monthly subscription revenue and diminished Net Promoter Score.',
        recommendation: 'Deploy a proactive customer success recovery workflow and launch a tailored retention promotion.',
        proposedAction: {
          actionType: 'create_task',
          title: 'Initiate Customer Retention Outreach for At-Risk Accounts',
          description: 'Conduct 1-on-1 executive review with customers who submitted negative feedback in the last 14 days.',
          priority: 'urgent',
          metadata: { affectedCustomerIds: churnCustomers.map((c) => c._id) },
        },
      });
    }

    // Signal 2: Project Delays & Operational Bottlenecks
    const overdueTasks = await Task.find({
      workspaceId: wsId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    });

    if (overdueTasks.length >= 2) {
      risks.push({
        id: 'risk_ops_' + Date.now().toString().slice(-4),
        category: 'Operations',
        severity: overdueTasks.length >= 5 ? 'high' : 'medium',
        title: 'Project Delivery & Milestone Delays',
        evidence: [
          `${overdueTasks.length} active tasks currently past their assigned due date`,
          `Key blockers identified in: ${overdueTasks.slice(0, 3).map((t) => t.title).join(', ')}`,
        ],
        impact: 'Delays in client deliverable milestones risking SLA breaches or postponed product launches.',
        recommendation: 'Reassign backlog items to available team members and re-align milestone target dates.',
        proposedAction: {
          actionType: 'create_task',
          title: 'Emergency Sprint Triage: Unblock Overdue Tasks',
          description: 'Review blocked operational tasks and reallocate capacity across project team.',
          priority: 'high',
        },
      });
    }

    // Signal 3: Financial Runway & Burn Rate Pressure
    const finMetrics = await FinancialAnalyticsService.calculateMetrics(workspaceId);
    if (finMetrics.cashRunwayMonths < 4 || (finMetrics.netProfit < 0 && finMetrics.burnRateMonthly > 15000)) {
      risks.push({
        id: 'risk_fin_' + Date.now().toString().slice(-4),
        category: 'Finance',
        severity: finMetrics.cashRunwayMonths < 3 ? 'high' : 'medium',
        title: 'Cash Runway Compression',
        evidence: [
          `Estimated cash runway is currently ${finMetrics.cashRunwayMonths} months`,
          `Monthly burn rate averaging $${finMetrics.burnRateMonthly}`,
          finMetrics.netProfit < 0 ? `Net deficit of $${Math.abs(finMetrics.netProfit)} in recent operational period` : 'Operating margins compressed below 15%',
        ],
        impact: 'Risk of liquidity constraint within the next two quarters without cost rationalization or revenue injection.',
        recommendation: 'Audit non-essential software subscriptions and accelerate enterprise deal closing.',
        proposedAction: {
          actionType: 'create_task',
          title: 'Conduct Vendor & Operating Expense Audit',
          description: 'Identify software and discretionary expense reductions to extend runway by at least 3 months.',
          priority: 'urgent',
        },
      });
    }

    // Signal 4: CRM Pipeline Stagnation
    const staleLeads = await Lead.find({
      workspaceId: wsId,
      status: { $in: ['Contacted', 'Qualified', 'Proposal'] },
      updatedAt: { $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    });

    if (staleLeads.length >= 3) {
      risks.push({
        id: 'risk_sales_' + Date.now().toString().slice(-4),
        category: 'Sales',
        severity: 'medium',
        title: 'Sales Pipeline Velocity Slowdown',
        evidence: [
          `${staleLeads.length} qualified leads have experienced zero activity for over 14 days`,
          `Total deal value stalled in mid-funnel: $${staleLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0).toLocaleString()}`,
        ],
        impact: 'Decreased quarterly revenue attainment and higher probability of prospect disengagement.',
        recommendation: 'Execute an automated re-engagement campaign with personalized executive check-in emails.',
        proposedAction: {
          actionType: 'create_task',
          title: 'Sales Pipeline Re-engagement Blitz',
          description: 'Deploy follow-up sequences to 14-day stalled qualified opportunities.',
          priority: 'medium',
        },
      });
    }

    // If no high severity risks are triggered, return a healthy operational assessment
    if (risks.length === 0) {
      risks.push({
        id: 'risk_nominal',
        category: 'Operations',
        severity: 'low',
        title: 'Operational Equilibrium Maintained',
        evidence: [
          'No critical overdue project bottlenecks detected',
          'Customer sentiment ratio and retention benchmarks are stable',
          'Financial cash runway is within safe operating parameters',
        ],
        impact: 'Low immediate operational vulnerability.',
        recommendation: 'Continue monitoring leading indicators and maintain regular cadence of customer outreach.',
      });
    }

    return risks;
  }
}
