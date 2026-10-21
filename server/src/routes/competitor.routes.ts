import { Router } from 'express';
import { CompetitorController } from '../controllers/competitor.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate, resolveWorkspace);

router.get('/', CompetitorController.list);
router.post('/', requireRole('Employee'), CompetitorController.create);
router.post('/:id/analyze', requireRole('Employee'), CompetitorController.analyze);
router.post('/market-research', requireRole('Employee'), CompetitorController.generateMarketResearch);

export default router;
