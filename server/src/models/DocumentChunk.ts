import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentChunkMetadata {
  page?: number;
  section?: string;
  wordCount?: number;
}

export interface DocumentChunkDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  chunkIndex: number;
  content: string;
  embedding: number[];
  tokenCount: number;
  metadata: IDocumentChunkMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentChunkSchema = new Schema<DocumentChunkDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    embedding: [{ type: Number }],
    tokenCount: { type: Number, default: 0 },
    metadata: {
      page: { type: Number },
      section: { type: String },
      wordCount: { type: Number },
    },
  },
  { timestamps: true }
);

DocumentChunkSchema.index({ workspaceId: 1, documentId: 1, chunkIndex: 1 }, { unique: true });
DocumentChunkSchema.index({ workspaceId: 1, createdAt: -1 });

export const DocumentChunk = mongoose.model<DocumentChunkDocument>('DocumentChunk', DocumentChunkSchema);
