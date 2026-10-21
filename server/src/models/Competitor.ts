import mongoose, { Schema, Document } from 'mongoose';

export interface ICompetitorAnalysis {
  strengths: string[];
  weaknesses: string[];
  pricingComparison: string;
  positioningComparison: string;
  marketGaps: string[];
  opportunities: string[];
  threats: string[];
  lastAnalyzedAt?: Date;
}

export interface CompetitorDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  companyName: string;
  website?: string;
  products: string[];
  pricingModel?: string;
  pricingDetails?: string;
  targetAudience?: string;
  features: string[];
  aiAnalysis?: ICompetitorAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

const CompetitorSchema = new Schema<CompetitorDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    companyName: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    products: [{ type: String }],
    pricingModel: { type: String },
    pricingDetails: { type: String },
    targetAudience: { type: String },
    features: [{ type: String }],
    aiAnalysis: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      pricingComparison: { type: String },
      positioningComparison: { type: String },
      marketGaps: [{ type: String }],
      opportunities: [{ type: String }],
      threats: [{ type: String }],
      lastAnalyzedAt: { type: Date },
    },
  },
  { timestamps: true }
);

CompetitorSchema.index({ workspaceId: 1, companyName: 1 });

export const Competitor = mongoose.model<CompetitorDocument>('Competitor', CompetitorSchema);
