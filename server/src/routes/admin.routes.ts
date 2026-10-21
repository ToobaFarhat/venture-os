import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate, resolveWorkspace, requireRole('Admin'));

router.get('/metrics', AdminController.getSystemMetrics);
router.get('/ai-usage', AdminController.getAIUsageLogs);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/automations', AdminController.listAutomations);
router.post('/automations/:id/toggle', AdminController.toggleAutomation);

export default router;
