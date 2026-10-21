import mongoose, { Schema, Document } from 'mongoose';

export interface FinancialRecordDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  recurring: boolean;
  customerId?: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FinancialRecordSchema = new Schema<FinancialRecordDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    type: {
      type: String,
      enum: ['revenue', 'expense'],
      required: true,
      index: true,
    },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    date: { type: Date, required: true, index: true },
    description: { type: String, default: '' },
    recurring: { type: Boolean, default: false },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

FinancialRecordSchema.index({ workspaceId: 1, type: 1, date: -1 });
FinancialRecordSchema.index({ workspaceId: 1, date: -1 });

export const FinancialRecord = mongoose.model<FinancialRecordDocument>('FinancialRecord', FinancialRecordSchema);
