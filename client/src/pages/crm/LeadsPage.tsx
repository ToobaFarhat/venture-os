import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Kanban,
  List,
  Sparkles,
  DollarSign,
  Building2,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Bot,
  TrendingUp,
  X,
} from 'lucide-react';
import { LeadService } from '../../services/api';
import { Lead } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] as const;

export const LeadsPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modals & Drawers state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [salesAssistantData, setSalesAssistantData] = useState<any>(null);
  const [salesAssistantLoading, setSalesAssistantLoading] = useState(false);
  const [scoringLeadId, setScoringLeadId] = useState<string | null>(null);

  // New Lead form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    dealValue: 15000,
    source: 'Website Inbound',
    industry: 'Technology',
    notes: '',
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await LeadService.list();
      if (res.data.success) {
        setLeads(res.data.data.leads || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeWorkspace]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await LeadService.create(formData);
      if (res.data.success) {
        setCreateModalOpen(false);
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          dealValue: 15000,
          source: 'Website Inbound',
          industry: 'Technology',
          notes: '',
        });
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  const handleScoreLead = async (leadId: string) => {
    setScoringLeadId(leadId);
    try {
      const res = await LeadService.score(leadId);
      if (res.data.success) {
        // Refresh local leads to show updated score
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to score lead:', err);
    } finally {
      setScoringLeadId(null);
    }
  };

  const handleOpenSalesAssistant = async (lead: Lead) => {
    setSelectedLead(lead);
    setSalesAssistantLoading(true);
    setSalesAssistantData(null);
    try {
      const res = await LeadService.salesAssistant(lead._id);
      if (res.data.success) {
        setSalesAssistantData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to generate sales assistant:', err);
    } finally {
      setSalesAssistantLoading(false);
    }
  };

  const handleConvertToCustomer = async (leadId: string) => {
    try {
      const res = await LeadService.convertToCustomer(leadId);
      if (res.data.success) {
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to convert lead to customer:', err);
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      await LeadService.update(leadId, { status });
      fetchLeads();
    } catch (err) {
      console.error('Failed to update lead status:', err);
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

  const totalPipeline = leads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            CRM & Lead Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total Pipeline Value: <span className="font-bold text-slate-900">${totalPipeline.toLocaleString()}</span> across {leads.length} opportunities
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button size="sm" onClick={() => setCreateModalOpen(true)} icon={<Plus className="w-3.5 h-3.5" />}>
            New Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[550px]">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage);
            const stageValue = stageLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

            return (
              <div
                key={stage}
                className="w-72 flex-shrink-0 bg-slate-100/70 rounded-xl border border-slate-200 p-3 flex flex-col max-h-[700px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{stage}</span>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    ${(stageValue / 1000).toFixed(0)}k
                  </span>
                </div>

                {/* Stage Leads */}
                <div className="space-y-3 overflow-y-auto pr-0.5 flex-1">
                  {stageLeads.map((lead) => (
                    <Card
                      key={lead._id}
                      className="p-3.5 bg-white border border-slate-200/90 shadow-subtle hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{lead.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {lead.company}
                          </div>
                        </div>
                        <div className="text-xs font-black text-slate-900">
                          ${(lead.dealValue || 0).toLocaleString()}
                        </div>
                      </div>

                      {/* AI Score Badge if scored */}
                      {lead.aiScore?.score !== undefined ? (
                        <div className="mt-2.5 p-2 rounded-lg bg-indigo-50/50 border border-indigo-100">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-indigo-900 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-600" /> AI Score: {lead.aiScore.score}/100
                            </span>
                            <Badge
                              variant={lead.aiScore.risk === 'low' ? 'success' : lead.aiScore.risk === 'medium' ? 'warning' : 'danger'}
                              size="sm"
                            >
                              {lead.aiScore.risk} risk
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-1 line-clamp-1 font-medium">
                            {lead.aiScore.recommendedAction}
                          </p>
                        </div>
                      ) : null}

                      {/* Actions */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleScoreLead(lead._id)}
                            disabled={scoringLeadId === lead._id}
                            className="p-1.5 rounded-lg text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center gap-1"
                            title="Score lead with AI"
                          >
                            <Sparkles className="w-3 h-3" />
                            {scoringLeadId === lead._id ? '...' : 'Score'}
                          </button>

                          <button
                            onClick={() => handleOpenSalesAssistant(lead)}
                            className="p-1.5 rounded-lg text-[10px] font-semibold text-violet-600 hover:bg-violet-50 flex items-center gap-1"
                            title="AI Sales Assistant"
                          >
                            <Bot className="w-3 h-3" />
                            Pitch
                          </button>
                        </div>

                        {/* Status change selector */}
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateStatus(lead._id, e.target.value)}
                          className="text-[10px] font-medium bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Convert to Customer button if Won */}
                      {lead.status === 'Won' && !lead.convertedCustomerId && (
                        <button
                          onClick={() => handleConvertToCustomer(lead._id)}
                          className="mt-2 w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Convert to Customer
                        </button>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Contact & Company</th>
                  <th className="py-3 px-4">Deal Value</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{lead.name}</div>
                      <div className="text-slate-500 text-[11px]">{lead.company} • {lead.email}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ${(lead.dealValue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead._id, e.target.value)}
                        className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-800"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      {lead.aiScore?.score ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{lead.aiScore.score}/100</span>
                          <Badge
                            variant={lead.aiScore.risk === 'low' ? 'success' : lead.aiScore.risk === 'medium' ? 'warning' : 'danger'}
                            size="sm"
                          >
                            {lead.aiScore.risk}
                          </Badge>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleScoreLead(lead._id)}
                          className="text-indigo-600 font-semibold text-[11px] hover:underline"
                        >
                          Score now
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{lead.source}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenSalesAssistant(lead)}
                        icon={<Bot className="w-3.5 h-3.5 text-violet-600" />}
                      >
                        Assistant
                      </Button>
                      {lead.status === 'Won' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleConvertToCustomer(lead._id)}
                        >
                          Convert
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* New Lead Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Lead Opportunity"
        size="md"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Name"
              placeholder="Marcus Vance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Company"
              placeholder="Orbit Logistics"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              placeholder="m.vance@orbit.io"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              placeholder="+1 (555) 342-9811"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Estimated Deal Value ($)"
              type="number"
              value={formData.dealValue}
              onChange={(e) => setFormData({ ...formData, dealValue: Number(e.target.value) })}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Lead Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Website Inbound">Website Inbound</option>
                <option value="Cold Outreach">Cold Outreach</option>
                <option value="Referral">Referral</option>
                <option value="LinkedIn">LinkedIn Campaign</option>
                <option value="Event / Conference">Event / Conference</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Initial Discovery Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Needs AI analytics integration for Q4..."
              className="block w-full rounded-lg border border-slate-300 text-sm p-3 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Lead</Button>
          </div>
        </form>
      </Modal>

      {/* AI Sales Assistant Drawer / Modal */}
      {selectedLead && (
        <Modal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={`AI Sales Assistant: ${selectedLead.name} (${selectedLead.company})`}
          size="lg"
        >
          {salesAssistantLoading ? (
            <div className="p-8 text-center space-y-3">
              <Bot className="w-8 h-8 text-indigo-600 animate-bounce mx-auto" />
              <div className="text-sm font-semibold text-slate-700">Synthesizing personalized sales strategy...</div>
              <p className="text-xs text-slate-400">Analyzing company profile, deal value, and objection handling</p>
            </div>
          ) : salesAssistantData ? (
            <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1">
              {/* Pitch Email */}
              <div>
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Personalized Cold/Warm Pitch Email
                </div>
                <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono leading-relaxed select-all">
                  {salesAssistantData.emailDraft || salesAssistantData.pitch}
                </div>
              </div>

              {/* Discovery Questions */}
              {salesAssistantData.discoveryQuestions && (
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    High-Impact Discovery Questions
                  </div>
                  <ul className="space-y-1.5">
                    {salesAssistantData.discoveryQuestions.map((q: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                        &bull; {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Objections & Rebuttals */}
              {salesAssistantData.objectionHandling && (
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Anticipated Objections & Battle-tested Rebuttals
                  </div>
                  <div className="space-y-2">
                    {salesAssistantData.objectionHandling.map((obj: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs">
                        <div className="font-bold text-amber-950">Objection: "{obj.objection}"</div>
                        <div className="text-slate-700 mt-1">&rarr; <span className="font-semibold">Rebuttal:</span> {obj.rebuttal}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-6 text-xs text-slate-500">
              No sales assistant strategy generated.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
