import { Response } from 'express';
import { Project, Task, Workspace, WorkspaceMember, Notification, User } from '../models';
import { AuthenticatedRequest } from '../types';
import { AIOrchestrator } from '../ai/ai.orchestrator';
import { AuditService } from '../services/audit.service';
import { toObjectId } from '../utils';
import mongoose from 'mongoose';

export class ProjectController {
  public static async listProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projects = await Project.find({
        workspaceId: toObjectId(req.workspace!.workspaceId),
      })
        .populate('ownerId', 'name email avatarUrl')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: projects });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to list projects' });
    }
  }

  public static async createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, description, priority, budget, startDate, dueDate, milestones } = req.body;

      if (!name) {
        res.status(400).json({ success: false, error: 'Project name is required' });
        return;
      }

      const project = await Project.create({
        workspaceId: toObjectId(req.workspace!.workspaceId),
        name: name.trim(),
        description: description || '',
        priority: priority || 'medium',
        budget: Number(budget) || 0,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        ownerId: toObjectId(req.user!.userId),
        milestones: milestones || [],
      });

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'project.create',
        resource: 'Project',
        resourceId: project._id.toString(),
        details: { name: project.name },
      });

      res.status(201).json({ success: true, message: 'Project created', data: project });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to create project' });
    }
  }

  public static async listTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { projectId, status, priority, search } = req.query;
      const query: any = { workspaceId: toObjectId(req.workspace!.workspaceId) };

      if (projectId) query.projectId = toObjectId(projectId);
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const tasks = await Task.find(query)
        .populate('assigneeId', 'name email avatarUrl')
        .populate('projectId', 'name')
        .sort({ dueDate: 1, createdAt: -1 });

      res.status(200).json({ success: true, data: tasks });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch tasks' });
    }
  }

  public static async createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, description, priority, status, dueDate, projectId, assigneeId, originType, originId, subtasks } = req.body;

      if (!title) {
        res.status(400).json({ success: false, error: 'Task title is required' });
        return;
      }

      const task = await Task.create({
        workspaceId: toObjectId(req.workspace!.workspaceId),
        title: title.trim(),
        description: description || '',
        priority: priority || 'medium',
        status: status || 'todo',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        projectId: projectId ? toObjectId(projectId) : undefined,
        assigneeId: assigneeId ? toObjectId(assigneeId) : toObjectId(req.user!.userId),
        originType: originType || 'manual',
        originId: originId ? toObjectId(originId) : undefined,
        subtasks: subtasks || [],
      });

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'task.create',
        resource: 'Task',
        resourceId: task._id.toString(),
        details: { title: task.title, originType: task.originType },
      });

      res.status(201).json({ success: true, message: 'Task created', data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to create task' });
    }
  }

  public static async updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const task = await Task.findOneAndUpdate(
        {
          _id: toObjectId(req.params.id),
          workspaceId: toObjectId(req.workspace!.workspaceId),
        },
        req.body,
        { new: true }
      );

      if (!task) {
        res.status(404).json({ success: false, error: 'Task not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Task updated', data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to update task' });
    }
  }

  public static async planProjectWithAI(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userGoal = (req.body.goal || req.body.description || req.body.name || '').trim();
      if (!userGoal) {
        res.status(400).json({
          success: false,
          error: 'A project goal or strategic objective is required.',
        });
        return;
      }

      const scopeText = (req.body.scope || '').trim();
      const budgetNum = Number(req.body.budget) || 0;
      const timeframeVal = req.body.timeframe || req.body.timeframeDays || '30 days';
      const constraintsText = (req.body.constraints || '').trim();

      const wsId = toObjectId(req.workspace!.workspaceId);

      // ── Context Gathering: Workspace, Members, Projects, and Workloads ──────
      const [workspace, members, existingProjects, activeTaskCount] = await Promise.all([
        Workspace.findById(wsId),
        WorkspaceMember.find({ workspaceId: wsId, status: 'active' })
          .populate('userId', 'name email')
          .lean(),
        Project.find({ workspaceId: wsId }).select('name status priority').limit(5).lean(),
        Task.countDocuments({ workspaceId: wsId, status: { $ne: 'done' } }),
      ]);

      const teamList = (members || [])
        .map((m: any) => {
          const userName = m.userId?.name || 'Unknown';
          const userEmail = m.userId?.email || '';
          return `- ${userName} (Role: ${m.role}${userEmail ? `, Email: ${userEmail}` : ''})`;
        })
        .join('\n');

      const teamText = teamList || '- No additional team members registered. (Project Owner only)';

      const existingProjectsText = existingProjects.length > 0
        ? existingProjects.map((p: any) => `- ${p.name} [Status: ${p.status}, Priority: ${p.priority}]`).join('\n')
        : 'None yet';

      // ── Prompt Preparation ───────────────────────────────────────────────────
      const prompt = `You are the VentureOS Strategic AI Project Planner.
You are planning a business initiative for the organization:
- Company / Workspace: "${workspace?.name || 'Enterprise'}" (${workspace?.industry || 'Technology'} industry)
- Strategic Project Goal: "${userGoal}"
${scopeText ? `- Scope & Deliverables Defined by User: "${scopeText}"` : ''}
${constraintsText ? `- Operational Constraints & Deadlines: "${constraintsText}"` : ''}
- Target Timeframe: ${timeframeVal}
- Target Budget: $${budgetNum.toLocaleString()}

WORKSPACE TEAM CONTEXT (Assignees MUST come from this list):
${teamText}

EXISTING INITIATIVES & WORKLOAD:
- Active Uncompleted Tasks Across Workspace: ${activeTaskCount}
- Existing Workspace Projects:
${existingProjectsText}

INSTRUCTIONS:
Generate a complete, execution-ready, professional Agile Project Plan in valid JSON format.
Adhere strictly to these requirements:
1. "projectName": Professional, concise title for this initiative.
2. "description": 2-3 sentence executive summary explaining the purpose and business value.
3. "strategicObjectives": Array of 2-4 strategic business objectives.
4. "scope": Object with "inScope" (array of strings) and "outOfScope" (array of strings).
5. "durationDays": Total estimated timeline in calendar days (integer).
6. "budget": Total allocated budget in USD (number).
7. "milestones": Array of milestone objects (3-5 milestones) ordered chronologically:
   - "title": Clear milestone title
   - "description": What this milestone achieves
   - "targetDays": Day offset from project kickoff when milestone should complete (integer, e.g. 7, 14, 28)
   - "deliverables": Array of specific tangible deliverables for this milestone
8. "tasks": Array of concrete operational tasks (5-10 tasks) breakdown:
   - "title": Specific actionable task title (e.g., "Implement OAuth2 callback handlers")
   - "description": Detailed instructions and technical/business expectations for the task
   - "milestoneIndex": 0-based index of the milestone this task belongs to
   - "priority": Exactly one of "low" | "medium" | "high" | "urgent"
   - "estimatedHours": Estimated effort in hours (number)
   - "suggestedAssignee": Name of the team member assigned from the team list above, or "Unassigned"
   - "targetStartDay": Day offset from start when work begins (integer)
   - "targetDueDay": Day offset from start when work must finish (integer)
   - "dependencies": Array of prerequisite task titles (or empty array)
9. "deliverables": Array of 3-5 high-level project-wide deliverables.
10. "successCriteria": Array of 3-5 measurable success metrics (KPIs).
11. "assumptions": Array of key documented operational assumptions.
12. "risks": Array of risk objects with "risk" and "mitigation".

CRITICAL: Return ONLY valid JSON adhering to the specified structure. Do not invent team members who are not in the team list.`;

      const orchestrator = AIOrchestrator.getInstance();
      const aiRes = await orchestrator.generate(
        [
          { role: 'system', content: 'You are an executive Technical Program Manager and Agile planner. You always return strict valid JSON.' },
          { role: 'user', content: prompt },
        ],
        {
          workspaceId: req.workspace!.workspaceId,
          userId: req.user!.userId,
          module: 'project_planner',
          responseFormat: 'json',
        }
      );

      let parsed: any = aiRes.parsedJson;
      if (!parsed && aiRes.content) {
        try {
          const clean = aiRes.content
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/, '')
            .trim();
          parsed = JSON.parse(clean);
        } catch (jsonErr: any) {
          throw new Error('AI generated an invalid response format. Please retry.');
        }
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('AI failed to produce a structured plan. Please retry.');
      }

      // ── Schema Validation & Normalization ──────────────────────────────────
      if (!parsed.projectName || typeof parsed.projectName !== 'string') {
        parsed.projectName = userGoal.slice(0, 50);
      }
      if (!Array.isArray(parsed.milestones) || parsed.milestones.length === 0) {
        throw new Error('AI plan is missing required project milestones. Please retry.');
      }
      if (!Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
        throw new Error('AI plan is missing required project tasks. Please retry.');
      }

      const plan = {
        projectName: String(parsed.projectName).trim(),
        description: parsed.description ? String(parsed.description).trim() : `Strategic execution plan for: ${userGoal}`,
        strategicObjectives: Array.isArray(parsed.strategicObjectives) ? parsed.strategicObjectives : [],
        scope: {
          inScope: Array.isArray(parsed.scope?.inScope) ? parsed.scope.inScope : (scopeText ? [scopeText] : []),
          outOfScope: Array.isArray(parsed.scope?.outOfScope) ? parsed.scope.outOfScope : [],
        },
        durationDays: Number(parsed.durationDays) || 30,
        budget: Number(parsed.budget) || budgetNum || 0,
        milestones: parsed.milestones.map((m: any, idx: number) => ({
          title: String(m.title || `Milestone ${idx + 1}`).trim(),
          description: String(m.description || '').trim(),
          targetDays: Number(m.targetDays) || (idx + 1) * 7,
          deliverables: Array.isArray(m.deliverables) ? m.deliverables : [],
        })),
        tasks: parsed.tasks.map((t: any, idx: number) => ({
          title: String(t.title || `Task ${idx + 1}`).trim(),
          description: String(t.description || '').trim(),
          milestoneIndex: typeof t.milestoneIndex === 'number' ? t.milestoneIndex : 0,
          priority: ['low', 'medium', 'high', 'urgent'].includes(t.priority?.toLowerCase())
            ? t.priority.toLowerCase()
            : 'medium',
          estimatedHours: Number(t.estimatedHours) || 8,
          suggestedAssignee: String(t.suggestedAssignee || 'Unassigned').trim(),
          targetStartDay: Number(t.targetStartDay) || 1,
          targetDueDay: Number(t.targetDueDay) || 14,
          dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
        })),
        deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
        successCriteria: Array.isArray(parsed.successCriteria) ? parsed.successCriteria : [],
        assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
        risks: Array.isArray(parsed.risks)
          ? parsed.risks.map((r: any) => ({
              risk: typeof r === 'string' ? r : String(r.risk || ''),
              mitigation: typeof r === 'string' ? 'Proactive monitoring' : String(r.mitigation || ''),
            }))
          : [],
      };

      res.status(200).json({
        success: true,
        message: 'AI Project Plan generated. Review and approve to create database records.',
        data: plan,
      });
    } catch (error: any) {
      console.error('[AI Project Planner] Generation error:', error.message);
      res.status(500).json({ success: false, error: error.message || 'Failed to generate AI project plan' });
    }
  }

  public static async approveAIProjectPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        projectName,
        description,
        milestones,
        tasks,
        budget,
        durationDays,
        strategicObjectives,
      } = req.body;

      if (!projectName || typeof projectName !== 'string' || !projectName.trim()) {
        res.status(400).json({ success: false, error: 'Project plan payload must include a valid projectName' });
        return;
      }

      if (!Array.isArray(tasks) || tasks.length === 0) {
        res.status(400).json({ success: false, error: 'Project plan payload must include at least one task' });
        return;
      }

      const wsId = toObjectId(req.workspace!.workspaceId);
      const userId = toObjectId(req.user!.userId);

      // Fetch active workspace members to match suggested assignees
      const activeMembers = await WorkspaceMember.find({ workspaceId: wsId, status: 'active' })
        .populate('userId', 'name email')
        .lean();

      const memberMap = new Map<string, mongoose.Types.ObjectId>();
      for (const m of activeMembers) {
        const u = m.userId as any;
        if (u) {
          if (u.name) memberMap.set(u.name.toLowerCase().trim(), u._id);
          if (u.email) memberMap.set(u.email.toLowerCase().trim(), u._id);
        }
      }

      // Calculate project due date
      const days = Number(durationDays) || 30;
      const projectDueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const milestoneDocs = (Array.isArray(milestones) ? milestones : []).map((m: any, idx: number) => {
        const targetDays = Number(m.targetDays) || (idx + 1) * 7;
        return {
          title: String(m.title || (typeof m === 'string' ? m : `Milestone ${idx + 1}`)).trim(),
          dueDate: new Date(Date.now() + targetDays * 24 * 60 * 60 * 1000),
          completed: false,
        };
      });

      const project = await Project.create({
        workspaceId: wsId,
        name: projectName.trim(),
        description: description ? description.trim() : '',
        priority: 'high',
        status: 'in_progress',
        budget: Number(budget) || 0,
        startDate: new Date(),
        dueDate: projectDueDate,
        aiGenerated: true,
        ownerId: userId,
        milestones: milestoneDocs,
        tags: [
          'ai_planned',
          ...(Array.isArray(strategicObjectives) && strategicObjectives.length > 0 ? ['strategic'] : []),
        ],
      });

      // Construct and insert tasks
      const taskDocs = tasks.map((t: any, idx: number) => {
        const dueDays = Number(t.targetDueDay) || (typeof t.milestoneIndex === 'number' && milestoneDocs[t.milestoneIndex]
          ? (Number(milestones[t.milestoneIndex]?.targetDays) || 14)
          : 14);

        let assigneeId: mongoose.Types.ObjectId | undefined;
        if (t.suggestedAssignee && typeof t.suggestedAssignee === 'string') {
          const lower = t.suggestedAssignee.toLowerCase().trim();
          assigneeId = memberMap.get(lower);
        }
        if (!assigneeId) {
          assigneeId = userId; // fallback to creator
        }

        const taskPriority = ['low', 'medium', 'high', 'urgent'].includes(t.priority?.toLowerCase())
          ? t.priority.toLowerCase()
          : 'medium';

        return {
          workspaceId: wsId,
          projectId: project._id,
          title: String(t.title || `Task ${idx + 1}`).trim(),
          description: t.description
            ? String(t.description).trim()
            : `AI Planned Task. Estimated: ${t.estimatedHours || 8}h.`,
          priority: taskPriority,
          status: 'todo',
          originType: 'ai_project_plan',
          originId: project._id,
          assigneeId,
          dueDate: new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000),
        };
      });

      const createdTasks = await Task.insertMany(taskDocs);

      // Audit Record
      await AuditService.record({
        workspaceId: wsId.toString(),
        userId: req.user!.userId,
        action: 'project.ai_plan_approved',
        resource: 'Project',
        resourceId: project._id.toString(),
        details: {
          projectName: project.name,
          taskCount: createdTasks.length,
          milestoneCount: project.milestones.length,
          budget: project.budget,
        },
      });

      // In-App Notification
      await Notification.create({
        workspaceId: wsId,
        userId,
        title: 'AI Project Plan Approved',
        message: `Project "${project.name}" created with ${createdTasks.length} tasks and ${project.milestones.length} milestones.`,
        type: 'system',
        link: '/projects',
        read: false,
      });

      res.status(201).json({
        success: true,
        message: 'AI Project Plan approved and operational records created',
        data: {
          project,
          tasks: createdTasks,
          taskCount: createdTasks.length,
        },
      });
    } catch (error: any) {
      console.error('[AI Project Planner] Approval error:', error.message);
      res.status(500).json({ success: false, error: error.message || 'Failed to approve AI project plan' });
    }
  }
}
