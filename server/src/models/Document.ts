import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';

export interface IDocumentDeadline {
  description: string;
  date?: string;
}

export interface DocumentModelDocument extends MongooseDoc {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  originalName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv';
  fileSize: number;
  storagePath: string;
  extractedText?: string;
  summary?: string;
  keyInfo: string[];
  requirements: string[];
  risks: string[];
  deadlines: IDocumentDeadline[];
  chunksCount: number;
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
  errorMessage?: string;
  uploadedBy: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<DocumentModelDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'docx', 'txt', 'csv'], required: true },
    fileSize: { type: Number, required: true },
    storagePath: { type: String, required: true },
    extractedText: { type: String },
    summary: { type: String },
    keyInfo: [{ type: String }],
    requirements: [{ type: String }],
    risks: [{ type: String }],
    deadlines: [
      {
        description: { type: String, required: true },
        date: { type: String },
      },
    ],
    chunksCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'ready', 'failed'],
      default: 'uploaded',
      index: true,
    },
    errorMessage: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

DocumentSchema.index({ workspaceId: 1, status: 1 });
DocumentSchema.index({ workspaceId: 1, createdAt: -1 });

export const DocumentModel = mongoose.model<DocumentModelDocument>('Document', DocumentSchema);
