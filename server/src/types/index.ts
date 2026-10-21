import { Request } from 'express';
import { Document, Types } from 'mongoose';

export type WorkspaceRole = 'Owner' | 'Admin' | 'Manager' | 'Employee' | 'Viewer';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    currency?: string;
  };
  notificationSettings?: {
    emailAlerts: boolean;
    inAppAlerts: boolean;
    riskAlerts: boolean;
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspace {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  industry?: string;
  website?: string;
  description?: string;
  products?: string[];
  services?: string[];
  targetAudience?: string;
  businessGoals?: string[];
  currency: string;
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspaceMember {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  userId: Types.ObjectId;
  role: WorkspaceRole;
  status: 'active' | 'invited';
  invitedEmail?: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
}

export interface AuthenticatedWorkspace {
  workspaceId: string;
  role: WorkspaceRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  workspace?: AuthenticatedWorkspace;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}
