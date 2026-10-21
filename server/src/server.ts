import app from './app';
import { config } from './config';
import { connectDatabase } from './config/database';

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`========================================================`);
      console.log(`🚀 VentureOS Core API Server running on port ${config.port} (0.0.0.0)`);
      console.log(`📊 Mode: ${config.env} | AI Provider: ${config.ai.provider}`);
      console.log(`🌐 Health check: http://0.0.0.0:${config.port}/api/health`);
      console.log(`========================================================`);
    });

    const shutdown = async () => {
      console.log('\n[VentureOS] Graceful shutdown initiated...');
      server.close(() => {
        console.log('[VentureOS] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[VentureOS] Server startup failure:', error);
    process.exit(1);
  }
};

startServer();
