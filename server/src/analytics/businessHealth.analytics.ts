import mongoose from 'mongoose';
import { Lead, Customer, MarketingCampaign, Project, Task, Feedback, FinancialRecord } from '../models';
import { FinancialAnalyticsService } from './financial.analytics';
import { AIOrchestrator } from '../ai/ai.orchestrator';

export interface DimensionScore {
  score: number; // 0-100
  status: 'healthy' | 'warning' | 'critical';
  metricsSummary: string;
}

export interface BusinessHealthReport {
  overallScore: number;
  dimensions: {
    sales: DimensionScore;
    customerHealth: DimensionScore;
    marketing: DimensionScore;
    finance: DimensionScore;
    operations: DimensionScore;
  };
  aiExplanation: {
    overview: string;
    strengths: string[];
    weaknesses: string[];
    recommendedActions: string[];
  };
}

export class BusinessHealthService {
  public static async calculateHealth(workspaceId: string): Promise<BusinessHealthReport> {
    const wsId = new mongoose.Types.ObjectId(workspaceId);

    // 1. Sales Dimension
    const leads = await Lead.find({ workspaceId: wsId });
    const wonLeads = leads.filter((l) => l.status === 'Won').length;
    const totalClosed = leads.filter((l) => l.status === 'Won' || l.status === 'Lost').length;
    const winRate = totalClosed > 0 ? (wonLeads / totalClosed) * 100 : 40;
    const highScoringLeads = leads.filter((l) => (l.aiScore?.score || 0) >= 70).length;
    const salesScore = Math.min(100, Math.round((winRate * 0.6) + (Math.min(highScoringLeads, 10) * 4)));

    // 2. Customer Health Dimension
    const customers = await Customer.find({ workspaceId: wsId });
    const activeCustomers = customers.filter((c) => c.status === 'active').length;
    const avgHealth = customers.length > 0
      ? customers.reduce((sum, c) => sum + c.customerHealthScore, 0) / customers.length
      : 80;
    const feedbackList = await Feedback.find({ workspaceId: wsId });
    const positiveFeedback = feedbackList.filter((f) => f.sentiment === 'positive').length;
    const feedbackRatio = feedbackList.length > 0 ? (positiveFeedback / feedbackList.length) * 100 : 75;
    const customerHealthScore = Math.min(100, Math.round((avgHealth * 0.6) + (feedbackRatio * 0.4)));

    // 3. Marketing Dimension
    const campaigns = await MarketingCampaign.find({ workspaceId: wsId });
    let totalSpend = 0, totalRev = 0;
    campaigns.forEach((c) => {
      totalSpend += c.performanceMetrics.spend || 0;
      totalRev += c.performanceMetrics.revenue || 0;
    });
    const avgRoi = totalSpend > 0 ? ((totalRev - totalSpend) / totalSpend) * 100 : 80;
    const marketingScore = Math.min(100, Math.max(30, Math.round(50 + (avgRoi > 0 ? Math.min(avgRoi / 4, 50) : -20))));

    // 4. Financial Health Dimension
    const finMetrics = await FinancialAnalyticsService.calculateMetrics(workspaceId);
    let finScore = 50;
    if (finMetrics.netProfit > 0) finScore += 25;
    if (finMetrics.profitMarginPercent > 20) finScore += 15;
    if (finMetrics.cashRunwayMonths >= 6) finScore += 10;
    const financialScore = Math.min(100, Math.max(20, finScore));

    // 5. Operations Dimension
    const projects = await Project.find({ workspaceId: wsId });
    const tasks = await Task.find({ workspaceId: wsId });
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
    const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 70;
    const overduePenalty = tasks.length > 0 ? (overdueTasks / tasks.length) * 50 : 0;
    const operationsScore = Math.min(100, Math.max(15, Math.round(taskCompletionRate - overduePenalty + 15)));

    // Composite Overall Score (Weighted: Sales 25%, Customer 25%, Finance 25%, Operations 15%, Marketing 10%)
    const overallScore = Math.round(
      salesScore * 0.25 +
      customerHealthScore * 0.25 +
      financialScore * 0.25 +
      operationsScore * 0.15 +
      marketingScore * 0.10
    );

    const getStatus = (score: number): 'healthy' | 'warning' | 'critical' => {
      if (score >= 75) return 'healthy';
      if (score >= 50) return 'warning';
      return 'critical';
    };

    const dimensions = {
      sales: {
        score: salesScore,
        status: getStatus(salesScore),
        metricsSummary: `${wonLeads} won leads, ${winRate.toFixed(1)}% win rate, ${highScoringLeads} high-priority opportunities`,
      },
      customerHealth: {
        score: customerHealthScore,
        status: getStatus(customerHealthScore),
        metricsSummary: `${activeCustomers} active customers, ${avgHealth.toFixed(0)} avg health score, ${feedbackRatio.toFixed(0)}% positive sentiment`,
      },
      marketing: {
        score: marketingScore,
        status: getStatus(marketingScore),
        metricsSummary: `${campaigns.length} campaigns, ${avgRoi.toFixed(0)}% estimated ROI, $${totalRev} attributed revenue`,
      },
      finance: {
        score: financialScore,
        status: getStatus(financialScore),
        metricsSummary: `$${finMetrics.totalRevenue} revenue, $${finMetrics.netProfit} net profit, ${finMetrics.cashRunwayMonths}mo cash runway`,
      },
      operations: {
        score: operationsScore,
        status: getStatus(operationsScore),
        metricsSummary: `${projects.length} projects, ${taskCompletionRate.toFixed(0)}% task completion, ${overdueTasks} overdue bottlenecks`,
      },
    };

    // AI Qualitative Commentary
    const orchestrator = AIOrchestrator.getInstance();
    const prompt = `Review this company's business health evaluation:
- Overall Score: ${overallScore}/100
- Sales: ${salesScore}/100 (${dimensions.sales.metricsSummary})
- Customer Health: ${customerHealthScore}/100 (${dimensions.customerHealth.metricsSummary})
- Marketing: ${marketingScore}/100 (${dimensions.marketing.metricsSummary})
- Finance: ${financialScore}/100 (${dimensions.finance.metricsSummary})
- Operations: ${operationsScore}/100 (${dimensions.operations.metricsSummary})

Provide an executive explanation in JSON:
- "overview": 2-sentence summary of overall business state
- "strengths": 2-3 key competitive strengths
- "weaknesses": 2-3 operational risks or weak areas
- "recommendedActions": 3 concrete, high-priority actions`;

    const aiRes = await orchestrator.generate(
      [
        { role: 'system', content: 'You are an elite operational business consultant and enterprise advisor.' },
        { role: 'user', content: prompt },
      ],
      {
        workspaceId,
        module: 'business_health',
        responseFormat: 'json',
      }
    );

    const fallbackAI = {
      overview: `The business maintains an overall health score of ${overallScore}/100, showing strong foundational metrics across core operations and financial sustainability.`,
      strengths: [
        'Positive unit economics with healthy profit margins',
        'Strong customer retention and positive sentiment ratio',
      ],
      weaknesses: [
        overdueTasks > 0 ? `${overdueTasks} overdue operational tasks slowing down delivery` : 'Need for higher pipeline volume in sales',
        'Opportunities to optimize marketing ad-spend conversion rates',
      ],
      recommendedActions: [
        'Assign sprint resources to clear overdue operational tasks',
        'Execute targeted outreach to high-score qualified CRM leads',
        'Address recent customer feedback themes to prevent churn',
      ],
    };

    return {
      overallScore,
      dimensions,
      aiExplanation: aiRes.parsedJson || fallbackAI,
    };
  }
}
