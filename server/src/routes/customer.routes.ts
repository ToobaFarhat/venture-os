import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate, resolveWorkspace);

router.get('/', CustomerController.list);
router.post('/', requireRole('Employee'), CustomerController.create);
router.get('/:id', CustomerController.getById);
router.put('/:id', requireRole('Employee'), CustomerController.update);
router.post('/:id/assess-health', requireRole('Employee'), CustomerController.assessHealth);

export default router;
