import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadStatusHistory {
  status: string;
  changedAt: Date;
  changedBy?: mongoose.Types.ObjectId;
  notes?: string;
}

export interface IAIScore {
  score: number;
  risk: 'low' | 'medium' | 'high';
  reasons: string[];
  recommendedAction: string;
  confidence: number;
  lastAnalyzedAt?: Date;
}

export interface LeadDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  company: string;
  email: string;
  phone?: string;
  industry?: string;
  source: string;
  dealValue: number;
  notes?: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  assignedEmployee?: mongoose.Types.ObjectId;
  aiScore?: IAIScore;
  statusHistory: ILeadStatusHistory[];
  tags: string[];
  convertedCustomerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<LeadDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    industry: { type: String, trim: true },
    source: { type: String, default: 'Website' },
    dealValue: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'],
      default: 'New',
      index: true,
    },
    assignedEmployee: { type: Schema.Types.ObjectId, ref: 'User' },
    aiScore: {
      score: { type: Number, min: 0, max: 100 },
      risk: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
      reasons: [{ type: String }],
      recommendedAction: { type: String },
      confidence: { type: Number, min: 0, max: 1 },
      lastAnalyzedAt: { type: Date },
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        notes: { type: String },
      },
    ],
    tags: [{ type: String }],
    convertedCustomerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  },
  { timestamps: true }
);

LeadSchema.index({ workspaceId: 1, status: 1 });
LeadSchema.index({ workspaceId: 1, 'aiScore.score': -1 });
LeadSchema.index({ workspaceId: 1, createdAt: -1 });

export const Lead = mongoose.model<LeadDocument>('Lead', LeadSchema);
