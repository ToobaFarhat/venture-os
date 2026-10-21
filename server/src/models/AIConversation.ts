import mongoose, { Schema, Document } from 'mongoose';

export interface IToolCall {
  id: string;
  name: string;
  args: any;
}

export interface IToolResult {
  toolCallId: string;
  result: any;
}

export interface ICitation {
  documentTitle: string;
  documentId?: string;
  page?: number;
  section?: string;
  textSnippet: string;
}

export interface IActionProposal {
  actionType: 'createTask' | 'createProject' | 'createMarketingCampaign';
  payload: any;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  executedResult?: any;
}

export interface IMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: IToolCall[];
  toolResults?: IToolResult[];
  citations?: ICitation[];
  actionProposal?: IActionProposal;
  createdAt: Date;
}

export interface AIConversationDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const AIConversationSchema = new Schema<AIConversationDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New Conversation' },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant', 'tool'], required: true },
        content: { type: String, required: true },
        toolCalls: [
          {
            id: { type: String },
            name: { type: String },
            args: { type: Schema.Types.Mixed },
          },
        ],
        toolResults: [
          {
            toolCallId: { type: String },
            result: { type: Schema.Types.Mixed },
          },
        ],
        citations: [
          {
            documentTitle: { type: String },
            documentId: { type: String },
            page: { type: Number },
            section: { type: String },
            textSnippet: { type: String },
          },
        ],
        actionProposal: {
          actionType: { type: String },
          payload: { type: Schema.Types.Mixed },
          status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'executed'],
            default: 'pending',
          },
          executedResult: { type: Schema.Types.Mixed },
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

AIConversationSchema.index({ workspaceId: 1, userId: 1, updatedAt: -1 });

export const AIConversation = mongoose.model<AIConversationDocument>('AIConversation', AIConversationSchema);
