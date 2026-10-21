import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HeartHandshake,
  DollarSign,
  TrendingDown,
  Mail,
  Phone,
  MessageSquare,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { CustomerService } from '../../services/api';
import { Customer } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

export const CustomersPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [assessingId, setAssessingId] = useState<string | null>(null);

  // New Customer Form
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    industry: 'Technology',
    lifetimeValue: 24000,
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await CustomerService.list();
      if (res.data.success) {
        setCustomers(res.data.data.customers || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [activeWorkspace]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await CustomerService.create(formData);
      if (res.data.success) {
        setCreateModalOpen(false);
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          industry: 'Technology',
          lifetimeValue: 24000,
        });
        fetchCustomers();
      }
    } catch (err) {
      console.error('Failed to create customer:', err);
    }
  };

  const handleAssessHealth = async (id: string) => {
    setAssessingId(id);
    try {
      const res = await CustomerService.assessHealth(id);
      if (res.data.success) {
        fetchCustomers();
        if (selectedCustomer && selectedCustomer._id === id) {
          setSelectedCustomer(res.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to assess health:', err);
    } finally {
      setAssessingId(null);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesFilter = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      </div>
    );
  }

  const atRiskCount = customers.filter((c) => c.status === 'churn_risk' || (c.customerHealthScore && c.customerHealthScore < 60)).length;
  const totalLTV = customers.reduce((acc, c) => acc + (c.lifetimeValue || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Customer Intelligence & Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking {customers.length} total client accounts with combined LTV of ${totalLTV.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateModalOpen(true)} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Customer
          </Button>
        </div>
      </div>

      {/* High Churn Risk Notice if present */}
      {atRiskCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">
                {atRiskCount} Customer{atRiskCount > 1 ? 's' : ''} Flagged with Elevated Churn Hazard
              </div>
              <p className="text-xs text-amber-700 mt-0.5">
                Support tickets or low health scores indicate potential revenue attrition.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('churn_risk')}
            className="text-xs font-bold text-amber-900 hover:underline"
          >
            Filter At-Risk
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search accounts by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter:</span>
          {['all', 'active', 'churn_risk', 'churned'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((c) => {
          const health = c.customerHealthScore ?? 80;
          const isAtRisk = c.status === 'churn_risk' || health < 60;

          return (
            <Card
              key={c._id}
              className={`p-5 flex flex-col justify-between hover:shadow-md transition-shadow border ${
                isAtRisk ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200 bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{c.company}</h3>
                    <div className="text-xs text-slate-500">{c.name}</div>
                  </div>
                  <Badge
                    variant={c.status === 'active' ? 'success' : c.status === 'churn_risk' ? 'warning' : 'danger'}
                    size="sm"
                  >
                    {c.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Health & LTV Metrics */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 mb-3">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Health Score</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5 flex items-baseline gap-1">
                      <span>{health}</span>
                      <span className="text-[10px] font-normal text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Lifetime Value</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      ${(c.lifetimeValue || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Sentiment & Support Tickets */}
                <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                  <span>Sentiment: <strong className="capitalize">{c.sentimentLabel || 'Positive'}</strong></span>
                  <span>Tickets: <strong>{c.supportTicketsCount || 0}</strong></span>
                </div>

                {/* Churn assessment recommendation if available */}
                {c.churnRisk?.recommendedAction && (
                  <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-950 flex items-start gap-1.5 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>{c.churnRisk.recommendedAction}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  loading={assessingId === c._id}
                  onClick={() => handleAssessHealth(c._id)}
                  icon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                >
                  Assess Churn Risk
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedCustomer(c)}
                >
                  Details
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Customer Details Drawer / Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer 360: ${selectedCustomer.company}`}
          size="lg"
        >
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl">
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Primary Contact</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedCustomer.name}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Contact Email</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">{selectedCustomer.email}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Health Score</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedCustomer.customerHealthScore || 80}/100</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Lifetime Value</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">${(selectedCustomer.lifetimeValue || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Churn Risk Breakdown */}
            {selectedCustomer.churnRisk && (
              <div className="p-4 rounded-xl bg-slate-900 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    AI Churn Risk Diagnostics
                  </span>
                  <Badge variant={selectedCustomer.churnRisk.level === 'low' ? 'success' : selectedCustomer.churnRisk.level === 'medium' ? 'warning' : 'danger'}>
                    {selectedCustomer.churnRisk.level} Risk
                  </Badge>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="text-xs font-medium text-slate-300">
                    Primary Contributing Factors:
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                    {selectedCustomer.churnRisk.reasons?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-indigo-200">
                    <strong>Recommended Retention Play:</strong> {selectedCustomer.churnRisk.recommendedAction}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* New Customer Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Customer Account"
        size="md"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <Input
            label="Company Name"
            placeholder="Acrobat Logistics"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Name"
              placeholder="Sarah Connor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="s.connor@acrobat.io"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              placeholder="+1 (555) 019-2831"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Contract Lifetime Value ($)"
              type="number"
              value={formData.lifetimeValue}
              onChange={(e) => setFormData({ ...formData, lifetimeValue: Number(e.target.value) })}
              required
            />
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
