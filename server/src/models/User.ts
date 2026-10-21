import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: true },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
      currency: { type: String, default: 'USD' },
    },
    notificationSettings: {
      emailAlerts: { type: Boolean, default: true },
      inAppAlerts: { type: Boolean, default: true },
      riskAlerts: { type: Boolean, default: true },
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', UserSchema);
