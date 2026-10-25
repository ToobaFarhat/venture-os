import { Response } from 'express';
import { Feedback, Customer } from '../models';
import { AuthenticatedRequest } from '../types';
import { AIOrchestrator } from '../ai/ai.orchestrator';
import { AutomationEngine } from '../analytics/automation.engine';
import { AuditService } from '../services/audit.service';
import { parse as parseCsv } from 'csv-parse/sync';
import mongoose from 'mongoose';

export class FeedbackController {
  public static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sentiment, topic, limit = 50, skip = 0 } = req.query;
      const query: any = { workspaceId: new mongoose.Types.ObjectId(req.workspace!.workspaceId) };

      if (sentiment) query.sentiment = sentiment;
      if (topic) query.topic = topic;

      const feedbacks = await Feedback.find(query)
        .populate('customerId', 'name company email customerHealthScore')
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit));

      const total = await Feedback.countDocuments(query);

      res.status(200).json({ success: true, data: { feedbacks, total } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to list feedback' });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { customerId, customerName, contactNumber, content, source, rating } = req.body;

      if (!content || !customerName) {
        res.status(400).json({ success: false, error: 'Customer name and feedback content are required' });
        return;
      }

      // Link customer by name if customerId not explicitly provided
      let resolvedCustomerId = customerId ? new mongoose.Types.ObjectId(customerId) : undefined;
      if (!resolvedCustomerId && customerName) {
        const matchedCust = await Customer.findOne({
          workspaceId: new mongoose.Types.ObjectId(req.workspace!.workspaceId),
          $or: [
            { name: { $regex: new RegExp(`^${customerName.trim()}$`, 'i') } },
            { company: { $regex: new RegExp(`^${customerName.trim()}$`, 'i') } },
          ],
        });
        if (matchedCust) {
          resolvedCustomerId = matchedCust._id;
        }
      }

      // 1. Run AI Sentiment & Topic Analysis
      const prompt = `Analyze this customer feedback:
Customer: "${customerName}"
Feedback text: "${content}"

Extract sentiment, topic category, and urgency level.
Return a strict JSON object:
- "sentiment": "positive" | "neutral" | "negative"
- "sentimentScore": number between -1.0 (extremely negative) and 1.0 (extremely positive)
- "topic": "delivery" | "pricing" | "support" | "product" | "other"
- "urgency": "low" | "medium" | "high" | "critical"
- "suggestedAction": concrete recommended operational remedy`;

      const orchestrator = AIOrchestrator.getInstance();
      const aiRes = await orchestrator.generate(
        [
          { role: 'system', content: 'You are a customer experience and sentiment classification analyst. Return strict JSON only.' },
          { role: 'user', content: prompt },
        ],
        {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'feedback_analysis',
          responseFormat: 'json',
        }
      );

      let parsed: any = aiRes.parsedJson;
      if (!parsed && aiRes.content) {
        try {
          const m = aiRes.content.match(/\{[\s\S]*\}/);
          if (m) parsed = JSON.parse(m[0]);
        } catch {
          parsed = null;
        }
      }

      if (!parsed) {
        parsed = {
          sentiment: 'neutral',
          sentimentScore: 0,
          topic: 'product',
          urgency: 'low',
          suggestedAction: 'Review feedback during weekly sync.',
        };
      }

      const feedback = await Feedback.create({
        workspaceId: new mongoose.Types.ObjectId(req.workspace!.workspaceId),
        customerId: resolvedCustomerId,
        customerName: customerName.trim(),
        contactNumber: contactNumber ? contactNumber.trim() : undefined,
        content: content.trim(),
        source: source || 'Email Survey',
        rating: rating ? Number(rating) : undefined,
        sentiment: parsed.sentiment || 'neutral',
        sentimentScore: parsed.sentimentScore ?? 0,
        topic: parsed.topic || 'product',
        urgency: parsed.urgency || 'low',
        suggestedAction: parsed.suggestedAction || 'Review feedback during customer sync.',
        aiProcessed: true,
      });

      // 2. Downstream impact: Update Customer Health Score if customer is linked
      if (resolvedCustomerId) {
        const customer = await Customer.findOne({
          _id: resolvedCustomerId,
          workspaceId: new mongoose.Types.ObjectId(req.workspace!.workspaceId),
        });

        if (customer) {
          if (parsed.sentiment === 'negative') {
            customer.customerHealthScore = Math.max(20, customer.customerHealthScore - 15);
            customer.status = 'churn_risk';
            customer.sentimentLabel = 'negative';
          } else if (parsed.sentiment === 'positive') {
            customer.customerHealthScore = Math.min(100, customer.customerHealthScore + 5);
            customer.sentimentLabel = 'positive';
          }
          await customer.save();
        }
      }

      // 3. Trigger rule-based automation engine on negative sentiment
      await AutomationEngine.evaluateAndTrigger({
        workspaceId: req.workspace!.workspaceId,
        triggerType: 'negative_feedback',
        data: {
          name: customerName,
          sentiment: parsed.sentiment,
          urgency: parsed.urgency,
          feedbackId: feedback._id,
        },
      });

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'feedback.create',
        resource: 'Feedback',
        resourceId: feedback._id.toString(),
        details: { sentiment: feedback.sentiment, topic: feedback.topic, urgency: feedback.urgency },
      });

      res.status(201).json({
        success: true,
        message: 'Feedback recorded and processed by AI Sentiment Intelligence',
        data: feedback,
      });
    } catch (error: any) {
      console.error('[FeedbackController.create error]:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to record feedback' });
    }
  }

  public static async importCsv(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'CSV file is required' });
        return;
      }

      const fileBuffer = req.file.buffer || require('fs').readFileSync(req.file.path);
      const rows = parseCsv(fileBuffer.toString('utf-8'), { columns: true, skip_empty_lines: true });

      const wsId = new mongoose.Types.ObjectId(req.workspace!.workspaceId);
      let importedCount = 0;

      for (const row of rows) {
        const customerName = row.customerName || row.Name || row.Customer || 'Anonymous User';
        const content = row.content || row.Feedback || row.Review || row.Message;
        if (!content) continue;

        // Basic heuristic sentiment classifier for batch import
        const lower = content.toLowerCase();
        const isNegative = lower.includes('slow') || lower.includes('bad') || lower.includes('issue') || lower.includes('expensive');
        const isPositive = lower.includes('great') || lower.includes('love') || lower.includes('excellent') || lower.includes('fast');

        await Feedback.create({
          workspaceId: wsId,
          customerName,
          content,
          source: 'csv',
          rating: row.rating ? Number(row.rating) : isPositive ? 5 : isNegative ? 2 : 3,
          sentiment: isNegative ? 'negative' : isPositive ? 'positive' : 'neutral',
          sentimentScore: isNegative ? -0.7 : isPositive ? 0.8 : 0,
          topic: lower.includes('price') ? 'pricing' : lower.includes('delivery') ? 'delivery' : 'product',
          urgency: isNegative ? 'high' : 'low',
          aiProcessed: true,
        });

        importedCount++;
      }

      res.status(201).json({
        success: true,
        message: `Successfully imported ${importedCount} feedback records from CSV`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to import CSV' });
    }
  }

  public static async getTrends(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const wsId = new mongoose.Types.ObjectId(req.workspace!.workspaceId);
      const feedbacks = await Feedback.find({ workspaceId: wsId });

      const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
      const topicCounts: Record<string, number> = {
        delivery: 0,
        pricing: 0,
        support: 0,
        product: 0,
        other: 0,
      };

      feedbacks.forEach((f) => {
        if (sentimentCounts[f.sentiment] !== undefined) sentimentCounts[f.sentiment]++;
        if (topicCounts[f.topic] !== undefined) topicCounts[f.topic]++;
        else topicCounts.other++;
      });

      const total = feedbacks.length || 1;
      const topicPercentages = Object.entries(topicCounts).map(([topic, count]) => ({
        topic,
        count,
        percentage: Number(((count / total) * 100).toFixed(1)),
      }));

      res.status(200).json({
        success: true,
        data: {
          totalFeedbacks: feedbacks.length,
          sentimentCounts,
          topicDistribution: topicPercentages,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch feedback trends' });
    }
  }
}
