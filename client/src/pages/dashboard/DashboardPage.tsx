import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Building2,
  FolderKanban,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  DollarSign,
  Plus,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { DashboardService } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await DashboardService.getDashboardData();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load executive dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [activeWorkspace]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">Unable to Load Dashboard</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          {error || 'An unexpected error occurred while fetching workspace analytics.'}
        </p>
        <Button onClick={fetchDashboard} icon={<RefreshCw className="w-4 h-4" />}>
          Try Again
        </Button>
      </div>
    );
  }

  const kpis = data.sourceData?.kpis || {};
  const charts = data.sourceData?.charts || {};
  const businessHealth = data.businessHealth || {};
  const activeRisks = data.risks || [];
  const aiInsights = data.aiInsights || [];

  const healthScore = businessHealth.overallScore || 80;
  const highRisks = activeRisks.filter((r: any) => r.severity === 'high');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Executive Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-departmental health, cashflow, and autonomous risk detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboard}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>
          <Link to="/crm">
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Add Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Active High-Severity Risk Alert Banner if any */}
      {highRisks.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-950 flex items-center gap-2">
                <span>{highRisks.length} High-Severity Business Risks Detected</span>
                <Badge variant="danger" size="sm">Urgent Review</Badge>
              </div>
              <p className="text-xs text-rose-700 mt-0.5 font-medium">
                {highRisks[0]?.title} — {highRisks[0]?.impact}
              </p>
            </div>
          </div>
          <Link to="/risk">
            <Button variant="danger" size="sm">
              Review Risk Center
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MRR */}
        <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Monthly Recurring Rev
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ${(kpis.mrr || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Margin: {kpis.profitMargin || 0}%</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>

        {/* Active Customers */}
        <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active Customers
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {kpis.totalCustomers || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {kpis.customerSentiment?.positive || 0} positive sentiment
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </Card>

        {/* Pipeline Value */}
        <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Sales Pipeline
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {kpis.totalLeads || 0} Deals
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-1">
              {kpis.wonLeads || 0} Won ({kpis.conversionRate || 0}%)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        {/* Business Health Gauge */}
        <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Business Health Index
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
              <span>{healthScore}</span>
              <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <div className="mt-1">
              <Badge
                variant={healthScore >= 75 ? 'success' : healthScore >= 50 ? 'warning' : 'danger'}
                size="sm"
              >
                {healthScore >= 75 ? 'Healthy' : healthScore >= 50 ? 'Moderate' : 'Critical'}
              </Badge>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Main Grid: Charts & Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cashflow & Financial Trends */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Revenue & Expense Cashflow</h2>
              <p className="text-[11px] text-slate-500">Monthly breakdown and historical trend</p>
            </div>
            <Link to="/finance" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Full Ledger &rarr;
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  charts.revenueTrends?.length > 0
                    ? charts.revenueTrends
                    : [
                        { month: 'Apr', revenue: 38000, expense: 22000, net: 16000 },
                        { month: 'May', revenue: 42000, expense: 23000, net: 19000 },
                        { month: 'Jun', revenue: 45000, expense: 24000, net: 21000 },
                        { month: 'Jul', revenue: 48000, expense: 25500, net: 22500 },
                        { month: 'Aug', revenue: 52000, expense: 26000, net: 26000 },
                      ]
                }
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" name="Revenue" />
                <Area type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#expGrad)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Net Profit</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                ${(kpis.netProfit || 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Cash Runway</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {kpis.cashRunwayMonths || 14} Months
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Tasks In Flight</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {kpis.completedTasks || 0} / {kpis.totalTasks || 0} done
              </div>
            </div>
          </div>
        </Card>

        {/* Right 1 Col: 5-Dimension Business Health Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">5-Dimension Health</h2>
            <Link to="/health" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Deep Dive &rarr;
            </Link>
          </div>

          <div className="space-y-3.5">
            {[
              { label: 'Sales & Pipeline', dim: businessHealth.dimensions?.sales, defaultScore: 82 },
              { label: 'Customer Health', dim: businessHealth.dimensions?.customerHealth, defaultScore: 85 },
              { label: 'Marketing Efficiency', dim: businessHealth.dimensions?.marketing, defaultScore: 78 },
              { label: 'Finance & Cashflow', dim: businessHealth.dimensions?.finance, defaultScore: 90 },
              { label: 'Operations & Execution', dim: businessHealth.dimensions?.operations, defaultScore: 72 },
            ].map((d, i) => {
              const score = d.dim?.score ?? d.defaultScore;
              return (
                <div key={i}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-700">{d.label}</span>
                    <span className="font-bold text-slate-900">{score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-indigo-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {businessHealth.aiExplanation?.overview && (
            <div className="mt-5 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Health Synthesis</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {businessHealth.aiExplanation.overview}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Grid: CRM Funnel & AI Strategic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Stage Funnel */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Lead Pipeline Distribution</h2>
              <p className="text-[11px] text-slate-500">Active deals across pipeline stages</p>
            </div>
            <Link to="/crm" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Kanban Board &rarr;
            </Link>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  charts.salesPipeline?.length > 0
                    ? charts.salesPipeline
                    : [
                        { stage: 'New', count: 4 },
                        { stage: 'Qualified', count: 6 },
                        { stage: 'Proposal', count: 3 },
                        { stage: 'Negotiation', count: 2 },
                        { stage: 'Won', count: 8 },
                      ]
                }
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="stage" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} name="Deals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI Strategic Insights */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Executive Strategic Advisory</h2>
            </div>
            <Badge variant="ai" size="sm">Live AI Synthesis</Badge>
          </div>

          <div className="space-y-3">
            {aiInsights.map((insight: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {insight.type === 'warning' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    ) : insight.type === 'opportunity' ? (
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    {insight.title}
                  </span>
                  <Badge
                    variant={
                      insight.type === 'warning'
                        ? 'warning'
                        : insight.type === 'opportunity'
                        ? 'indigo'
                        : 'success'
                    }
                    size="sm"
                  >
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 mb-1.5">{insight.impact}</p>
                <div className="text-[11px] font-medium text-indigo-600 bg-indigo-50/60 rounded-md px-2 py-1">
                  &rarr; {insight.recommendation}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
