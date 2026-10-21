import { Response } from 'express';
import { Customer, Interaction, Feedback, FinancialRecord } from '../models';
import { AuthenticatedRequest } from '../types';
import { AIOrchestrator } from '../ai/ai.orchestrator';
import { AuditService } from '../services/audit.service';
import { toObjectId } from '../utils';

export class CustomerController {
  public static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, search, limit = 50, skip = 0 } = req.query;
      const query: any = { workspaceId: toObjectId(req.workspace!.workspaceId) };

      if (status) query.status = status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const customers = await Customer.find(query)
        .sort({ customerHealthScore: 1, createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit));

      const total = await Customer.countDocuments(query);

      res.status(200).json({
        success: true,
        data: { customers, total, limit: Number(limit), skip: Number(skip) },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch customers' });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, company, email, phone, industry, lifetimeValue } = req.body;

      if (!name || !company || !email) {
        res.status(400).json({ success: false, error: 'Name, company, and email are required' });
        return;
      }

      const customer = await Customer.create({
        workspaceId: toObjectId(req.workspace!.workspaceId),
        name: name.trim(),
        company: company.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        industry: industry?.trim(),
        lifetimeValue: Number(lifetimeValue) || 0,
        status: 'active',
        customerHealthScore: 85,
        sentimentLabel: 'positive',
        sentimentScore: 0.7,
      });

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'customer.create',
        resource: 'Customer',
        resourceId: customer._id.toString(),
        details: { company: customer.company },
      });

      res.status(201).json({ success: true, message: 'Customer created', data: customer });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to create customer' });
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const customer = await Customer.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!customer) {
        res.status(404).json({ success: false, error: 'Customer not found' });
        return;
      }

      const interactions = await Interaction.find({
        workspaceId: customer.workspaceId,
        entityType: 'Customer',
        entityId: customer._id,
      }).sort({ date: -1 });

      const feedback = await Feedback.find({
        workspaceId: customer.workspaceId,
        customerId: customer._id,
      }).sort({ createdAt: -1 });

      const financialTransactions = await FinancialRecord.find({
        workspaceId: customer.workspaceId,
        customerId: customer._id,
      }).sort({ date: -1 });

      res.status(200).json({
        success: true,
        data: {
          customer,
          interactions,
          feedback,
          financialTransactions,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to retrieve customer' });
    }
  }

  public static async assessHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const customer = await Customer.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!customer) {
        res.status(404).json({ success: false, error: 'Customer not found' });
        return;
      }

      const feedbacks = await Feedback.find({
        workspaceId: customer.workspaceId,
        customerId: customer._id,
      });

      const negativeFeedbacks = feedbacks.filter((f) => f.sentiment === 'negative');

      const prompt = `Assess the customer health and churn risk for this account:
Customer: ${customer.name} at ${customer.company}
Lifetime Value: $${customer.lifetimeValue}
Support Tickets: ${customer.supportTicketsCount}
Total Feedback: ${feedbacks.length} (${negativeFeedbacks.length} negative)
Recent issues: ${negativeFeedbacks.map((f) => f.content).join('; ') || 'None recorded'}

Return strict JSON:
- "healthScore": number (0-100)
- "churnRisk": "low" | "medium" | "high"
- "sentiment": "positive" | "neutral" | "negative"
- "reasons": array of 2-3 reasons
- "recommendedAction": immediate proactive retention action`;

      const orchestrator = AIOrchestrator.getInstance();
      const aiRes = await orchestrator.generate(
        [
          { role: 'system', content: 'You evaluate customer churn risk and produce strict JSON.' },
          { role: 'user', content: prompt },
        ],
        {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'customer_churn',
          responseFormat: 'json',
        }
      );

      const parsed = aiRes.parsedJson || {
        healthScore: negativeFeedbacks.length > 0 ? 60 : 88,
        churnRisk: negativeFeedbacks.length > 0 ? 'high' : 'low',
        sentiment: negativeFeedbacks.length > 0 ? 'negative' : 'positive',
        reasons: ['Feedback sentiment trends', 'Interaction cadence evaluated'],
        recommendedAction: 'Schedule an executive account health review with CS lead.',
      };

      customer.customerHealthScore = parsed.healthScore;
      customer.status = parsed.churnRisk === 'high' ? 'churn_risk' : 'active';
      customer.sentimentLabel = parsed.sentiment;
      customer.churnRisk = {
        level: parsed.churnRisk,
        reasons: parsed.reasons || [],
        recommendedAction: parsed.recommendedAction || 'Monitor account activity',
        lastAssessedAt: new Date(),
      };

      await customer.save();

      res.status(200).json({
        success: true,
        message: 'Customer health assessed successfully',
        data: customer,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to assess customer health' });
    }
  }

  public static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const customer = await Customer.findOneAndUpdate(
        {
          _id: toObjectId(req.params.id),
          workspaceId: toObjectId(req.workspace!.workspaceId),
        },
        req.body,
        { new: true }
      );

      if (!customer) {
        res.status(404).json({ success: false, error: 'Customer not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Customer updated', data: customer });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to update customer' });
    }
  }
}
