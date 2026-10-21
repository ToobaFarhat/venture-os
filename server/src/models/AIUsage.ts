import mongoose, { Schema, Document } from 'mongoose';

export interface AIUsageDocument extends Omit<Document, 'model'> {
  workspaceId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  module: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number; // in USD
  latencyMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
  createdAt: Date;
}

const AIUsageSchema = new Schema<AIUsageDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    module: { type: String, required: true, index: true },
    model: { type: String, required: true },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    estimatedCost: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
    status: { type: String, enum: ['success', 'error'], required: true, index: true },
    errorMessage: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AIUsageSchema.index({ workspaceId: 1, createdAt: -1 });
AIUsageSchema.index({ workspaceId: 1, module: 1 });

export const AIUsage = mongoose.model<AIUsageDocument>('AIUsage', AIUsageSchema);
