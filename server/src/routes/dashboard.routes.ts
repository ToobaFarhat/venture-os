import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';

const router = Router();

router.use(authenticate, resolveWorkspace);

router.get('/', DashboardController.getDashboardData);

export default router;
