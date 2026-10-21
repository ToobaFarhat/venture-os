import mongoose, { Schema, Document } from 'mongoose';

export interface ISubtask {
  _id?: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
}

export interface ITaskComment {
  _id?: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ITaskAttachment {
  name: string;
  url: string;
  fileType: string;
  uploadedAt: Date;
}

export interface TaskDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: mongoose.Types.ObjectId;
  dueDate?: Date;
  subtasks: ISubtask[];
  originType: 'manual' | 'meeting' | 'crm_followup' | 'risk_recommendation' | 'ai_project_plan' | 'automation';
  originId?: mongoose.Types.ObjectId;
  comments: ITaskComment[];
  attachments: ITaskAttachment[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<TaskDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'done'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    dueDate: { type: Date },
    subtasks: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    originType: {
      type: String,
      enum: ['manual', 'meeting', 'crm_followup', 'risk_recommendation', 'ai_project_plan', 'automation'],
      default: 'manual',
    },
    originId: { type: Schema.Types.ObjectId },
    comments: [
      {
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        fileType: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

TaskSchema.index({ workspaceId: 1, status: 1 });
TaskSchema.index({ workspaceId: 1, assigneeId: 1 });
TaskSchema.index({ workspaceId: 1, dueDate: 1 });

export const Task = mongoose.model<TaskDocument>('Task', TaskSchema);
