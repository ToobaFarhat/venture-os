import mongoose, { Schema, Document } from 'mongoose';

export interface IAutomationTriggerConfig {
  threshold?: number;
  condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  value?: string;
}

export interface IAutomationActionConfig {
  taskTitleTemplate?: string;
  taskPriority?: 'low' | 'medium' | 'high' | 'urgent';
  notificationTitle?: string;
  notificationMessage?: string;
  riskSeverity?: 'low' | 'medium' | 'high';
}

export interface AutomationDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  triggerType: 'lead_score_threshold' | 'negative_feedback' | 'revenue_drop' | 'task_overdue';
  triggerConfig: IAutomationTriggerConfig;
  actionType: 'create_task' | 'send_notification' | 'flag_risk';
  actionConfig: IAutomationActionConfig;
  isEnabled: boolean;
  executionCount: number;
  lastTriggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AutomationSchema = new Schema<AutomationDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    triggerType: {
      type: String,
      enum: ['lead_score_threshold', 'negative_feedback', 'revenue_drop', 'task_overdue'],
      required: true,
      index: true,
    },
    triggerConfig: {
      threshold: { type: Number },
      condition: { type: String, enum: ['gt', 'gte', 'lt', 'lte', 'eq'] },
      value: { type: String },
    },
    actionType: {
      type: String,
      enum: ['create_task', 'send_notification', 'flag_risk'],
      required: true,
    },
    actionConfig: {
      taskTitleTemplate: { type: String },
      taskPriority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'high' },
      notificationTitle: { type: String },
      notificationMessage: { type: String },
      riskSeverity: { type: String, enum: ['low', 'medium', 'high'], default: 'high' },
    },
    isEnabled: { type: Boolean, default: true },
    executionCount: { type: Number, default: 0 },
    lastTriggeredAt: { type: Date },
  },
  { timestamps: true }
);

AutomationSchema.index({ workspaceId: 1, isEnabled: 1, triggerType: 1 });

export const Automation = mongoose.model<AutomationDocument>('Automation', AutomationSchema);
