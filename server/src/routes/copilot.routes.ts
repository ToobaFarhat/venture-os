import { Router } from 'express';
import { CopilotController } from '../controllers/copilot.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate, resolveWorkspace);

router.post('/chat', CopilotController.chat);
router.post('/approve-action', requireRole('Employee'), CopilotController.approveAction);
router.get('/history', CopilotController.getHistory);
router.get('/conversation/:id', CopilotController.getConversation);

export default router;
