import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate, resolveWorkspace);

router.get('/', FinanceController.list);
router.post('/', requireRole('Manager'), FinanceController.create);
router.get('/summary', FinanceController.getSummary);
router.get('/forecast', FinanceController.getForecast);

export default router;
