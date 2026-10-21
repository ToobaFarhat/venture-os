import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone {
  title: string;
  dueDate?: Date;
  completed: boolean;
}

export interface ProjectDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date;
  dueDate?: Date;
  ownerId?: mongoose.Types.ObjectId;
  budget: number;
  aiGenerated: boolean;
  progressPercentage: number;
  milestones: IMilestone[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
      default: 'planning',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    budget: { type: Number, default: 0 },
    aiGenerated: { type: Boolean, default: false },
    progressPercentage: { type: Number, min: 0, max: 100, default: 0 },
    milestones: [
      {
        title: { type: String, required: true },
        dueDate: { type: Date },
        completed: { type: Boolean, default: false },
      },
    ],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

ProjectSchema.index({ workspaceId: 1, status: 1 });
ProjectSchema.index({ workspaceId: 1, dueDate: 1 });

export const Project = mongoose.model<ProjectDocument>('Project', ProjectSchema);
