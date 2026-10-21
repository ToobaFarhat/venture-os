import { Router } from 'express';
import { MarketingController } from '../controllers/marketing.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate, resolveWorkspace);

router.get('/', MarketingController.list);
router.post('/', requireRole('Employee'), MarketingController.create);
router.post('/:id/ai-content', requireRole('Employee'), MarketingController.generateAIContent);
router.post('/:id/metrics', requireRole('Employee'), MarketingController.recordMetrics);

export default router;
