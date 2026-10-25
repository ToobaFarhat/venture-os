import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/ventureos'
      : process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ventureos',
  jwt: {
    secret: process.env.JWT_SECRET || 'ventureos_super_secure_jwt_secret_dev_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  ai: {
    provider: (process.env.NODE_ENV === 'test' && !process.env.TEST_AI_LIVE
      ? 'mock'
      : (process.env.AI_PROVIDER || 'gemini')) as 'gemini' | 'openai' | 'anthropic' | 'mock',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.FROM_EMAIL || 'VentureOS <no-reply@ventureos.io>',
  },
  upload: {
    dir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '15', 10),
  }
};
