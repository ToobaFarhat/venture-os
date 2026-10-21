import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  Kanban,
  List,
  ArrowRight,
  Bot,
  Layers,
  Trash2,
  AlertTriangle,
  RotateCcw,
  FileText,
  Target,
  ShieldAlert,
} from 'lucide-react';
import { ProjectService } from '../../services/api';
import { Project, Task } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

const TASK_STATUSES = ['todo', 'in_progress', 'review', 'done'] as const;

export const ProjectsPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'projects'>('tasks');

  // Modals
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [aiPlannerModal, setAiPlannerModal] = useState(false);

  // AI Planner state
  const [plannerGoal, setPlannerGoal] = useState('');
  const [plannerScope, setPlannerScope] = useState('');
  const [plannerBudget, setPlannerBudget] = useState(35000);
  const [plannerTimeframe, setPlannerTimeframe] = useState('6 weeks');
  const [plannerConstraints, setPlannerConstraints] = useState('');
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [proposedPlan, setProposedPlan] = useState<any>(null);
  const [approvingPlan, setApprovingPlan] = useState(false);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [plannerSuccess, setPlannerSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ goal?: string }>({});

  // New Project Form
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    budget: 25000,
    priority: 'medium',
    dueDate: '',
  });

  // New Task Form
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    dueDate: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, taskRes] = await Promise.all([
        ProjectService.listProjects(),
        ProjectService.listTasks(),
      ]);
      if (projRes.data.success) {
        setProjects(projRes.data.data.projects || projRes.data.data || []);
      }
      if (taskRes.data.success) {
        setTasks(taskRes.data.data.tasks || taskRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load project data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeWorkspace]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ProjectService.createProject(projectForm);
      if (res.data.success) {
        setCreateProjectModal(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ProjectService.createTask(taskForm);
      if (res.data.success) {
        setCreateTaskModal(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await ProjectService.updateTask(taskId, { status });
      fetchData();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleGeneratePlan = async () => {
    if (!plannerGoal.trim()) {
      setFieldErrors({ goal: 'Strategic project goal or objective is required.' });
      return;
    }
    setFieldErrors({});
    setPlannerError(null);
    setGeneratingPlan(true);

    try {
      const res = await ProjectService.planWithAI({
        goal: plannerGoal.trim(),
        scope: plannerScope.trim(),
        budget: Number(plannerBudget) || 0,
        timeframe: plannerTimeframe.trim(),
        constraints: plannerConstraints.trim(),
      });
      if (res.data.success && res.data.data) {
        setProposedPlan(res.data.data);
      } else {
        setPlannerError(res.data.error || 'Failed to generate project plan. Please try again.');
      }
    } catch (err: any) {
      console.error('Failed to generate AI plan:', err);
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        'Failed to connect to AI Project Planner. Please verify backend service.';
      setPlannerError(errMsg);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleApprovePlan = async () => {
    if (!proposedPlan) return;
    setApprovingPlan(true);
    setPlannerError(null);
    try {
      const res = await ProjectService.approvePlan(proposedPlan);
      if (res.data.success) {
        setPlannerSuccess(
          `Project "${res.data.data.project.name}" instantiated with ${res.data.data.taskCount || res.data.data.tasks?.length || 0} operational tasks!`
        );
        setTimeout(() => {
          setAiPlannerModal(false);
          setProposedPlan(null);
          setPlannerGoal('');
          setPlannerScope('');
          setPlannerConstraints('');
          setPlannerSuccess(null);
        }, 1200);
        await fetchData();
        setActiveTab('projects');
      } else {
        setPlannerError(res.data.error || 'Failed to approve project plan.');
      }
    } catch (err: any) {
      console.error('Failed to approve plan:', err);
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        'Failed to approve and instantiate project plan. Please verify permissions.';
      setPlannerError(errMsg);
    } finally {
      setApprovingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-indigo-600" />
            Projects & Task Execution
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {projects.length} active initiatives • {completedCount}/{tasks.length} tasks completed ({tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ai"
            size="sm"
            onClick={() => setAiPlannerModal(true)}
            icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200" />}
          >
            AI Project Planner
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateProjectModal(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Project
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateTaskModal(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* View Toggle Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tasks Kanban ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Projects ({projects.length})
        </button>
      </div>

      {/* Task Kanban View */}
      {activeTab === 'tasks' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start min-h-[500px]">
          {TASK_STATUSES.map((status) => {
            const statusTasks = tasks.filter((t) => t.status === status);
            const statusLabel =
              status === 'todo'
                ? 'To Do'
                : status === 'in_progress'
                ? 'In Progress'
                : status === 'review'
                ? 'Under Review'
                : 'Completed';

            return (
              <div
                key={status}
                className="bg-slate-100/70 rounded-xl border border-slate-200 p-3 flex flex-col min-h-[450px]"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-slate-900">{statusLabel}</span>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">
                    {statusTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {statusTasks.map((task) => (
                    <Card
                      key={task._id}
                      className="p-3.5 bg-white border border-slate-200/90 shadow-subtle hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                        <Badge
                          variant={
                            task.priority === 'urgent'
                              ? 'danger'
                              : task.priority === 'high'
                              ? 'warning'
                              : 'info'
                          }
                          size="sm"
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                      )}

                      {task.projectId?.name && (
                        <div className="mt-2 text-[10px] font-semibold text-indigo-600 bg-indigo-50/60 rounded px-1.5 py-0.5 inline-block">
                          {task.projectId.name}
                        </div>
                      )}

                      {task.originType && task.originType !== 'manual' && (
                        <div className="mt-1 text-[10px] text-slate-400">
                          Origin: <span className="capitalize">{task.originType.replace('_', ' ')}</span>
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                          className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 font-medium"
                        >
                          {TASK_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st === 'todo'
                                ? 'To Do'
                                : st === 'in_progress'
                                ? 'In Progress'
                                : st === 'review'
                                ? 'Review'
                                : 'Done'}
                            </option>
                          ))}
                        </select>

                        {task.dueDate && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Projects List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <Card key={proj._id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-900">{proj.name}</h3>
                  <Badge variant={proj.status === 'completed' ? 'success' : 'info'} size="sm">
                    {proj.status.replace('_', ' ')}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{proj.description}</p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Milestones Progress</span>
                    <span className="font-bold text-slate-800">{proj.progressPercentage || 40}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${proj.progressPercentage || 40}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span>Budget: ${(proj.budget || 0).toLocaleString()}</span>
                  <span>Priority: <strong className="capitalize">{proj.priority}</strong></span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* AI Project Planner Wizard Modal */}
      <Modal
        isOpen={aiPlannerModal}
        onClose={() => setAiPlannerModal(false)}
        title="AI Project & Milestone Planner"
        size="2xl"
      >
        <div className="space-y-4">
          {plannerError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Planner Notice</p>
                <p className="mt-0.5 text-rose-700">{plannerError}</p>
              </div>
              <button
                type="button"
                onClick={() => setPlannerError(null)}
                className="text-rose-400 hover:text-rose-600 text-sm font-bold"
              >
                &times;
              </button>
            </div>
          )}

          {plannerSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="font-semibold">{plannerSuccess}</p>
            </div>
          )}

          {!proposedPlan ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Specify your strategic objective and scope. The VentureOS AI planner analyzes your workspace team, existing initiatives, and constraints to construct a full milestone breakdown and task backlog for review before applying to your database.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Strategic Project Goal or Objective <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Build multi-tenant SOC2 compliant data warehouse ingestion pipeline with automated regression suite..."
                  value={plannerGoal}
                  onChange={(e) => {
                    setPlannerGoal(e.target.value);
                    if (fieldErrors.goal) setFieldErrors({});
                  }}
                  className={`w-full rounded-lg border p-3 text-xs focus:outline-none ${
                    fieldErrors.goal
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-slate-300 focus:border-indigo-500'
                  }`}
                />
                {fieldErrors.goal && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.goal}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Project Scope &amp; Target Deliverables (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Core ETL service, BigQuery sync, RBAC audit logs. Exclude mobile clients for v1."
                  value={plannerScope}
                  onChange={(e) => setPlannerScope(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Target Budget ($)"
                  type="number"
                  value={plannerBudget}
                  onChange={(e) => setPlannerBudget(Number(e.target.value))}
                />
                <Input
                  label="Target Timeframe"
                  placeholder="e.g. 6 weeks or 45 days"
                  value={plannerTimeframe}
                  onChange={(e) => setPlannerTimeframe(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Constraints &amp; Deadlines (Optional)"
                  placeholder="e.g. Q3 launch date, strict zero-downtime migration"
                  value={plannerConstraints}
                  onChange={(e) => setPlannerConstraints(e.target.value)}
                />
              </div>

              <Button
                variant="ai"
                className="w-full justify-center"
                loading={generatingPlan}
                disabled={generatingPlan}
                onClick={handleGeneratePlan}
                icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200" />}
              >
                {generatingPlan ? 'Generating Structured AI Plan…' : 'Generate AI Project Plan'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Generated Proposal • Review &amp; Edit Before Instantiation
                  </span>
                </div>
                <Badge variant="ai">Human Approval Required</Badge>
              </div>

              {/* Editable Project Header */}
              <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <Input
                  label="Project Title"
                  value={proposedPlan.projectName}
                  onChange={(e) =>
                    setProposedPlan({ ...proposedPlan, projectName: e.target.value })
                  }
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Executive Summary / Description
                  </label>
                  <textarea
                    rows={2}
                    value={proposedPlan.description}
                    onChange={(e) =>
                      setProposedPlan({ ...proposedPlan, description: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Allocated Budget ($)"
                    type="number"
                    value={proposedPlan.budget}
                    onChange={(e) =>
                      setProposedPlan({ ...proposedPlan, budget: Number(e.target.value) })
                    }
                  />
                  <Input
                    label="Estimated Duration (Days)"
                    type="number"
                    value={proposedPlan.durationDays}
                    onChange={(e) =>
                      setProposedPlan({ ...proposedPlan, durationDays: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Strategic Objectives */}
              {Array.isArray(proposedPlan.strategicObjectives) && proposedPlan.strategicObjectives.length > 0 && (
                <div className="p-3 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600" /> Strategic Objectives
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 pl-1">
                    {proposedPlan.strategicObjectives.map((obj: string, i: number) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scope Breakdown */}
              {proposedPlan.scope && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.isArray(proposedPlan.scope.inScope) && proposedPlan.scope.inScope.length > 0 && (
                    <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/30">
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> In Scope
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {proposedPlan.scope.inScope.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-600">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(proposedPlan.scope.outOfScope) && proposedPlan.scope.outOfScope.length > 0 && (
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-slate-500" /> Out of Scope (v1)
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {proposedPlan.scope.outOfScope.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span>–</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Milestones */}
              {Array.isArray(proposedPlan.milestones) && proposedPlan.milestones.length > 0 && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" /> Key Milestones ({proposedPlan.milestones.length})
                  </h4>
                  <div className="space-y-2">
                    {proposedPlan.milestones.map((m: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={m.title}
                            onChange={(e) => {
                              const updated = [...proposedPlan.milestones];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setProposedPlan({ ...proposedPlan, milestones: updated });
                            }}
                            className="font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full"
                          />
                          {m.description && <p className="text-[11px] text-slate-500 mt-0.5">{m.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 text-[11px] text-indigo-600 font-medium">
                          <span>Target: Day</span>
                          <input
                            type="number"
                            value={m.targetDays}
                            onChange={(e) => {
                              const updated = [...proposedPlan.milestones];
                              updated[idx] = { ...updated[idx], targetDays: Number(e.target.value) };
                              setProposedPlan({ ...proposedPlan, milestones: updated });
                            }}
                            className="w-12 text-center rounded border border-slate-200 py-0.5"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Backlog */}
              {Array.isArray(proposedPlan.tasks) && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-indigo-600" /> Operational Task Backlog ({proposedPlan.tasks.length})
                    </h4>
                    <span className="text-[11px] text-slate-500">Edit titles, priorities, or remove items</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {proposedPlan.tasks.map((t: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 bg-slate-50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            value={t.title}
                            onChange={(e) => {
                              const updated = [...proposedPlan.tasks];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setProposedPlan({ ...proposedPlan, tasks: updated });
                            }}
                            className="font-medium text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full"
                          />
                          {t.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{t.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            {t.suggestedAssignee && <span>Assignee: <strong className="text-slate-600">{t.suggestedAssignee}</strong></span>}
                            {t.estimatedHours && <span>• {t.estimatedHours}h effort</span>}
                            {t.targetDueDay && <span>• Due: Day {t.targetDueDay}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <select
                            value={t.priority}
                            onChange={(e) => {
                              const updated = [...proposedPlan.tasks];
                              updated[idx] = { ...updated[idx], priority: e.target.value };
                              setProposedPlan({ ...proposedPlan, tasks: updated });
                            }}
                            className="text-[10px] uppercase font-bold rounded border border-slate-200 px-2 py-1 bg-white text-indigo-700 focus:outline-none"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                          <button
                            type="button"
                            title="Remove Task"
                            onClick={() => {
                              const updated = proposedPlan.tasks.filter((_: any, i: number) => i !== idx);
                              setProposedPlan({ ...proposedPlan, tasks: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks & Deliverables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Array.isArray(proposedPlan.deliverables) && proposedPlan.deliverables.length > 0 && (
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" /> Key Deliverables
                    </h5>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                      {proposedPlan.deliverables.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(proposedPlan.risks) && proposedPlan.risks.length > 0 && (
                  <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/30">
                    <h5 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Risks &amp; Mitigations
                    </h5>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      {proposedPlan.risks.map((r: any, i: number) => (
                        <li key={i} className="leading-tight">
                          <strong className="text-amber-800">{r.risk || r}:</strong> {r.mitigation || 'Active monitoring'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProposedPlan(null);
                    setPlannerError(null);
                  }}
                >
                  Discard &amp; Reconfigure
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    loading={generatingPlan}
                    disabled={generatingPlan || approvingPlan}
                    onClick={handleGeneratePlan}
                    icon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Regenerate
                  </Button>
                  <Button
                    variant="ai"
                    size="sm"
                    loading={approvingPlan}
                    disabled={approvingPlan || generatingPlan}
                    onClick={handleApprovePlan}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Approve &amp; Instantiate Plan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* New Project Modal */}
      <Modal
        isOpen={createProjectModal}
        onClose={() => setCreateProjectModal(false)}
        title="Create New Project"
        size="md"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="Q3 Growth Infrastructure"
            value={projectForm.name}
            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            placeholder="Scope and deliverables..."
            value={projectForm.description}
            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Budget ($)"
              type="number"
              value={projectForm.budget}
              onChange={(e) => setProjectForm({ ...projectForm, budget: Number(e.target.value) })}
            />
            <Input
              label="Due Date"
              type="date"
              value={projectForm.dueDate}
              onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
            />
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setCreateProjectModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>

      {/* New Task Modal */}
      <Modal
        isOpen={createTaskModal}
        onClose={() => setCreateTaskModal(false)}
        title="Create New Task"
        size="md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="Implement customer onboarding webhook"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
          />
          <Input
            label="Description"
            placeholder="Accept payload and trigger welcome email sequence..."
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Associate Project
              </label>
              <select
                value={taskForm.projectId}
                onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 text-xs p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">No Project (Standalone)</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full rounded-lg border border-slate-300 text-xs p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setCreateTaskModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
