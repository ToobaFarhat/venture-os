import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerChurnRisk {
  level: 'low' | 'medium' | 'high';
  reasons: string[];
  recommendedAction: string;
  lastAssessedAt?: Date;
}

export interface CustomerDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  company: string;
  email: string;
  phone?: string;
  industry?: string;
  originLeadId?: mongoose.Types.ObjectId;
  lifetimeValue: number;
  status: 'active' | 'churn_risk' | 'churned';
  customerHealthScore: number; // 0-100
  churnRisk?: ICustomerChurnRisk;
  sentimentScore: number; // -1 to 1
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  supportTicketsCount: number;
  lastInteractionAt?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<CustomerDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    industry: { type: String, trim: true },
    originLeadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    lifetimeValue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'churn_risk', 'churned'],
      default: 'active',
      index: true,
    },
    customerHealthScore: { type: Number, min: 0, max: 100, default: 85 },
    churnRisk: {
      level: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
      reasons: [{ type: String }],
      recommendedAction: { type: String },
      lastAssessedAt: { type: Date },
    },
    sentimentScore: { type: Number, default: 0 },
    sentimentLabel: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'positive' },
    supportTicketsCount: { type: Number, default: 0 },
    lastInteractionAt: { type: Date },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

CustomerSchema.index({ workspaceId: 1, status: 1 });
CustomerSchema.index({ workspaceId: 1, customerHealthScore: 1 });
CustomerSchema.index({ workspaceId: 1, createdAt: -1 });

export const Customer = mongoose.model<CustomerDocument>('Customer', CustomerSchema);
