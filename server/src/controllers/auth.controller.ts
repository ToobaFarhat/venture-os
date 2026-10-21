import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Workspace, WorkspaceMember } from '../models';
import { config } from '../config';
import { AuthenticatedRequest } from '../types';
import { AuditService } from '../services/audit.service';

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

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        isEmailVerified: true,
      });

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
        message: 'Account registered successfully',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            preferences: user.preferences,
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

      // Retrieve workspaces user belongs to
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
          role: m.role,
        }));

      const activeWorkspace = workspaces[0] || null;

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
          ipAddress: req.ip,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            preferences: user.preferences,
            notificationSettings: user.notificationSettings,
          },
          workspaces,
          activeWorkspace,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Login failed' });
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
