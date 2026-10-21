import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import leadRoutes from './routes/lead.routes';
import customerRoutes from './routes/customer.routes';
import projectRoutes from './routes/project.routes';
import documentRoutes from './routes/document.routes';
import meetingRoutes from './routes/meeting.routes';
import marketingRoutes from './routes/marketing.routes';
import competitorRoutes from './routes/competitor.routes';
import financeRoutes from './routes/finance.routes';
import feedbackRoutes from './routes/feedback.routes';
import copilotRoutes from './routes/copilot.routes';
import dashboardRoutes from './routes/dashboard.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';

const app: Application = express();

// Security Headers & CORS
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        config.clientUrl,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
      ];

      // Allow exact match or any *.onrender.com deployment domain
      if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }

      callback(null, true); // Permissive in dev/staging to prevent CORS blocks
    },
    credentials: true,
  })
);

// Logging & Body parsing
if (config.env !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(config.upload.dir));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'VentureOS',
    timestamp: new Date().toISOString(),
    environment: config.env,
    aiProvider: config.ai.provider,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/competitors', competitorRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/ai/copilot', copilotRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
