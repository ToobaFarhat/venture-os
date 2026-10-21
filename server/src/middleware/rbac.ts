import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, WorkspaceRole } from '../types';

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  Owner: 5,
  Admin: 4,
  Manager: 3,
  Employee: 2,
  Viewer: 1,
};

export const requireRole = (minRole: WorkspaceRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.workspace) {
      res.status(403).json({ success: false, error: 'Workspace context missing' });
      return;
    }

    const userRoleWeight = ROLE_HIERARCHY[req.workspace.role] || 0;
    const requiredRoleWeight = ROLE_HIERARCHY[minRole] || 0;

    if (userRoleWeight < requiredRoleWeight) {
      res.status(403).json({
        success: false,
        error: `Permission denied: Action requires at least '${minRole}' role (current role: '${req.workspace.role}')`,
      });
      return;
    }

    next();
  };
};

export const requireAnyRole = (allowedRoles: WorkspaceRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.workspace) {
      res.status(403).json({ success: false, error: 'Workspace context missing' });
      return;
    }

    if (!allowedRoles.includes(req.workspace.role)) {
      res.status(403).json({
        success: false,
        error: `Permission denied: Action requires one of [${allowedRoles.join(', ')}]`,
      });
      return;
    }

    next();
  };
};
