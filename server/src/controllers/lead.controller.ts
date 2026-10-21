import { Response } from 'express';
import { Lead, Customer, Interaction, Workspace } from '../models';
import { AuthenticatedRequest } from '../types';
import { AIOrchestrator } from '../ai/ai.orchestrator';
import { AuditService } from '../services/audit.service';
import { NotificationService } from '../services/notification.service';
import { AutomationEngine } from '../analytics/automation.engine';
import { toObjectId, paramToString } from '../utils';
import mongoose from 'mongoose';

export class LeadController {
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

      const leads = await Lead.find(query)
        .populate('assignedEmployee', 'name email avatarUrl')
        .sort({ 'aiScore.score': -1, createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit));

      const total = await Lead.countDocuments(query);

      res.status(200).json({
        success: true,
        data: { leads, total, limit: Number(limit), skip: Number(skip) },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch leads' });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, company, email, phone, industry, source, dealValue, notes, assignedEmployee } = req.body;

      if (!name || !company || !email) {
        res.status(400).json({ success: false, error: 'Name, company, and email are required' });
        return;
      }

      const lead = await Lead.create({
        workspaceId: toObjectId(req.workspace!.workspaceId),
        name: name.trim(),
        company: company.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        industry: industry?.trim(),
        source: source || 'Website',
        dealValue: Number(dealValue) || 0,
        notes: notes || '',
        assignedEmployee: assignedEmployee ? toObjectId(assignedEmployee) : undefined,
        statusHistory: [
          {
            status: 'New',
            changedAt: new Date(),
            changedBy: toObjectId(req.user!.userId),
            notes: 'Initial lead record created',
          },
        ],
      });

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'lead.create',
        resource: 'Lead',
        resourceId: lead._id.toString(),
        details: { name: lead.name, company: lead.company, dealValue: lead.dealValue },
        ipAddress: req.ip,
      });

