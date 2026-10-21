import React, { useEffect, useState } from 'react';
import {
  Megaphone,
  Plus,
  Sparkles,
  TrendingUp,
  Target,
  DollarSign,
  MousePointer,
  Eye,
  Layers,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { MarketingService } from '../../services/api';
import { MarketingCampaignItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

export const MarketingPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [campaigns, setCampaigns] = useState<MarketingCampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaignItem | null>(null);
  const [generatingContentId, setGeneratingContentId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // New Campaign Form
  const [formData, setFormData] = useState({
    name: '',
    product: 'VentureOS Enterprise',
    objective: 'Lead Generation',
    audience: 'Founders & Heads of Operations',
    platform: 'LinkedIn & Search Ads',
    budget: 6000,
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await MarketingService.list();
      if (res.data.success) {
        setCampaigns(res.data.data.campaigns || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [activeWorkspace]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await MarketingService.create(formData);
      if (res.data.success) {
        setCreateModalOpen(false);
        fetchCampaigns();
      }
    } catch (err) {
      console.error('Failed to create campaign:', err);
    }
  };

  const handleGenerateAIContent = async (id: string) => {
    setGeneratingContentId(id);
    try {
      const res = await MarketingService.generateAIContent(id);
      if (res.data.success) {
        await fetchCampaigns();
        const updated = (res.data.data?.campaign || res.data.data);
        if (updated) setSelectedCampaign(updated);
      }
    } catch (err) {
      console.error('Failed to generate AI content:', err);
    } finally {
      setGeneratingContentId(null);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
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
            <Megaphone className="w-6 h-6 text-indigo-600" />
            Marketing & AI Content Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data-backed multi-channel campaigns, AI copywriting, persona strategies, and ROI attribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateModalOpen(true)} icon={<Plus className="w-3.5 h-3.5" />}>
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {campaigns.map((camp) => {
          const perf = camp.performanceMetrics || {
            impressions: 42000,
            clicks: 1800,
            conversions: 84,
            spend: 3200,
            revenue: 16500,
            ctr: 4.2,
            cac: 38,
            roi: 4.15,
          };

          return (
            <Card key={camp._id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-900">{camp.name}</h3>
                  <Badge variant={camp.status === 'active' ? 'success' : 'info'} size="sm">
                    {camp.status}
                  </Badge>
                </div>

                <div className="text-xs text-slate-500 mb-3">
                  {camp.platform} • Target: {camp.audience}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Clicks</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {(perf.clicks || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">CTR</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{perf.ctr || 0}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">ROI</div>
                    <div className="text-xs font-bold text-emerald-600 mt-0.5">{perf.roi || 0}x</div>
                  </div>
                </div>

                {camp.aiContent?.strategy && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {camp.aiContent.strategy}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  variant="ai"
                  size="sm"
                  loading={generatingContentId === camp._id}
                  onClick={() => handleGenerateAIContent(camp._id)}
                  icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200" />}
                >
                  Generate Content
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedCampaign(camp)}
                >
                  View Assets
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Campaign Content Studio Drawer / Modal */}
      {selectedCampaign && (
        <Modal
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          title={`AI Content Studio: ${selectedCampaign.name}`}
          size="lg"
        >
          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {selectedCampaign.aiContent ? (
              <div className="space-y-4">
                {/* Strategy */}
                {selectedCampaign.aiContent.strategy && (
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-400 mb-1">
                      Campaign Strategy & Core Narrative
                    </div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                      {selectedCampaign.aiContent.strategy}
                    </p>
                  </div>
                )}

                {/* Social Posts */}
                {selectedCampaign.aiContent.socialPosts && (
                  <div>
                    <div className="text-xs font-bold uppercase text-indigo-700 mb-2">
                      Social Posts ({selectedCampaign.aiContent.socialPosts.length})
                    </div>
                    <div className="space-y-2">
                      {selectedCampaign.aiContent.socialPosts.map((post, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">{post.platform}</span>
                            <button
                              onClick={() => handleCopy(post.postContent, i)}
                              className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-[11px]"
                            >
                              {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedIndex === i ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                            {post.postContent}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Sequences */}
                {selectedCampaign.aiContent.emailSequences && (
                  <div>
                    <div className="text-xs font-bold uppercase text-indigo-700 mb-2">
                      Email Outreach Sequence
                    </div>
                    <div className="space-y-2">
                      {selectedCampaign.aiContent.emailSequences.map((seq, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="font-bold text-slate-900 mb-1">
                            Step {seq.step}: {seq.subject}
                          </div>
                          <p className="text-slate-700 whitespace-pre-line">{seq.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-xs font-semibold">No AI content generated yet for this campaign.</div>
                <Button
                  variant="ai"
                  size="sm"
                  className="mt-3"
                  onClick={() => handleGenerateAIContent(selectedCampaign._id)}
                >
                  Generate Content Now
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create Campaign Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Marketing Campaign"
        size="md"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <Input
            label="Campaign Name"
            placeholder="Q3 Enterprise ABM Outbound"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Product / Service"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              required
            />
            <Input
              label="Primary Objective"
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Audience"
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              required
            />
            <Input
              label="Ad Budget ($)"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Primary Channel
            </label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full rounded-lg border border-slate-300 text-xs p-2.5 focus:border-indigo-500 focus:outline-none"
            >
              <option value="LinkedIn & Search Ads">LinkedIn & Search Ads</option>
              <option value="Cold Email Sequence">Cold Email Sequence</option>
              <option value="Social & Community">Social & Community</option>
              <option value="Google Search PPC">Google Search PPC</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Launch Campaign</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
