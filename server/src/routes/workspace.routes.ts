import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspace.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.post('/', WorkspaceController.create);
router.get('/details', resolveWorkspace, WorkspaceController.getDetails);
router.put('/profile', resolveWorkspace, requireRole('Admin'), WorkspaceController.updateProfile);
router.get('/members', resolveWorkspace, WorkspaceController.getMembers);
router.post('/members/invite', resolveWorkspace, requireRole('Admin'), WorkspaceController.inviteMember);
router.put('/members/:memberId/role', resolveWorkspace, requireRole('Owner'), WorkspaceController.updateMemberRole);

export default router;
