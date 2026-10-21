import { AuditLog } from '../models';
import mongoose from 'mongoose';

export interface CreateAuditLogParams {
  workspaceId: string | mongoose.Types.ObjectId;
  userId?: string | mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  public static async record(params: CreateAuditLogParams): Promise<void> {
    try {
      await AuditLog.create({
        workspaceId: new mongoose.Types.ObjectId(params.workspaceId.toString()),
        userId: params.userId ? new mongoose.Types.ObjectId(params.userId.toString()) : undefined,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
    } catch (err) {
      console.error('[AuditService] Failed to record audit log:', err);
    }
  }

  public static async getLogs(workspaceId: string, limit = 50, skip = 0) {
    return AuditLog.find({ workspaceId: new mongoose.Types.ObjectId(workspaceId) })
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }
}
