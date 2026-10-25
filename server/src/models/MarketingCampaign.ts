import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialPost {
  platform: string;
  postContent: string;
  hashtags: string[];
}

export interface IEmailSequence {
  step: number;
  subject: string;
  body: string;
}

export interface IAdCopy {
  headline: string;
  description: string;
  callToAction: string;
}

export interface ILandingPageCopy {
  heroHeadline: string;
  subhead: string;
  valueProps: string[];
  cta: string;
}

export interface IMarketingAIContent {
  strategy?: string;
  personas?: string[];
  contentPillars?: string[];
  ideas?: string[];
  socialPosts?: ISocialPost[];
  emailSequences?: IEmailSequence[];
  adCopy?: IAdCopy[];
  landingPageCopy?: ILandingPageCopy;
  ctas?: string[];
}

export interface IMarketingPerformanceMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number; // Click-through rate (%)
  conversionRate: number; // (%)
  cac: number; // Customer acquisition cost
  roi: number; // Return on investment (%)
}

export interface MarketingCampaignDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  product: string;
  objective: string;
  audience: string;
  platform: 'Email' | 'LinkedIn' | 'Twitter' | 'Google Ads' | 'Meta Ads' | 'SEO' | 'Multi-Channel';
  budget: number;
  startDate?: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  aiContent?: IMarketingAIContent;
  performanceMetrics: IMarketingPerformanceMetrics;
  aiRecommendations?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MarketingCampaignSchema = new Schema<MarketingCampaignDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    product: { type: String, required: true },
    objective: { type: String, required: true },
    audience: { type: String, required: true },
    platform: {
      type: String,
      default: 'Multi-Channel',
    },
    budget: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed'],
      default: 'draft',
      index: true,
    },
    aiContent: {
      strategy: { type: String },
      personas: [{ type: String }],
      contentPillars: [{ type: String }],
      ideas: [{ type: String }],
      socialPosts: [
        {
          platform: { type: String },
          postContent: { type: String },
          hashtags: [{ type: String }],
        },
      ],
      emailSequences: [
        {
          step: { type: Number },
          subject: { type: String },
          body: { type: String },
        },
      ],
      adCopy: [
        {
          headline: { type: String },
          description: { type: String },
          callToAction: { type: String },
        },
      ],
      landingPageCopy: {
        heroHeadline: { type: String },
        subhead: { type: String },
        valueProps: [{ type: String }],
        cta: { type: String },
      },
      ctas: [{ type: String }],
    },
    performanceMetrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      cac: { type: Number, default: 0 },
      roi: { type: Number, default: 0 },
    },
    aiRecommendations: [{ type: String }],
  },
  { timestamps: true }
);

MarketingCampaignSchema.index({ workspaceId: 1, status: 1 });
MarketingCampaignSchema.index({ workspaceId: 1, createdAt: -1 });

export const MarketingCampaign = mongoose.model<MarketingCampaignDocument>('MarketingCampaign', MarketingCampaignSchema);
