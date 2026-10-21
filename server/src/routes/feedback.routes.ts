import { Router } from 'express';
import multer from 'multer';
import { FeedbackController } from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { requireRole } from '../middleware/rbac';

const router = Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticate, resolveWorkspace);

router.get('/', FeedbackController.list);
router.post('/', requireRole('Employee'), FeedbackController.create);
router.post('/import-csv', requireRole('Manager'), upload.single('file'), FeedbackController.importCsv);
router.get('/trends', FeedbackController.getTrends);

export default router;
