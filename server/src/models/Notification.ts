import mongoose, { Schema, Document } from 'mongoose';

export interface NotificationDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'lead' | 'task' | 'feedback' | 'risk' | 'automation' | 'system';
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['lead', 'task', 'feedback', 'risk', 'automation', 'system'],
      default: 'system',
    },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ workspaceId: 1, userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model<NotificationDocument>('Notification', NotificationSchema);
