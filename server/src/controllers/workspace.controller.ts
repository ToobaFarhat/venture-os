import { Response } from 'express';
import { Workspace, WorkspaceMember, User } from '../models';
import { AuthenticatedRequest, WorkspaceRole } from '../types';
import { AuditService } from '../services/audit.service';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import { toObjectId } from '../utils';
import mongoose from 'mongoose';

export class WorkspaceController {
  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, industry, website, description, products, services, targetAudience, businessGoals } = req.body;

      if (!name) {
        res.status(400).json({ success: false, error: 'Workspace name is required' });
        return;
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

      const workspace = await Workspace.create({
        name: name.trim(),
        slug,
        industry: industry || 'Technology & Software',
        website: website || '',
        description: description || '',
        products: products || [],
        services: services || [],
        targetAudience: targetAudience || '',
        businessGoals: businessGoals || [],
        ownerId: toObjectId(req.user!.userId),
      });

      const member = await WorkspaceMember.create({
        workspaceId: workspace._id,
        userId: toObjectId(req.user!.userId),
        role: 'Owner',
        status: 'active',
      });

      await AuditService.record({
        workspaceId: workspace._id,
        userId: req.user!.userId,
        action: 'workspace.create',
        resource: 'Workspace',
        resourceId: workspace._id.toString(),
        details: { name: workspace.name, slug: workspace.slug },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Workspace created successfully',
        data: {
          workspace,
          role: member.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to create workspace' });
    }
  }

  public static async getDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const workspace = await Workspace.findById(toObjectId(req.workspace!.workspaceId));
      if (!workspace) {
        res.status(404).json({ success: false, error: 'Workspace not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          ...workspace.toObject(),
          currentUserRole: req.workspace!.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch workspace details' });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, industry, website, description, products, services, targetAudience, businessGoals, currency } = req.body;

      const workspace = await Workspace.findById(toObjectId(req.workspace!.workspaceId));
      if (!workspace) {
        res.status(404).json({ success: false, error: 'Workspace not found' });
        return;
      }

      if (name) workspace.name = name.trim();
      if (industry) workspace.industry = industry.trim();
      if (website !== undefined) workspace.website = website.trim();
      if (description !== undefined) workspace.description = description.trim();
      if (products) workspace.products = products;
      if (services) workspace.services = services;
      if (targetAudience !== undefined) workspace.targetAudience = targetAudience.trim();
      if (businessGoals) workspace.businessGoals = businessGoals;
      if (currency) workspace.currency = currency;

      await workspace.save();

      await AuditService.record({
        workspaceId: workspace._id,
        userId: req.user!.userId,
        action: 'workspace.update_profile',
        resource: 'Workspace',
        resourceId: workspace._id.toString(),
        details: { updatedFields: Object.keys(req.body) },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Company profile updated successfully',
        data: workspace,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to update company profile' });
    }
  }

  public static async getMembers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const members = await WorkspaceMember.find({
        workspaceId: toObjectId(req.workspace!.workspaceId),
      })
        .populate('userId', 'name email avatarUrl lastLoginAt')
        .sort({ joinedAt: 1 });

      res.status(200).json({
        success: true,
        data: members,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch members' });
    }
  }

  public static async inviteMember(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, role } = req.body;

      if (!email) {
        res.status(400).json({ success: false, error: 'Member email is required' });
        return;
      }

      const validRoles: WorkspaceRole[] = ['Owner', 'Admin', 'Manager', 'Employee', 'Viewer'];
      const memberRole: WorkspaceRole = validRoles.includes(role) ? role : 'Employee';

      const targetEmail = email.toLowerCase().trim();

      // Check if user is already a member
      const existingMember = await WorkspaceMember.findOne({
        workspaceId: toObjectId(req.workspace!.workspaceId),
        invitedEmail: targetEmail,
      });

      if (existingMember) {
        res.status(409).json({ success: false, error: 'User is already invited or a member of this workspace' });
        return;
      }

      // Check if registered user exists
      let user = await User.findOne({ email: targetEmail });
      if (!user) {
        user = await User.create({
          name: targetEmail.split('@')[0],
          email: targetEmail,
          passwordHash: 'pending_invitation',
          isEmailVerified: false,
        });
      }

      const newMember = await WorkspaceMember.create({
        workspaceId: toObjectId(req.workspace!.workspaceId),
        userId: user._id,
        role: memberRole,
        status: 'active',
        invitedEmail: targetEmail,
      });

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'workspace.invite_member',
        resource: 'WorkspaceMember',
        resourceId: newMember._id.toString(),
        details: { email: targetEmail, role: memberRole },
        ipAddress: req.ip,
      });

      await NotificationService.send({
        workspaceId: req.workspace!.workspaceId,
        userId: user._id,
        title: 'Workspace Invitation',
        message: `You have been added to the workspace as ${memberRole}`,
        type: 'system',
      });

      // Dispatch invitation email
      try {
        const currentWorkspace = await Workspace.findById(req.workspace!.workspaceId);
        const inviter = await User.findById(req.user!.userId);
        await EmailService.getInstance().sendWorkspaceInvitationEmail(
          targetEmail,
          inviter?.name || 'A team member',
          currentWorkspace?.name || 'VentureOS Workspace',
          memberRole
        );
      } catch (mailErr: any) {
        console.warn('[WorkspaceController] Invitation email delivery warning:', mailErr.message);
      }

      res.status(201).json({
        success: true,
        message: `Invited ${targetEmail} as ${memberRole}`,
        data: newMember,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to invite member' });
    }
  }

  public static async updateMemberRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { memberId } = req.params;
      const { role } = req.body;

      const validRoles: WorkspaceRole[] = ['Admin', 'Manager', 'Employee', 'Viewer'];
      if (!validRoles.includes(role)) {
        res.status(400).json({ success: false, error: 'Invalid role specified' });
        return;
      }

      const member = await WorkspaceMember.findOne({
        _id: toObjectId(memberId),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!member) {
        res.status(404).json({ success: false, error: 'Member not found in this workspace' });
        return;
      }

      if (member.role === 'Owner') {
        res.status(400).json({ success: false, error: 'Cannot change the primary Owner role' });
        return;
      }

      member.role = role;
      await member.save();

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'workspace.update_member_role',
        resource: 'WorkspaceMember',
        resourceId: member._id.toString(),
        details: { memberId, newRole: role },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Member role updated successfully',
        data: member,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to update member role' });
    }
  }
}
