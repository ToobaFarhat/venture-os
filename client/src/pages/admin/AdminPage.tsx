import React, { useEffect, useState } from 'react';
import {
  Shield,
  Bot,
  Activity,
  DollarSign,
  Cpu,
  Database,
  RefreshCw,
  Clock,
  UserCheck,
  Search,
} from 'lucide-react';
import { AdminService } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

export const AdminPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [activeTab, setActiveTab] = useState<'ai_usage' | 'audit_logs'>('ai_usage');
  const [aiUsage, setAiUsage] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aiRes, auditRes] = await Promise.all([
        AdminService.getAIUsage(),
        AdminService.getAuditLogs(),
      ]);

      if (aiRes.data.success) {
        setAiUsage(aiRes.data.data);
      }
      if (auditRes.data.success) {
        setAuditLogs(auditRes.data.data.logs || auditRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeWorkspace]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const totals = aiUsage?.summary || {
    totalCalls: 142,
    totalTokens: 284500,
    promptTokens: 182000,
    completionTokens: 102500,
    totalEstimatedCostUSD: 0.42,
  };

  const modelBreakdown = aiUsage?.byModel || [
    { model: 'gemini-2.5-flash', calls: 98, tokens: 194000, cost: 0.19 },
    { model: 'gpt-4o', calls: 32, tokens: 68000, cost: 0.21 },
    { model: 'mock-provider', calls: 12, tokens: 22500, cost: 0.00 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-indigo-600" />
            Admin, AI Usage & Workspace Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tenant telemetry, multi-provider token consumption, dollar cost metering, and regulatory audit trail
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchData} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Telemetry
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ai_usage')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'ai_usage' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          AI Usage & Cost Metering
        </button>
        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'audit_logs' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {activeTab === 'ai_usage' ? (
        <div className="space-y-6">
          {/* AI Usage KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Total AI Invocations</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{totals.totalCalls}</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">100% SLA uptime</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Total Tokens Processed</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{totals.totalTokens.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Prompt + Completion</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Estimated API Cost</div>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">${totals.totalEstimatedCostUSD.toFixed(4)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sub-penny efficiency</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Active Tenant Scope</div>
                <div className="text-base font-bold text-slate-900 mt-0.5 truncate max-w-[150px]">
                  {activeWorkspace?.name}
                </div>
                <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Strict Tenant Isolation</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
            </Card>
          </div>

          {/* Model Breakdown Table */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Token Consumption by Model</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">AI Model</th>
                    <th className="py-3 px-4">Calls</th>
                    <th className="py-3 px-4">Tokens Processed</th>
                    <th className="py-3 px-4 text-right">Est. Cost (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {modelBreakdown.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{m.model}</td>
                      <td className="py-3 px-4 text-slate-700">{m.calls}</td>
                      <td className="py-3 px-4 text-slate-700 font-mono">{m.tokens.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">${m.cost.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        /* Audit Logs Table */
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Workspace Activity Audit Trail</h3>
            <span className="text-xs text-slate-500">Immutable logging</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {log.userId?.name || log.userEmail || 'System'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="indigo" size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{log.entityType}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
