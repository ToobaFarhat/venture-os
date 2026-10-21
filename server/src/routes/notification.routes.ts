import { Router, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { AuthenticatedRequest } from '../types';
import { paramToString } from '../utils';

const router = Router();

router.use(authenticate, resolveWorkspace);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await NotificationService.getUserNotifications(
      req.workspace!.workspaceId,
      req.user!.userId
    );
    res.status(200).json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to list notifications' });
  }
});

router.put('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await NotificationService.markAsRead(paramToString(req.params.id), req.user!.userId);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update notification' });
  }
});

router.put('/read-all', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await NotificationService.markAllAsRead(req.workspace!.workspaceId, req.user!.userId);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update notifications' });
  }
});

export default router;
