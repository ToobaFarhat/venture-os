import { Response } from 'express';
import { Competitor, Workspace } from '../models';
import { AuthenticatedRequest } from '../types';
import { AIOrchestrator } from '../ai/ai.orchestrator';
import { AuditService } from '../services/audit.service';
import { toObjectId } from '../utils';

export class CompetitorController {
  public static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const competitors = await Competitor.find({
        workspaceId: toObjectId(req.workspace!.workspaceId),
      }).sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: competitors });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to list competitors' });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyName, website, products, pricingModel, pricingDetails, targetAudience, features } = req.body;

      if (!companyName) {
        res.status(400).json({ success: false, error: 'Competitor company name is required' });
        return;
      }

      const competitor = await Competitor.create({
        workspaceId: toObjectId(req.workspace!.workspaceId),
        companyName: companyName.trim(),
        website: website?.trim(),
        products: products || [],
        pricingModel,
        pricingDetails,
        targetAudience,
        features: features || [],
      });

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'competitor.create',
        resource: 'Competitor',
        resourceId: competitor._id.toString(),
        details: { companyName: competitor.companyName },
      });

      res.status(201).json({ success: true, message: 'Competitor profile created', data: competitor });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to create competitor' });
    }
  }

  public static async analyze(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const competitor = await Competitor.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!competitor) {
        res.status(404).json({ success: false, error: 'Competitor not found' });
        return;
      }

      const workspace = await Workspace.findById(req.workspace!.workspaceId);

      const prompt = `You are the VentureOS Competitive Intelligence Analyst.
Analyze our competitor relative to our company profile:

Our Company:
Name: ${workspace?.name}
Industry: ${workspace?.industry}
Description: ${workspace?.description}
Target Audience: ${workspace?.targetAudience}

Competitor:
Name: ${competitor.companyName}
Website: ${competitor.website || 'N/A'}
Products: ${competitor.products.join(', ') || 'Enterprise Solutions'}
Pricing Model: ${competitor.pricingModel || 'Subscription'} (${competitor.pricingDetails || 'Unspecified'})
Target Audience: ${competitor.targetAudience || 'General'}
Features: ${competitor.features.join(', ') || 'General capabilities'}

Produce a structured competitive dossier in strict JSON:
- "strengths": array of 2-3 competitor strengths
- "weaknesses": array of 2-3 competitor weaknesses
- "pricingComparison": concise comparative pricing evaluation
- "positioningComparison": how to position our solution against them
- "marketGaps": array of 2-3 unserved gaps in the market
- "opportunities": array of 2 strategic opportunities for us
- "threats": array of 2 potential threats`;

      const orchestrator = AIOrchestrator.getInstance();
      const aiRes = await orchestrator.generate(
        [
          { role: 'system', content: 'You are an executive competitive intelligence strategist.' },
          { role: 'user', content: prompt },
        ],
        {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'competitor_intelligence',
          responseFormat: 'json',
        }
      );

      competitor.aiAnalysis = {
        strengths: aiRes.parsedJson?.strengths || ['Brand presence'],
        weaknesses: aiRes.parsedJson?.weaknesses || ['Higher complexity'],
        pricingComparison: aiRes.parsedJson?.pricingComparison || 'Competitor charges premium enterprise rates.',
        positioningComparison: aiRes.parsedJson?.positioningComparison || 'Position VentureOS as the modern AI-integrated operational platform.',
        marketGaps: aiRes.parsedJson?.marketGaps || ['Unified cross-module risk intelligence'],
        opportunities: aiRes.parsedJson?.opportunities || ['Target SMB and mid-market teams needing rapid deployment'],
        threats: aiRes.parsedJson?.threats || ['Feature replication in future quarters'],
        lastAnalyzedAt: new Date(),
      };

      await competitor.save();

      res.status(200).json({
        success: true,
        message: 'Competitor analyzed successfully',
        data: competitor,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to analyze competitor' });
    }
  }

  public static async generateMarketResearch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const workspace = await Workspace.findById(req.workspace!.workspaceId);
      const competitors = await Competitor.find({ workspaceId: req.workspace!.workspaceId });

      const prompt = `You are the VentureOS Strategic Market Research Director.
Generate a comprehensive Market Research and Go-To-Market report for:
Company: ${workspace?.name}
Industry: ${workspace?.industry}
Description: ${workspace?.description}
Target Audience: ${workspace?.targetAudience}
Tracked Competitors: ${competitors.map((c) => c.companyName).join(', ') || 'Industry incumbents'}

Return a strict JSON object with:
- "marketOverview": detailed macro analysis
- "targetAudience": ICP breakdown
- "customerPersonas": array of 2 persona descriptions
- "competitorAnalysis": summary of market dynamics
- "pricingStrategy": recommended pricing model
- "marketOpportunities": array of 3 key opportunities
- "risks": array of 3 operational or market risks
- "swot": object with "strengths" (array), "weaknesses" (array), "opportunities" (array), "threats" (array)
- "goToMarketStrategy": 3-stage GTM launch plan`;

      const orchestrator = AIOrchestrator.getInstance();
      const aiRes = await orchestrator.generate(
        [
          { role: 'system', content: 'You are a top-tier management consultant and market researcher.' },
          { role: 'user', content: prompt },
        ],
        {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'market_research',
          responseFormat: 'json',
        }
      );

      res.status(200).json({
        success: true,
        data: aiRes.parsedJson,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to generate market research report' });
    }
  }
}
