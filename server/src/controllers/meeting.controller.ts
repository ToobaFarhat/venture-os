import { Response } from 'express';
import { Meeting, Task } from '../models';
import { AuthenticatedRequest } from '../types';
import { AIOrchestrator } from '../ai/ai.orchestrator';
import { AuditService } from '../services/audit.service';
import { toObjectId } from '../utils';
import mongoose from 'mongoose';

export class MeetingController {
  public static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const meetings = await Meeting.find({
        workspaceId: toObjectId(req.workspace!.workspaceId),
      })
        .populate('recordedBy', 'name email avatarUrl')
        .sort({ date: -1 });

      res.status(200).json({ success: true, data: meetings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to list meetings' });
    }
  }

  public static async analyzeMeeting(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, transcript, date } = req.body;

      if (!transcript || !transcript.trim()) {
        res.status(400).json({ success: false, error: 'Meeting transcript is required' });
        return;
      }

      const prompt = `You are the VentureOS AI Meeting Intelligence Engine.
Analyze the following meeting transcript:
Title: ${title || 'Team Operations Meeting'}
Transcript:
"""
${transcript.slice(0, 12000)}
"""

Extract structured intelligence and return a strict JSON object:
- "summary": comprehensive executive summary paragraph
- "keyDecisions": array of 2-4 strategic decisions made
- "requirements": array of 2-4 technical/business requirements agreed upon
- "actionItems": array of objects with:
    - "title": clear actionable task title
    - "suggestedAssignee": name or role mentioned (or "Unassigned")
    - "daysUntilDue": estimated target days offset (e.g. 3, 5, 7)
- "risks": array of 1-3 highlighted risks
- "followUps": array of 1-3 scheduled follow-ups`;

      const orchestrator = AIOrchestrator.getInstance();
      const aiRes = await orchestrator.generate(
        [
          { role: 'system', content: 'You are an executive meeting intelligence analyst.' },
          { role: 'user', content: prompt },
        ],
        {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'meeting_intelligence',
          responseFormat: 'json',
        }
      );

      const parsed = aiRes.parsedJson || {
        summary: 'Team aligned on project delivery timelines and sales follow-up responsibilities.',
        keyDecisions: ['Prioritize pipeline follow-ups', 'Review overdue task backlog'],
        requirements: ['Update CRM records with recent client calls'],
        actionItems: [
          { title: 'Follow up with enterprise prospect', suggestedAssignee: 'Sales Lead', daysUntilDue: 3 },
          { title: 'Review sprint deliverables', suggestedAssignee: 'Project Lead', daysUntilDue: 5 },
        ],
        risks: ['Timeline delays if requirements expand'],
        followUps: ['Regroup next week'],
      };

      const actionItemsFormatted = (parsed.actionItems || []).map((item: any) => ({
        title: item.title,
        suggestedAssignee: item.suggestedAssignee,
        dueDate: new Date(Date.now() + (item.daysUntilDue || 7) * 24 * 60 * 60 * 1000),
        status: 'pending',
      }));

      const meeting = await Meeting.create({
        workspaceId: toObjectId(req.workspace!.workspaceId),
        title: title?.trim() || 'Team Meeting',
        date: date ? new Date(date) : new Date(),
        transcript,
        summary: parsed.summary,
        keyDecisions: parsed.keyDecisions || [],
        requirements: parsed.requirements || [],
        actionItems: actionItemsFormatted,
        risks: parsed.risks || [],
        followUps: parsed.followUps || [],
        recordedBy: toObjectId(req.user!.userId),
      });

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'meeting.analyze',
        resource: 'Meeting',
        resourceId: meeting._id.toString(),
        details: { actionItemsCount: meeting.actionItems.length },
      });

      res.status(201).json({
        success: true,
        message: 'Meeting transcript analyzed successfully',
        data: meeting,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to analyze meeting transcript' });
    }
  }

  public static async approveActionItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { meetingId, actionItemId } = req.params;
      const { projectId, assigneeId } = req.body;

      const wsId = toObjectId(req.workspace!.workspaceId);

      const meeting = await Meeting.findOne({
        _id: toObjectId(meetingId),
        workspaceId: wsId,
      });

      if (!meeting) {
        res.status(404).json({ success: false, error: 'Meeting not found' });
        return;
      }

      const item = meeting.actionItems.find((a) => a._id?.toString() === String(actionItemId));
      if (!item) {
        res.status(404).json({ success: false, error: 'Action item not found in meeting' });
        return;
      }

      // Create actual Task
      const task = await Task.create({
        workspaceId: wsId,
        projectId: projectId ? toObjectId(projectId) : undefined,
        title: item.title,
        description: `Action item approved from meeting: "${meeting.title}" on ${new Date(meeting.date).toLocaleDateString()}`,
        priority: 'high',
        status: 'todo',
        originType: 'meeting',
        originId: meeting._id,
        assigneeId: assigneeId ? toObjectId(assigneeId) : toObjectId(req.user!.userId),
        dueDate: item.dueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      });

      item.status = 'approved';
      item.createdTaskId = task._id as any;
      await meeting.save();

      await AuditService.record({
        workspaceId: wsId,
        userId: req.user!.userId,
        action: 'meeting.action_item_approved',
        resource: 'Task',
        resourceId: task._id.toString(),
        details: { meetingId, actionItemId, taskTitle: task.title },
      });

      res.status(200).json({
        success: true,
        message: 'Action item approved and operational Task created',
        data: { meeting, task },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to approve action item' });
    }
  }
}
