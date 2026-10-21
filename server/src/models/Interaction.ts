import mongoose, { Schema, Document } from 'mongoose';

export interface InteractionDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  entityType: 'Lead' | 'Customer';
  entityId: mongoose.Types.ObjectId;
  type: 'call' | 'email' | 'meeting' | 'note' | 'proposal' | 'support';
  summary: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  conductedBy: mongoose.Types.ObjectId;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InteractionSchema = new Schema<InteractionDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    entityType: { type: String, enum: ['Lead', 'Customer'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'note', 'proposal', 'support'],
      required: true,
    },
    summary: { type: String, required: true },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    conductedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

InteractionSchema.index({ workspaceId: 1, entityId: 1, date: -1 });

export const Interaction = mongoose.model<InteractionDocument>('Interaction', InteractionSchema);
