import { Response, NextFunction } from 'express';
import { WorkspaceMember } from '../models';
import { AuthenticatedRequest, WorkspaceRole } from '../types';

export const resolveWorkspace = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User is not authenticated' });
      return;
    }

    const requestedWorkspaceId = (req.headers['x-workspace-id'] as string) || (req.query.workspaceId as string);

    let memberQuery: any = {
      userId: req.user.userId,
      status: 'active',
    };

    if (requestedWorkspaceId) {
      memberQuery.workspaceId = requestedWorkspaceId;
    }

    const membership = await WorkspaceMember.findOne(memberQuery).sort({ createdAt: 1 });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: requestedWorkspaceId
          ? 'Access denied: You do not have active membership in this workspace'
          : 'No active workspace found for this user account. Please create or join a workspace.',
      });
      return;
    }

    req.workspace = {
      workspaceId: membership.workspaceId.toString(),
      role: membership.role as WorkspaceRole,
    };

    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error validating workspace membership',
      details: error.message,
    });
  }
};
