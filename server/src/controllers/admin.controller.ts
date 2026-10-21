import { Response } from 'express';
import { User, Workspace, WorkspaceMember, AIUsage, AuditLog, Automation } from '../models';
import { AuthenticatedRequest } from '../types';
import { toObjectId } from '../utils';
import mongoose from 'mongoose';

export class AdminController {
  public static async getSystemMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const wsId = toObjectId(req.workspace!.workspaceId);

      const [membersCount, auditLogsCount, automationsCount, aiUsageRecords] = await Promise.all([
        WorkspaceMember.countDocuments({ workspaceId: wsId }),
        AuditLog.countDocuments({ workspaceId: wsId }),
        Automation.countDocuments({ workspaceId: wsId }),
        AIUsage.find({ workspaceId: wsId }).sort({ createdAt: -1 }).limit(100),
      ]);

      let totalTokens = 0;
      let totalCost = 0;
      let failedAiRequests = 0;
      let latencySum = 0;

      aiUsageRecords.forEach((r) => {
        totalTokens += r.totalTokens || 0;
        totalCost += r.estimatedCost || 0;
        latencySum += r.latencyMs || 0;
        if (r.status === 'error') failedAiRequests++;
      });

      const avgLatencyMs = aiUsageRecords.length > 0 ? Math.round(latencySum / aiUsageRecords.length) : 0;

      res.status(200).json({
        success: true,
        data: {
          workspaceMembers: membersCount,
          totalAuditEvents: auditLogsCount,
          activeAutomations: automationsCount,
          aiMetrics: {
            totalRequests: aiUsageRecords.length,
            totalTokens,
            totalEstimatedCost: Number(totalCost.toFixed(4)),
            failedRequests: failedAiRequests,
            averageLatencyMs: avgLatencyMs,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch admin metrics' });
    }
  }

  public static async getAIUsageLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { limit = 50, skip = 0, module } = req.query;
      const query: any = { workspaceId: toObjectId(req.workspace!.workspaceId) };

      if (module) query.module = module;

      const logs = await AIUsage.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit));

      const total = await AIUsage.countDocuments(query);

      res.status(200).json({ success: true, data: { logs, total } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch AI usage logs' });
    }
  }

  public static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { resource, action, limit = 50, skip = 0 } = req.query;
      const query: any = { workspaceId: toObjectId(req.workspace!.workspaceId) };

      if (resource) query.resource = resource;
      if (action) query.action = action;

      const logs = await AuditLog.find(query)
        .populate('userId', 'name email avatarUrl')
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit));

      const total = await AuditLog.countDocuments(query);

      res.status(200).json({ success: true, data: { logs, total } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch audit logs' });
    }
  }

  public static async listAutomations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const automations = await Automation.find({
        workspaceId: toObjectId(req.workspace!.workspaceId),
      }).sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: automations });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to list automations' });
    }
  }

  public static async toggleAutomation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const automation = await Automation.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!automation) {
        res.status(404).json({ success: false, error: 'Automation not found' });
        return;
      }

      automation.isEnabled = !automation.isEnabled;
      await automation.save();

      res.status(200).json({
        success: true,
        message: `Automation ${automation.isEnabled ? 'enabled' : 'disabled'}`,
        data: automation,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to toggle automation' });
    }
  }
}
