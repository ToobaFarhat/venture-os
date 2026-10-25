import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Workspace, WorkspaceMember } from '../models';
import { config } from '../config';
import { AuthenticatedRequest } from '../types';
import { AuditService } from '../services/audit.service';
import { EmailService } from '../services/email.service';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, companyName } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ success: false, error: 'Name, email, and password are required' });
        return;
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        res.status(409).json({ success: false, error: 'An account with this email address already exists' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        isEmailVerified: false,
        verificationToken,
        verificationExpires,
      });

      // Send verification email via EmailService
      try {
        await EmailService.getInstance().sendVerificationEmail(user.email, user.name, verificationToken);
      } catch (mailErr: any) {
        console.error('[AuthController] Failed to send verification email:', mailErr.message);
      }

      // Auto-create initial workspace if companyName is provided or default to personal company workspace
      const initialCompanyName = companyName?.trim() || `${user.name}'s Venture`;
      const slug = initialCompanyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

      const workspace = await Workspace.create({
        name: initialCompanyName,
        slug,
        ownerId: user._id,
      });

      await WorkspaceMember.create({
        workspaceId: workspace._id,
        userId: user._id,
        role: 'Owner',
        status: 'active',
      });

      await AuditService.record({
        workspaceId: workspace._id,
        userId: user._id,
        action: 'auth.register',
        resource: 'User',
        resourceId: user._id.toString(),
        details: { email: user.email, workspace: workspace.name },
        ipAddress: req.ip,
      });

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, name: user.name },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn as any }
      );

      res.status(201).json({
        success: true,
        message: 'Account registered successfully. Verification email dispatched.',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            preferences: user.preferences,
            isEmailVerified: user.isEmailVerified,
          },
          activeWorkspace: {
            id: workspace._id,
            name: workspace.name,
            slug: workspace.slug,
            role: 'Owner',
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Registration failed' });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      user.lastLoginAt = new Date();
      await user.save();

      // Retrieve all workspaces user is a member of
      const memberships = await WorkspaceMember.find({ userId: user._id, status: 'active' })
        .populate('workspaceId')
        .sort({ createdAt: 1 });

      const workspaces = memberships
        .filter((m) => m.workspaceId)
        .map((m: any) => ({
          id: m.workspaceId._id,
          name: m.workspaceId.name,
          slug: m.workspaceId.slug,
          industry: m.workspaceId.industry,
          description: m.workspaceId.description,
          role: m.role,
        }));

      let activeWorkspace = workspaces[0] || null;

      const requestedWorkspaceId = req.headers['x-workspace-id'] as string;
      if (requestedWorkspaceId) {
        const found = workspaces.find((w) => w.id.toString() === requestedWorkspaceId);
        if (found) activeWorkspace = found;
      }

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, name: user.name },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn as any }
      );

      if (activeWorkspace) {
        await AuditService.record({
          workspaceId: activeWorkspace.id,
          userId: user._id,
          action: 'auth.login',
          resource: 'User',
          resourceId: user._id.toString(),
          details: { ip: req.ip },
          ipAddress: req.ip,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            preferences: user.preferences,
            isEmailVerified: user.isEmailVerified,
          },
          workspaces,
          activeWorkspace,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Login failed' });
    }
  }

  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, error: 'Email address is required' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity
        await user.save();

        const delivery = await EmailService.getInstance().sendPasswordResetEmail(user.email, user.name, resetToken);

        if (!delivery.accepted && delivery.error) {
          console.warn('[AuthController] Password reset email delivery warning:', delivery.error);
        }
      }

      // Consistent message to prevent email enumeration
      res.status(200).json({
        success: true,
        message: 'If an account matches this email, a password reset link has been dispatched.',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Password reset request failed' });
    }
  }

  public static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(400).json({ success: false, error: 'Reset token and new password are required' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
        return;
      }

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        res.status(400).json({ success: false, error: 'Invalid or expired password reset token' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password has been successfully updated. You may now log in with your new credentials.',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Password reset failed' });
    }
  }

  public static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const token = (req.query.token as string) || req.body.token;

      if (!token) {
        res.status(400).json({ success: false, error: 'Verification token is required' });
        return;
      }

      const user = await User.findOne({
        verificationToken: token,
        verificationExpires: { $gt: new Date() },
      });

      if (!user) {
        res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
        return;
      }

      user.isEmailVerified = true;
      user.verificationToken = undefined;
      user.verificationExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Email successfully verified. Your account is fully active.',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Email verification failed' });
    }
  }

  public static async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, error: 'Email is required' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user && !user.isEmailVerified) {
        const token = crypto.randomBytes(32).toString('hex');
        user.verificationToken = token;
        user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        await EmailService.getInstance().sendVerificationEmail(user.email, user.name, token);
      }

      res.status(200).json({
        success: true,
        message: 'Verification link resent if account is unverified.',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Resend verification failed' });
    }
  }

  public static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const user = await User.findById(req.user.userId).select('-passwordHash');
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const memberships = await WorkspaceMember.find({ userId: user._id, status: 'active' })
        .populate('workspaceId')
        .sort({ createdAt: 1 });

      const workspaces = memberships
        .filter((m) => m.workspaceId)
        .map((m: any) => ({
          id: m.workspaceId._id,
          name: m.workspaceId.name,
          slug: m.workspaceId.slug,
          industry: m.workspaceId.industry,
          description: m.workspaceId.description,
          role: m.role,
        }));

      res.status(200).json({
        success: true,
        data: {
          user,
          workspaces,
          activeWorkspace: req.workspace || workspaces[0] || null,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch user session' });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { name, avatarUrl, preferences, notificationSettings } = req.body;
      const user = await User.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      if (name) user.name = name.trim();
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
      if (preferences) user.preferences = { ...user.preferences, ...preferences };
      if (notificationSettings) user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          preferences: user.preferences,
          notificationSettings: user.notificationSettings,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Profile update failed' });
    }
  }
}
