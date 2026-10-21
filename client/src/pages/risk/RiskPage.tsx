import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  PlusCircle,
  TrendingDown,
  Building2,
  DollarSign,
  FolderKanban,
} from 'lucide-react';
import { DashboardService, ProjectService } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

export const RiskPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTask, setCreatingTask] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const res = await DashboardService.getDashboardData();
      if (res.data.success) {
        setRisks(res.data.data.risks || []);
      }
    } catch (err) {
      console.error('Failed to load risks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, [activeWorkspace]);

  const handleMitigate = async (risk: any) => {
    setCreatingTask(risk.id || risk.title);
    setSuccessMsg(null);
    try {
      const taskData = {
        title: risk.proposedAction?.title || `Mitigate Risk: ${risk.title}`,
        description: risk.proposedAction?.description || `Action plan: ${risk.recommendation}. Evidence: ${risk.evidence?.join(', ')}`,
        priority: risk.severity === 'high' ? 'urgent' : risk.severity === 'medium' ? 'high' : 'medium',
        originType: 'risk_recommendation',
        status: 'todo',
      };

      const res = await ProjectService.createTask(taskData);
      if (res.data.success) {
        setSuccessMsg(`Created mitigation task "${taskData.title}" in Project Management!`);
      }
    } catch (err: any) {
      console.error('Failed to create mitigation task:', err);
    } finally {
      setCreatingTask(null);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'sales':
        return TrendingDown;
      case 'retention':
      case 'customer':
        return Building2;
      case 'finance':
        return DollarSign;
      default:
        return FolderKanban;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const highCount = risks.filter((r) => r.severity === 'high').length;
  const medCount = risks.filter((r) => r.severity === 'medium').length;
  const lowCount = risks.filter((r) => r.severity === 'low').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            Cross-Module Risk Intelligence Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated correlation of CRM pipeline stagnation, customer churn signals, cash burn, and project delays
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRisks} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Re-evaluate Risks
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Severity Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-4 border-l-4 border-l-rose-500 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              High Severity Risks
            </div>
            <div className="text-2xl font-black text-rose-600 mt-0.5">{highCount}</div>
            <div className="text-[10px] text-slate-400">Immediate hazard to revenue / delivery</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Medium Severity
            </div>
            <div className="text-2xl font-black text-amber-600 mt-0.5">{medCount}</div>
            <div className="text-[10px] text-slate-400">Emerging operational friction</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Low / Monitored
            </div>
            <div className="text-2xl font-black text-blue-600 mt-0.5">{lowCount}</div>
            <div className="text-[10px] text-slate-400">Low-friction watch items</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Risks List */}
      <div className="space-y-4">
        {risks.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-800">No Critical Risks Detected</div>
            <p className="text-xs text-slate-400 mt-1">
              All connected modules (CRM, Finance, Projects, Support) are performing within safe thresholds.
            </p>
          </Card>
        ) : (
          risks.map((risk, index) => {
            const CatIcon = getCategoryIcon(risk.category);
            const isHigh = risk.severity === 'high';

            return (
              <Card
                key={risk.id || index}
                className={`p-6 transition-all border ${
                  isHigh ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isHigh ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                        {risk.category}
                      </span>
                      <Badge variant={isHigh ? 'danger' : risk.severity === 'medium' ? 'warning' : 'info'} size="sm">
                        {risk.severity} severity
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{risk.title}</h3>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      <span className="font-semibold text-slate-900">Projected Impact:</span> {risk.impact}
                    </p>

                    {/* Evidence points */}
                    {risk.evidence && risk.evidence.length > 0 && (
                      <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Empirical Evidence:
                        </div>
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                          {risk.evidence.map((ev: string, i: number) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendation */}
                    <div className="mt-2 text-xs text-indigo-900 bg-indigo-50/60 border border-indigo-100 p-3 rounded-lg flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-indigo-950">AI Recommended Mitigation:</span>{' '}
                        {risk.recommendation}
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Action Button */}
                  <div className="flex-shrink-0">
                    <Button
                      variant={isHigh ? 'danger' : 'primary'}
                      size="sm"
                      loading={creatingTask === (risk.id || risk.title)}
                      onClick={() => handleMitigate(risk)}
                      icon={<PlusCircle className="w-3.5 h-3.5" />}
                    >
                      Convert to Mitigation Task
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
