import { Response } from 'express';
import { MarketingCampaign, Workspace } from '../models';
import { AuthenticatedRequest } from '../types';
import { AIOrchestrator } from '../ai/ai.orchestrator';
import { AuditService } from '../services/audit.service';
import { toObjectId } from '../utils';

export class MarketingController {
  public static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const campaigns = await MarketingCampaign.find({
        workspaceId: toObjectId(req.workspace!.workspaceId),
      }).sort({ createdAt: -1 });

      let aggregateSpend = 0;
      let aggregateRevenue = 0;
      let aggregateClicks = 0;
      let aggregateImpressions = 0;
      let aggregateConversions = 0;

      campaigns.forEach((c) => {
        const m = c.performanceMetrics;
        aggregateSpend += m.spend || 0;
        aggregateRevenue += m.revenue || 0;
        aggregateClicks += m.clicks || 0;
        aggregateImpressions += m.impressions || 0;
        aggregateConversions += m.conversions || 0;
      });

      const overallCtr = aggregateImpressions > 0 ? Number(((aggregateClicks / aggregateImpressions) * 100).toFixed(2)) : 0;
      const overallConvRate = aggregateClicks > 0 ? Number(((aggregateConversions / aggregateClicks) * 100).toFixed(2)) : 0;
      const overallRoi = aggregateSpend > 0 ? Number((((aggregateRevenue - aggregateSpend) / aggregateSpend) * 100).toFixed(2)) : 0;

      res.status(200).json({
        success: true,
        data: {
          campaigns,
          summary: {
            totalCampaigns: campaigns.length,
            aggregateSpend,
            aggregateRevenue,
            overallCtr,
            overallConvRate,
            overallRoi,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to list campaigns' });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, product, objective, audience, platform, budget, startDate, endDate } = req.body;

      if (!name || !product || !objective) {
        res.status(400).json({ success: false, error: 'Name, product, and objective are required' });
        return;
      }

      const campaign = await MarketingCampaign.create({
        workspaceId: toObjectId(req.workspace!.workspaceId),
        name: name.trim(),
        product: product.trim(),
        objective: objective.trim(),
        audience: audience || 'Growth stage B2B teams',
        platform: platform || 'Multi-Channel',
        budget: Number(budget) || 0,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status: 'draft',
      });

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'campaign.create',
        resource: 'MarketingCampaign',
        resourceId: campaign._id.toString(),
        details: { name: campaign.name, platform: campaign.platform },
      });

      res.status(201).json({ success: true, message: 'Campaign created', data: campaign });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to create campaign' });
    }
  }

