import { Router } from 'express';
import { MeetingController } from '../controllers/meeting.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate, resolveWorkspace);

router.get('/', MeetingController.list);
router.post('/analyze', requireRole('Employee'), MeetingController.analyzeMeeting);
router.post('/:meetingId/action-items/:actionItemId/approve', requireRole('Employee'), MeetingController.approveActionItem);

export default router;
