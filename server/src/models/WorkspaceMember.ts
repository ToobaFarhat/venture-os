import mongoose, { Schema, Document } from 'mongoose';
import { IWorkspaceMember, WorkspaceRole } from '../types';

export interface WorkspaceMemberDocument extends Omit<IWorkspaceMember, '_id'>, Document {}

const WorkspaceMemberSchema = new Schema<WorkspaceMemberDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
      type: String,
      enum: ['Owner', 'Admin', 'Manager', 'Employee', 'Viewer'],
      required: true,
      default: 'Employee',
    },
    status: {
      type: String,
      enum: ['active', 'invited'],
      default: 'active',
    },
    invitedEmail: { type: String, lowercase: true, trim: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

WorkspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export const WorkspaceMember = mongoose.model<WorkspaceMemberDocument>('WorkspaceMember', WorkspaceMemberSchema);
