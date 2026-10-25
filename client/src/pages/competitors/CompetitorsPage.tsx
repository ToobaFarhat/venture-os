import React, { useEffect, useState } from 'react';
import {
  Crosshair,
  Plus,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Globe,
  RefreshCw,
  Search,
  BookOpen,
  AlertCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CompetitorService } from '../../services/api';
import { CompetitorItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

const initialCompetitorForm = {
  companyName: '',
  website: '',
  products: '',
  pricingModel: '',
  targetAudience: '',
  features: '',
};

export const CompetitorsPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [competitors, setCompetitors] = useState<CompetitorItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [marketResearchModalOpen, setMarketResearchModalOpen] = useState(false);
  const [marketResearchData, setMarketResearchData] = useState<any>(null);
  const [generatingResearch, setGeneratingResearch] = useState(false);

  // Analyze single competitor
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorItem | null>(null);

  // Form
  const [formData, setFormData] = useState(initialCompetitorForm);

  const fetchCompetitors = async () => {
    setLoading(true);
    try {
      const res = await CompetitorService.list();
      if (res.data.success) {
        setCompetitors(res.data.data.competitors || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load competitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, [activeWorkspace]);

  const handleOpenCreateModal = () => {
    setFormData(initialCompetitorForm);
    setCreateError(null);
    setCreateModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setCreateError('Competitor Company Name is required.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const res = await CompetitorService.create({
        companyName: formData.companyName.trim(),
        website: formData.website.trim(),
        pricingModel: formData.pricingModel.trim() || 'Subscription',
        targetAudience: formData.targetAudience.trim() || 'Enterprise B2B',
        products: formData.products ? formData.products.split(',').map((s) => s.trim()).filter(Boolean) : [],
        features: formData.features ? formData.features.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });

      if (res.data.success) {
        setCreateModalOpen(false);
        setFormData(initialCompetitorForm);
        await fetchCompetitors();

        // Automatically trigger AI SWOT analysis for seamless experience
        const createdId = res.data.data?._id;
        if (createdId) {
          handleAnalyzeCompetitor(createdId);
        }
      } else {
        setCreateError(res.data.error || 'Failed to add competitor');
      }
    } catch (err: any) {
      console.error('Failed to add competitor:', err);
      setCreateError(err.response?.data?.error || err.message || 'Failed to add competitor');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAnalyzeCompetitor = async (id: string) => {
    setAnalyzingId(id);
    try {
      const res = await CompetitorService.analyze(id);
      if (res.data.success) {
        await fetchCompetitors();
        const updated = res.data.data?.competitor || res.data.data;
        if (updated) setSelectedCompetitor(updated);
      }
    } catch (err) {
      console.error('Failed to analyze competitor:', err);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleGenerateMarketResearch = async () => {
    setGeneratingResearch(true);
    setMarketResearchModalOpen(true);
    try {
      const res = await CompetitorService.generateMarketResearch();
      if (res.data.success) {
        setMarketResearchData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to generate market research:', err);
    } finally {
      setGeneratingResearch(false);
    }
  };

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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Crosshair className="w-6 h-6 text-indigo-600" />
            Competitors & SWOT Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track industry rivals, benchmark pricing and feature sets, and automatically formulate 4-quadrant SWOT battlecards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ai"
            size="sm"
            onClick={handleGenerateMarketResearch}
            icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200" />}
          >
            Market Research Report
          </Button>
          <Button size="sm" onClick={handleOpenCreateModal} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Competitor
          </Button>
        </div>
      </div>

      {/* Competitors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {competitors.map((comp) => (
          <Card key={comp._id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{comp.companyName}</h3>
                  {comp.website && (
                    <a
                      href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-600 flex items-center gap-1 hover:underline mt-0.5"
                    >
                      <Globe className="w-3 h-3" />
                      {comp.website}
                    </a>
                  )}
                </div>
                <Badge variant="indigo" size="sm">
                  {comp.pricingModel || 'Subscription'}
                </Badge>
              </div>

              <div className="py-2.5 border-y border-slate-100 my-3 text-xs space-y-1">
                {comp.targetAudience && (
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Audience: </span>
                    <span className="text-slate-700">{comp.targetAudience}</span>
                  </div>
                )}
                {comp.features && comp.features.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Features: </span>
                    <span className="text-slate-600 line-clamp-2">
                      {Array.isArray(comp.features) ? comp.features.join(', ') : comp.features}
                    </span>
                  </div>
                )}
              </div>

              {comp.aiAnalysis?.positioningComparison && (
                <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-[11px] text-slate-700 mb-3">
                  <span className="font-bold text-indigo-900">Positioning Advantage:</span>{' '}
                  {comp.aiAnalysis.positioningComparison}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button
                variant="ai"
                size="sm"
                loading={analyzingId === comp._id}
                onClick={() => handleAnalyzeCompetitor(comp._id)}
                icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200" />}
              >
                SWOT Analysis
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCompetitor(comp)}
              >
                View Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Competitor SWOT & Deep-Dive Modal */}
      {selectedCompetitor && (
        <Modal
          isOpen={!!selectedCompetitor}
          onClose={() => setSelectedCompetitor(null)}
          title={`Competitor Intelligence: ${selectedCompetitor.companyName}`}
          size="lg"
        >
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {selectedCompetitor.aiAnalysis ? (
              <div className="space-y-4">
                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <div className="text-xs font-bold text-emerald-900 uppercase mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Rival Strengths
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {selectedCompetitor.aiAnalysis.strengths?.map((s, i) => (
                        <li key={i}>&bull; {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100">
                    <div className="text-xs font-bold text-rose-900 uppercase mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      Rival Weaknesses
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {selectedCompetitor.aiAnalysis.weaknesses?.map((w, i) => (
                        <li key={i}>&bull; {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Opportunities & Threats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                    <div className="text-xs font-bold text-blue-900 uppercase mb-2 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      Our Strategic Opportunities
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {selectedCompetitor.aiAnalysis.opportunities?.map((o, i) => (
                        <li key={i}>&bull; {o}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                    <div className="text-xs font-bold text-amber-900 uppercase mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                      Identified Market Threats
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {selectedCompetitor.aiAnalysis.threats?.map((t, i) => (
                        <li key={i}>&bull; {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Positioning Comparison Card */}
                {selectedCompetitor.aiAnalysis.positioningComparison && (
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs">
                    <div className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] mb-1">
                      Our Strategic Positioning vs {selectedCompetitor.companyName}
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedCompetitor.aiAnalysis.positioningComparison}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-xs font-semibold">No SWOT matrix generated yet for this competitor.</div>
                <Button
                  variant="ai"
                  size="sm"
                  className="mt-3"
                  onClick={() => handleAnalyzeCompetitor(selectedCompetitor._id)}
                  loading={analyzingId === selectedCompetitor._id}
                >
                  Generate SWOT Matrix Now
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Market Research Report Modal */}
      <Modal
        isOpen={marketResearchModalOpen}
        onClose={() => setMarketResearchModalOpen(false)}
        title="Comprehensive Industry Market Research Report"
        size="lg"
      >
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {generatingResearch ? (
            <div className="p-8 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <div className="text-sm font-semibold text-slate-700">Synthesizing macro industry research...</div>
              <p className="text-xs text-slate-400">Aggregating competitor positioning, customer pain points, and pricing trends</p>
            </div>
          ) : marketResearchData ? (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 leading-relaxed font-mono whitespace-pre-line text-[11px]">
                {typeof marketResearchData === 'string'
                  ? marketResearchData
                  : marketResearchData.summary || JSON.stringify(marketResearchData, null, 2)}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-6">
              Click the button to generate macro industry research.
            </div>
          )}
        </div>
      </Modal>

      {/* Add Competitor Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Track New Competitor"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <Input
            label="Competitor Company Name"
            placeholder="e.g. LegacyCRM Suite"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Product Name"
              placeholder="e.g. LegacyCRM Enterprise"
              value={formData.products}
              onChange={(e) => setFormData({ ...formData, products: e.target.value })}
            />
            <Input
              label="Website URL"
              placeholder="e.g. legacycrm.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Pricing Model"
              placeholder="e.g. $120 / seat / month"
              value={formData.pricingModel}
              onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
            />
            <Input
              label="Target Audience"
              placeholder="e.g. Large Enterprise"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            />
          </div>

          <Input
            label="Key Features / Notes"
            placeholder="e.g. Clunky UI, expensive consultants, high market share"
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          />

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createLoading}>
              Save Competitor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