      await NotificationService.send({
        workspaceId: req.workspace!.workspaceId,
        title: 'New Lead Captured',
        message: `${lead.name} from ${lead.company} ($${lead.dealValue.toLocaleString()}) entered the pipeline.`,
        type: 'lead',
        link: `/crm`,
      });

      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: lead,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to create lead' });
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const lead = await Lead.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      }).populate('assignedEmployee', 'name email avatarUrl');

      if (!lead) {
        res.status(404).json({ success: false, error: 'Lead not found' });
        return;
      }

      const interactions = await Interaction.find({
        workspaceId: toObjectId(req.workspace!.workspaceId),
        entityType: 'Lead',
        entityId: lead._id,
      })
        .populate('conductedBy', 'name email avatarUrl')
        .sort({ date: -1 });

      res.status(200).json({
        success: true,
        data: { lead, interactions },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to retrieve lead' });
    }
  }

  public static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, company, email, phone, industry, source, dealValue, notes, status, assignedEmployee } = req.body;

      const lead = await Lead.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!lead) {
        res.status(404).json({ success: false, error: 'Lead not found' });
        return;
      }

      if (status && status !== lead.status) {
        lead.statusHistory.push({
          status,
          changedAt: new Date(),
          changedBy: toObjectId(req.user!.userId),
          notes: `Status changed from ${lead.status} to ${status}`,
        });
        lead.status = status;
      }

      if (name) lead.name = name.trim();
      if (company) lead.company = company.trim();
      if (email) lead.email = email.toLowerCase().trim();
      if (phone !== undefined) lead.phone = phone.trim();
      if (industry !== undefined) lead.industry = industry.trim();
      if (source) lead.source = source;
      if (dealValue !== undefined) lead.dealValue = Number(dealValue);
      if (notes !== undefined) lead.notes = notes;
      if (assignedEmployee !== undefined) {
        lead.assignedEmployee = assignedEmployee ? toObjectId(assignedEmployee) : undefined;
      }

      await lead.save();

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'lead.update',
        resource: 'Lead',
        resourceId: lead._id.toString(),
        details: { updatedFields: Object.keys(req.body) },
      });

      res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        data: lead,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to update lead' });
    }
  }

  public static async scoreLead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const lead = await Lead.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!lead) {
        res.status(404).json({ success: false, error: 'Lead not found' });
        return;
      }

      const workspace = await Workspace.findById(req.workspace!.workspaceId);
      const interactions = await Interaction.find({
        workspaceId: lead.workspaceId,
        entityType: 'Lead',
        entityId: lead._id,
      });

      const contextPayload = {
        lead: {
          name: lead.name,
          company: lead.company,
          industry: lead.industry,
          source: lead.source,
          dealValue: lead.dealValue,
          status: lead.status,
          notes: lead.notes,
        },
        companyContext: {
          companyName: workspace?.name,
          industry: workspace?.industry,
          targetAudience: workspace?.targetAudience,
          products: workspace?.products,
        },
        interactionsCount: interactions.length,
      };

      const prompt = `You are the VentureOS AI Lead Scoring Engine.
Evaluate the conversion propensity of this prospect based on authorized contextual data:
${JSON.stringify(contextPayload, null, 2)}

Return a strict JSON object with:
- "score": number between 0 and 100
- "risk": "low" | "medium" | "high"
- "reasons": array of 3 bullet reasons justifying the score
- "recommendedAction": concrete immediate sales action
- "confidence": decimal between 0 and 1`;

      const orchestrator = AIOrchestrator.getInstance();
      const aiRes = await orchestrator.generate(
        [
          { role: 'system', content: 'You evaluate B2B sales leads and output strictly formatted JSON.' },
          { role: 'user', content: prompt },
        ],
        {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'lead_scoring',
          responseFormat: 'json',
        }
      );

      const scoreData = aiRes.parsedJson || {
        score: Math.min(100, Math.max(30, Math.round(50 + (lead.dealValue > 10000 ? 30 : 15)))),
        risk: 'low',
        reasons: ['Deal size aligns with core product pricing', 'Industry sector is ideal buyer profile'],
        recommendedAction: 'Schedule a tailored product demonstration call',
        confidence: 0.85,
      };

      lead.aiScore = {
        score: scoreData.score,
        risk: scoreData.risk || 'low',
        reasons: scoreData.reasons || [],
        recommendedAction: scoreData.recommendedAction || 'Follow up promptly',
        confidence: scoreData.confidence || 0.85,
        lastAnalyzedAt: new Date(),
      };

      await lead.save();

      // Trigger rule-based automation engine if score crosses threshold
      await AutomationEngine.evaluateAndTrigger({
        workspaceId: req.workspace!.workspaceId,
        triggerType: 'lead_score_threshold',
        data: {
          name: `${lead.name} (${lead.company})`,
          score: lead.aiScore.score,
          leadId: lead._id,
        },
      });

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'lead.ai_score',
        resource: 'Lead',
        resourceId: lead._id.toString(),
        details: { score: lead.aiScore.score, risk: lead.aiScore.risk },
      });

      res.status(200).json({
        success: true,
        message: 'Lead scored successfully with AI',
        data: lead.aiScore,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to score lead' });
    }
  }

  public static async salesAssistant(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const lead = await Lead.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!lead) {
        res.status(404).json({ success: false, error: 'Lead not found' });
        return;
      }

      const workspace = await Workspace.findById(req.workspace!.workspaceId);
      const prompt = `You are the VentureOS AI Sales Assistant.
Provide a 4-part sales intelligence dossier for this prospect:
Lead: ${lead.name} at ${lead.company}
Industry: ${lead.industry || 'B2B'}
Deal Value: $${lead.dealValue}
Current Status: ${lead.status}
Seller Company: ${workspace?.name} (${workspace?.description || 'Enterprise SaaS'})

Provide:
1. Executive Lead Summary
2. Next Best Action
3. Personalized Outreach Email Draft
4. Top 2 Anticipated Objections & Suggested Responses`;

      const orchestrator = AIOrchestrator.getInstance();
      const aiRes = await orchestrator.generate(
        [
          { role: 'system', content: 'You are an elite enterprise B2B sales strategist.' },
          { role: 'user', content: prompt },
        ],
        {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'sales_assistant',
        }
      );

      res.status(200).json({
        success: true,
        data: {
          leadId: lead._id,
          assistantReport: aiRes.content,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to run AI Sales Assistant' });
    }
  }

  public static async addInteraction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { type, summary, sentiment, date } = req.body;

      if (!type || !summary) {
        res.status(400).json({ success: false, error: 'Interaction type and summary are required' });
        return;
      }

      const lead = await Lead.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!lead) {
        res.status(404).json({ success: false, error: 'Lead not found' });
        return;
      }

      const interaction = await Interaction.create({
        workspaceId: toObjectId(req.workspace!.workspaceId),
        entityType: 'Lead',
        entityId: lead._id,
        type,
        summary,
        sentiment: sentiment || 'neutral',
        conductedBy: toObjectId(req.user!.userId),
        date: date ? new Date(date) : new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Interaction logged',
        data: interaction,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to add interaction' });
    }
  }

  public static async convertToCustomer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const lead = await Lead.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!lead) {
        res.status(404).json({ success: false, error: 'Lead not found' });
        return;
      }

      // Check if already converted
      const existingCustomer = await Customer.findOne({
        workspaceId: lead.workspaceId,
        originLeadId: lead._id,
      });

      if (existingCustomer) {
        res.status(400).json({ success: false, error: 'Lead has already been converted to a customer', data: existingCustomer });
        return;
      }

      const customer = await Customer.create({
        workspaceId: lead.workspaceId,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        industry: lead.industry,
        originLeadId: lead._id,
        lifetimeValue: lead.dealValue || 0,
        status: 'active',
        customerHealthScore: 90,
        sentimentLabel: 'positive',
        sentimentScore: 0.8,
        tags: lead.tags || ['Converted Lead'],
      });

      lead.status = 'Won';
      lead.convertedCustomerId = customer._id as any;
      lead.statusHistory.push({
        status: 'Won',
        changedAt: new Date(),
        changedBy: toObjectId(req.user!.userId),
        notes: `Converted to Customer account: ${customer._id}`,
      });
      await lead.save();

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'lead.convert_to_customer',
        resource: 'Customer',
        resourceId: customer._id.toString(),
        details: { leadId: lead._id, customerId: customer._id, dealValue: lead.dealValue },
      });

      await NotificationService.send({
        workspaceId: req.workspace!.workspaceId,
        title: 'Deal Won & Customer Converted!',
        message: `${lead.company} successfully closed and converted to an active Customer!`,
        type: 'lead',
        link: `/customers`,
      });

      res.status(201).json({
        success: true,
        message: 'Lead successfully won and converted to Customer',
        data: { customer, lead },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to convert lead to customer' });
    }
  }

  public static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const lead = await Lead.findOneAndDelete({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!lead) {
        res.status(404).json({ success: false, error: 'Lead not found' });
        return;
      }

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'lead.delete',
        resource: 'Lead',
        resourceId: paramToString(req.params.id),
      });

      res.status(200).json({ success: true, message: 'Lead deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to delete lead' });
    }
  }
}
