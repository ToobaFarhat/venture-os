import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate, resolveWorkspace);

router.get('/', ProjectController.listProjects);
router.post('/', requireRole('Manager'), ProjectController.createProject);
router.get('/tasks', ProjectController.listTasks);
router.post('/tasks', requireRole('Employee'), ProjectController.createTask);
router.put('/tasks/:id', requireRole('Employee'), ProjectController.updateTask);
router.post('/ai-planner', requireRole('Manager'), ProjectController.planProjectWithAI);
router.post('/ai-planner/approve', requireRole('Manager'), ProjectController.approveAIProjectPlan);

export default router;