  public static async generateAIContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const campaign = await MarketingCampaign.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!campaign) {
        res.status(404).json({ success: false, error: 'Campaign not found' });
        return;
      }

      const workspace = await Workspace.findById(req.workspace!.workspaceId);
      const prompt = `You are the VentureOS AI Marketing Studio.
Company: ${workspace?.name} (${workspace?.industry})
Company Value Proposition: ${workspace?.description || 'Unified B2B operations'}
Campaign Name: ${campaign.name}
Promoted Product: ${campaign.product}
Campaign Objective: ${campaign.objective}
Target Audience: ${campaign.audience}
Primary Platform: ${campaign.platform}
Budget: $${campaign.budget}

Generate a comprehensive marketing strategy and multi-channel creative assets.
Return a strict JSON object with:
- "strategy": high-level growth strategy
- "personas": array of 2 target personas
- "contentPillars": array of 3 key content pillars
- "ideas": array of 2 campaign creative concepts
- "socialPosts": array of objects with "platform", "postContent", and "hashtags" (array)
- "emailSequences": array of objects with "step" (number), "subject", "body"
- "adCopy": array of objects with "headline", "description", "callToAction"
- "landingPageCopy": object with "heroHeadline", "subhead", "valueProps" (array), "cta"
- "ctas": array of 3 recommended CTAs`;

      const orchestrator = AIOrchestrator.getInstance();
      const aiRes = await orchestrator.generate(
        [
          { role: 'system', content: 'You are an award-winning B2B SaaS growth marketer and copywriter.' },
          { role: 'user', content: prompt },
        ],
        {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'marketing_studio',
          responseFormat: 'json',
        }
      );

      const generated = aiRes.parsedJson || {
        strategy: 'Multi-touch outbound and inbound campaign targeting decision makers.',
        personas: ['RevOps Leader', 'Founding CEO'],
        contentPillars: ['Efficiency', 'Intelligence', 'ROI'],
        ideas: ['Operational assessment benchmark tool'],
        socialPosts: [{ platform: campaign.platform, postContent: 'Scale operations with VentureOS.', hashtags: ['#SaaS', '#Growth'] }],
        emailSequences: [{ step: 1, subject: 'Transform your operations', body: 'Discover how VentureOS connects your business.' }],
        adCopy: [{ headline: 'AI Business Intelligence', description: 'One unified platform.', callToAction: 'Try Free' }],
        landingPageCopy: { heroHeadline: 'Intelligent Operations', subhead: 'Connect CRM, PM, and Finance.', valueProps: ['Unified Data', 'AI Insights'], cta: 'Get Started' },
        ctas: ['Start Trial', 'Book Demo'],
      };

      campaign.aiContent = generated;
      await campaign.save();

      res.status(200).json({
        success: true,
        message: 'Marketing assets generated by AI Studio',
        data: campaign,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to generate campaign content' });
    }
  }

  public static async recordMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { impressions, clicks, conversions, spend, revenue } = req.body;

      const campaign = await MarketingCampaign.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!campaign) {
        res.status(404).json({ success: false, error: 'Campaign not found' });
        return;
      }

      const imp = Number(impressions) || campaign.performanceMetrics.impressions || 0;
      const clk = Number(clicks) || campaign.performanceMetrics.clicks || 0;
      const conv = Number(conversions) || campaign.performanceMetrics.conversions || 0;
      const sp = Number(spend) || campaign.performanceMetrics.spend || 0;
      const rev = Number(revenue) || campaign.performanceMetrics.revenue || 0;

      // Deterministic calculations
      const ctr = imp > 0 ? Number(((clk / imp) * 100).toFixed(2)) : 0;
      const conversionRate = clk > 0 ? Number(((conv / clk) * 100).toFixed(2)) : 0;
      const cac = conv > 0 ? Number((sp / conv).toFixed(2)) : 0;
      const roi = sp > 0 ? Number((((rev - sp) / sp) * 100).toFixed(2)) : 0;

      campaign.performanceMetrics = {
        impressions: imp,
        clicks: clk,
        conversions: conv,
        spend: sp,
        revenue: rev,
        ctr,
        conversionRate,
        cac,
        roi,
      };

      if (campaign.status === 'draft') campaign.status = 'active';

      // Generate AI optimization recommendations based on deterministic metrics
      const prompt = `Review campaign metrics:
Impressions: ${imp}
Clicks: ${clk} (CTR: ${ctr}%)
Conversions: ${conv} (Conversion Rate: ${conversionRate}%)
Spend: $${sp}
Revenue: $${rev} (ROI: ${roi}%, CAC: $${cac})

Provide 3 concise, bulleted strategic recommendations to optimize ROI.`;

      const orchestrator = AIOrchestrator.getInstance();
      const aiRes = await orchestrator.generate(
        [
          { role: 'system', content: 'You are a performance marketing analyst.' },
          { role: 'user', content: prompt },
        ],
        {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'marketing_studio',
        }
      );

      campaign.aiRecommendations = aiRes.content.split('\n').filter((l) => l.trim().length > 0);
      await campaign.save();

      res.status(200).json({
        success: true,
        message: 'Metrics recorded and deterministic analytics updated with AI recommendations',
        data: campaign,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to update campaign metrics' });
    }
  }
}
