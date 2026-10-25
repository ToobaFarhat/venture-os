import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Sparkles,
  Calendar,
  AlertCircle,
  RefreshCw,
  Wallet,
  Receipt,
  PiggyBank,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FinanceService } from '../../services/api';
import { FinancialRecordItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

export const FinancePage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [records, setRecords] = useState<FinancialRecordItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

const initialFinanceForm = {
  type: 'revenue',
  category: 'Subscription / SaaS',
  amount: '',
  currency: 'USD',
  date: new Date().toISOString().split('T')[0],
  description: '',
  recurring: true,
};

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(initialFinanceForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recRes, sumRes, foreRes] = await Promise.all([
        FinanceService.list(),
        FinanceService.getSummary(),
        FinanceService.getForecast(),
      ]);

      if (recRes.data.success) {
        setRecords(recRes.data.data.records || recRes.data.data || []);
      }
      if (sumRes.data.success) {
        setSummary(sumRes.data.data);
      }
      if (foreRes.data.success) {
        setForecast(foreRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeWorkspace]);

  const handleOpenCreateModal = () => {
    setFormData(initialFinanceForm);
    setCreateError(null);
    setCreateModalOpen(true);
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setCreateError('Valid positive amount is required.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const res = await FinanceService.create({
        ...formData,
        amount: Number(formData.amount),
        description: formData.description.trim() || formData.category,
      });

      if (res.data.success) {
        setCreateModalOpen(false);
        setFormData(initialFinanceForm);
        await fetchData();
      } else {
        setCreateError(res.data.error || 'Failed to record transaction');
      }
    } catch (err: any) {
      console.error('Failed to save financial record:', err);
      setCreateError(err.response?.data?.error || err.message || 'Failed to record transaction');
    } finally {
      setCreateLoading(false);
    }
  };

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

  const metrics = summary?.metrics || {
    totalRevenue: 180000,
    totalExpenses: 82000,
    mrr: 42000,
    netProfit: 98000,
    profitMarginPercent: 54.4,
    burnRate: 18500,
    cashRunwayMonths: 14,
    cac: 1200,
    ltv: 18500,
  };

  const forecastData = forecast?.projections || [
    { period: 'Actual M-2', revenue: 38000, expense: 22000 },
    { period: 'Actual M-1', revenue: 42000, expense: 23000 },
    { period: 'Current', revenue: 47000, expense: 24500 },
    { period: '+30 Days (Proj)', revenue: 51200, expense: 25000, isForecast: true },
    { period: '+60 Days (Proj)', revenue: 55800, expense: 26100, isForecast: true },
    { period: '+90 Days (Proj)', revenue: 60900, expense: 27200, isForecast: true },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Financial Intelligence & Forecasting
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic cash accounting combined with 30/60/90-day predictive linear projection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button size="sm" onClick={handleOpenCreateModal} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Financial Record
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Monthly Recurring (MRR)</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">${(metrics.mrr || 0).toLocaleString()}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">ARR ${( (metrics.mrr || 0) * 12 ).toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Net Profit Margin</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{metrics.profitMarginPercent || 0}%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">${(metrics.netProfit || 0).toLocaleString()} cumulative</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Monthly Burn Rate</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">${(metrics.burnRate || 0).toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{metrics.cashRunwayMonths || 12} Months Runway</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">LTV / CAC Ratio</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {metrics.cac ? (metrics.ltv / metrics.cac).toFixed(1) : '15.4'}x
            </div>
            <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
              LTV: ${(metrics.ltv || 15000).toLocaleString()} • CAC: ${(metrics.cac || 1200).toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 30/60/90-Day Predictive Forecasting Chart */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">30 / 60 / 90-Day Predictive Cashflow Forecast</h2>
              <Badge variant="ai" size="sm">OLS Regression + AI</Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Historical baseline extrapolated with ordinary least squares (OLS) linear trend analysis
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="foreRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="foreExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#foreRev)" name="Projected Revenue" />
              <Area type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#foreExp)" name="Projected Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Qualitative Narrative */}
        {forecast?.aiNarrative && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-indigo-950">AI Qualitative Financial Commentary</div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {forecast.aiNarrative}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Ledger Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Transaction & General Ledger</h3>
          <span className="text-xs text-slate-500">{records.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Recurring</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={r.type === 'revenue' ? 'success' : 'danger'} size="sm">
                      {r.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{r.category}</td>
                  <td className="py-3 px-4 text-slate-500">{r.description || '—'}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {r.recurring ? 'Yes' : 'One-time'}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${
                    r.type === 'revenue' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {r.type === 'revenue' ? '+' : '-'}${r.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Financial Record Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Record Financial Transaction"
        size="md"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          {createError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setFormData({
                    ...formData,
                    type: newType,
                    category: newType === 'revenue' ? 'Subscription' : 'Infrastructure',
                  });
                }}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="revenue">Revenue (+)</option>
                <option value="expense">Expense (-)</option>
              </select>
            </div>
            <Input
              label="Amount ($)"
              type="number"
              placeholder="e.g. 18500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                {formData.type === 'revenue' ? (
                  <>
                    <option value="Subscription">Subscription</option>
                    <option value="Subscription / SaaS">Subscription / SaaS</option>
                    <option value="Services">Services</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="License & Integration">License & Integration</option>
                    <option value="Other Revenue">Other Revenue</option>
                  </>
                ) : (
                  <>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Cloud Infrastructure & Hosting">Cloud Infrastructure & Hosting</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Marketing & Advertising">Marketing & Advertising</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Salaries & Payroll">Salaries & Payroll</option>
                    <option value="Software Subscriptions">Software Subscriptions</option>
                    <option value="Office & Operations">Office & Operations</option>
                    <option value="Other Expense">Other Expense</option>
                  </>
                )}
              </select>
            </div>

            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <Input
            label="Description"
            placeholder="e.g. August Enterprise SaaS Subscriptions"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="recurringCheck"
              checked={formData.recurring}
              onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="recurringCheck" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
              Recurring monthly item (affects MRR and burn rate calculation)
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createLoading}>
              Record Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
