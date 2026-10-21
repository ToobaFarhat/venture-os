import mongoose, { Schema, Document } from 'mongoose';
import { IWorkspace } from '../types';

export interface WorkspaceDocument extends Omit<IWorkspace, '_id'>, Document {}

const WorkspaceSchema = new Schema<WorkspaceDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    industry: { type: String, trim: true, default: 'Technology & Software' },
    website: { type: String, trim: true, default: '' },
    description: { type: String, default: '' },
    products: [{ type: String }],
    services: [{ type: String }],
    targetAudience: { type: String, default: '' },
    businessGoals: [{ type: String }],
    currency: { type: String, default: 'USD' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const Workspace = mongoose.model<WorkspaceDocument>('Workspace', WorkspaceSchema);
