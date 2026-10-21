import React, { useEffect, useState } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  ArrowRight,
  ShieldAlert,
  Users,
  Building2,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { AdminService } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

export const AutomationsPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const res = await AdminService.listAutomations();
      if (res.data.success) {
        setAutomations(res.data.data.automations || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load automations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, [activeWorkspace]);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await AdminService.toggleAutomation(id);
      if (res.data.success) {
        setAutomations((prev) =>
          prev.map((a) => (a._id === id ? { ...a, enabled: !a.enabled } : a))
        );
      }
    } catch (err) {
      console.error('Failed to toggle automation:', err);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  // Fallback defaults if none in DB
  const displayList = automations.length > 0 ? automations : [
    {
      _id: 'auto-1',
      name: 'Onboard Won Leads Automatically',
      description: 'When a CRM Lead is marked as Won, automatically instantiate a Client Onboarding Project with kickoff deliverables.',
      triggerEvent: 'lead.status_changed.won',
      actionType: 'create_project',
      enabled: true,
      executionCount: 14,
      lastExecutedAt: new Date().toISOString(),
    },
    {
      _id: 'auto-2',
      name: 'High Churn Alert Dispatcher',
      description: 'When AI detects high churn risk or negative customer sentiment, dispatch urgent notification to the dedicated Account Manager.',
      triggerEvent: 'customer.churn_risk.high',
      actionType: 'notify_account_manager',
      enabled: true,
      executionCount: 8,
      lastExecutedAt: new Date().toISOString(),
    },
    {
      _id: 'auto-3',
      name: 'Negative Feedback Remediation Task',
      description: 'Automatically create a high-priority bug / SLA investigation task when critical negative feedback is ingested.',
      triggerEvent: 'feedback.negative.critical',
      actionType: 'create_task',
      enabled: true,
      executionCount: 5,
      lastExecutedAt: new Date().toISOString(),
    },
    {
      _id: 'auto-4',
      name: 'Runway Burn Rate Guardrail',
      description: 'When operational expenses accelerate beyond 20% of monthly budget, alert workspace owner and lock discretionary spend.',
      triggerEvent: 'finance.burn_rate_spike',
      actionType: 'alert_owner',
      enabled: false,
      executionCount: 2,
      lastExecutedAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-500" />
            Autonomous Business Rules & Automations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Event-driven operational triggers connecting CRM conversions, churn risk detection, and task delegation
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchAutomations} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Automations
        </Button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {displayList.map((rule) => (
          <Card key={rule._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                <Badge variant={rule.enabled ? 'success' : 'secondary'} size="sm">
                  {rule.enabled ? 'Active Rule' : 'Paused'}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {rule.description}
              </p>

              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  Trigger: {rule.triggerEvent}
                </span>
                <span>&rarr;</span>
                <span className="font-mono bg-indigo-50 px-2 py-0.5 rounded text-indigo-700 font-semibold">
                  Action: {rule.actionType}
                </span>
                <span>• {rule.executionCount || 0} executions</span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => handleToggle(rule._id)}
                disabled={togglingId === rule._id}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  rule.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    rule.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
