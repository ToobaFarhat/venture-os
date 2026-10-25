import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';
import { resolveWorkspace } from '../middleware/workspace';
import { requireRole } from '../middleware/rbac';
import { config } from '../config';

const router = Router();

// Ensure uploads dir exists
if (!fs.existsSync(config.upload.dir)) {
  fs.mkdirSync(config.upload.dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSizeMb * 1024 * 1024 },
});

router.use(authenticate, resolveWorkspace);

router.get('/', DocumentController.list);
router.post('/upload', requireRole('Employee'), upload.single('file'), DocumentController.upload);
router.get('/:id', DocumentController.getById);
router.post('/:id/reprocess', requireRole('Employee'), DocumentController.reprocess);
router.post('/rag/ask', DocumentController.askRAG);
router.delete('/:id', requireRole('Admin'), DocumentController.delete);

export default router;
