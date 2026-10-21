import mongoose, { Schema, Document } from 'mongoose';

export interface FeedbackDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  source: 'manual' | 'csv' | 'review' | 'survey' | 'support_ticket';
  content: string;
  rating?: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -1 to 1
  topic: 'delivery' | 'pricing' | 'support' | 'product' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  aiProcessed: boolean;
  suggestedAction?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<FeedbackDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, required: true, trim: true },
    source: {
      type: String,
      enum: ['manual', 'csv', 'review', 'survey', 'support_ticket'],
      default: 'manual',
    },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
      index: true,
    },
    sentimentScore: { type: Number, default: 0 },
    topic: {
      type: String,
      enum: ['delivery', 'pricing', 'support', 'product', 'other'],
      default: 'product',
      index: true,
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    aiProcessed: { type: Boolean, default: false },
    suggestedAction: { type: String },
  },
  { timestamps: true }
);

FeedbackSchema.index({ workspaceId: 1, sentiment: 1 });
FeedbackSchema.index({ workspaceId: 1, topic: 1 });
FeedbackSchema.index({ workspaceId: 1, createdAt: -1 });

export const Feedback = mongoose.model<FeedbackDocument>('Feedback', FeedbackSchema);
