import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate, resolveWorkspace);

router.get('/', LeadController.list);
router.post('/', requireRole('Employee'), LeadController.create);
router.get('/:id', LeadController.getById);
router.put('/:id', requireRole('Employee'), LeadController.update);
router.post('/:id/score', requireRole('Employee'), LeadController.scoreLead);
router.post('/:id/sales-assistant', LeadController.salesAssistant);
router.post('/:id/interactions', requireRole('Employee'), LeadController.addInteraction);
router.post('/:id/convert-to-customer', requireRole('Manager'), LeadController.convertToCustomer);
router.delete('/:id', requireRole('Manager'), LeadController.delete);

export default router;
