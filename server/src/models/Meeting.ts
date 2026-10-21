import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingActionItem {
  _id?: mongoose.Types.ObjectId;
  title: string;
  suggestedAssignee?: string;
  dueDate?: Date;
  status: 'pending' | 'approved' | 'rejected';
  createdTaskId?: mongoose.Types.ObjectId;
}

export interface MeetingDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  transcript: string;
  summary: string;
  keyDecisions: string[];
  requirements: string[];
  actionItems: IMeetingActionItem[];
  risks: string[];
  followUps: string[];
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<MeetingDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    transcript: { type: String, required: true },
    summary: { type: String, default: '' },
    keyDecisions: [{ type: String }],
    requirements: [{ type: String }],
    actionItems: [
      {
        title: { type: String, required: true },
        suggestedAssignee: { type: String },
        dueDate: { type: Date },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        createdTaskId: { type: Schema.Types.ObjectId, ref: 'Task' },
      },
    ],
    risks: [{ type: String }],
    followUps: [{ type: String }],
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

MeetingSchema.index({ workspaceId: 1, date: -1 });

export const Meeting = mongoose.model<MeetingDocument>('Meeting', MeetingSchema);
