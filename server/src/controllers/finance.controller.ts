import { Response } from 'express';
import { FinancialRecord, Customer } from '../models';
import { AuthenticatedRequest } from '../types';
import { FinancialAnalyticsService } from '../analytics/financial.analytics';
import { ForecastingService } from '../analytics/forecasting.analytics';
import { AIOrchestrator } from '../ai/ai.orchestrator';
import { AuditService } from '../services/audit.service';
import mongoose from 'mongoose';

export class FinanceController {
  public static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { type, category, limit = 100, skip = 0 } = req.query;
      const query: any = { workspaceId: new mongoose.Types.ObjectId(req.workspace!.workspaceId) };

      if (type) query.type = type;
      if (category) query.category = category;

      const records = await FinancialRecord.find(query)
        .sort({ date: -1 })
        .skip(Number(skip))
        .limit(Number(limit));

      const total = await FinancialRecord.countDocuments(query);

      res.status(200).json({ success: true, data: { records, total } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to list financial records' });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { type, category, amount, currency, date, description, recurring, customerId } = req.body;

      if (!type || !category || amount === undefined) {
        res.status(400).json({ success: false, error: 'Type, category, and amount are required' });
        return;
      }

      const record = await FinancialRecord.create({
        workspaceId: new mongoose.Types.ObjectId(req.workspace!.workspaceId),
        type,
        category: category.trim(),
        amount: Number(amount),
        currency: currency || 'USD',
        date: date ? new Date(date) : new Date(),
        description: description || '',
        recurring: Boolean(recurring),
        customerId: customerId ? new mongoose.Types.ObjectId(customerId) : undefined,
      });

      // If customerId is linked and type is revenue, update customer's lifetime value
      if (customerId && type === 'revenue') {
        await Customer.findByIdAndUpdate(customerId, {
          $inc: { lifetimeValue: Number(amount) },
        });
      }

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'finance.record_created',
        resource: 'FinancialRecord',
        resourceId: record._id.toString(),
        details: { type: record.type, amount: record.amount, category: record.category },
      });

      res.status(201).json({ success: true, message: 'Financial record logged', data: record });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to create financial record' });
    }
  }

  public static async getSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const metrics = await FinancialAnalyticsService.calculateMetrics(req.workspace!.workspaceId);

      // AI Contextual Explanation based strictly on verified calculations
      const prompt = `Review these verified financial metrics:
Total Revenue: $${metrics.totalRevenue}
Total Expenses: $${metrics.totalExpenses}
Net Profit: $${metrics.netProfit} (Margin: ${metrics.profitMarginPercent}%)
Monthly Recurring Revenue (MRR): $${metrics.mrr}
Monthly Burn Rate: $${metrics.burnRateMonthly}
Cash Runway: ${metrics.cashRunwayMonths} months
Estimated CAC: $${metrics.cac}, Estimated LTV: $${metrics.ltv}

Provide:
1. Executive interpretation of unit economics and margin health
2. 2 high-impact cost optimization or revenue expansion opportunities
3. Assessment of cash runway stability`;

      const orchestrator = AIOrchestrator.getInstance();
      const aiRes = await orchestrator.generate(
        [
          { role: 'system', content: 'You are an executive CFO providing grounded financial commentary.' },
          { role: 'user', content: prompt },
        ],
        {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'financial_insights',
        }
      );

      res.status(200).json({
        success: true,
        data: {
          metrics,
          aiCommentary: aiRes.content,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to calculate financial summary' });
    }
  }

  public static async getForecast(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const forecastReport = await ForecastingService.generateForecast(req.workspace!.workspaceId);

      res.status(200).json({
        success: true,
        data: forecastReport,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to generate financial forecast' });
    }
  }
}
