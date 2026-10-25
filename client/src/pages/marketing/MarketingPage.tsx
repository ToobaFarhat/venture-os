import React, { useEffect, useState } from 'react';
import {
  Megaphone,
  Plus,
  Sparkles,
  TrendingUp,
  Target,
  DollarSign,
  Layers,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  FileText,
  Mail,
  Share2,
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

const initialForm = {
  name: '',
  product: '',
  objective: '',
  audience: '',
  platform: 'LinkedIn & Search Ads',
  budget: '',
};

export const MarketingPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [campaigns, setCampaigns] = useState<MarketingCampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaignItem | null>(null);
  const [generatingContentId, setGeneratingContentId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // New Campaign Form
  const [formData, setFormData] = useState(initialForm);

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

  const handleOpenCreateModal = () => {
    setFormData(initialForm);
    setCreateError(null);
    setCreateModalOpen(true);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.product.trim() || !formData.objective.trim()) {
      setCreateError('Campaign Name, Product / Service, and Primary Objective are required.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const res = await MarketingService.create({
        ...formData,
        name: formData.name.trim(),
        product: formData.product.trim(),
        objective: formData.objective.trim(),
        audience: formData.audience.trim() || 'Enterprise B2B Decision Makers',
        budget: Number(formData.budget) || 0,
      });

      if (res.data.success) {
        setCreateModalOpen(false);
        setFormData(initialForm);
        await fetchCampaigns();
      } else {
        setCreateError(res.data.error || 'Failed to create campaign');
      }
    } catch (err: any) {
      console.error('Failed to create campaign:', err);
      setCreateError(err.response?.data?.error || err.message || 'Failed to create campaign. Please check inputs.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleGenerateAIContent = async (id: string) => {
    setGeneratingContentId(id);
    try {
      const res = await MarketingService.generateAIContent(id);
      if (res.data.success) {
        await fetchCampaigns();
        const updated = res.data.data?.campaign || res.data.data;
        if (updated) setSelectedCampaign(updated);
      }
    } catch (err) {
      console.error('Failed to generate AI content:', err);
    } finally {
      setGeneratingContentId(null);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
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
            <Megaphone className="w-6 h-6 text-indigo-600" />
            AI Marketing Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Formulate multi-channel go-to-market strategies, target buyer personas, ad copy variations, and outbound email sequences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleOpenCreateModal} icon={<Plus className="w-3.5 h-3.5" />}>
            + New Campaign
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
                  <span className="font-semibold text-indigo-600">{camp.product}</span> • {camp.platform}
                  {camp.audience && <div className="text-[11px] text-slate-400 mt-0.5 truncate">Target: {camp.audience}</div>}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Budget</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      ${(camp.budget || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Clicks</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{(perf.clicks || 0).toLocaleString()}</div>
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
                  {camp.aiContent ? 'Regenerate Strategy' : 'Generate AI Strategy'}
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
              <div className="space-y-5">
                {/* Strategy */}
                {selectedCampaign.aiContent.strategy && (
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-indigo-600" />
                      Campaign Strategy & Core Narrative
                    </div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                      {selectedCampaign.aiContent.strategy}
                    </p>
                  </div>
                )}

                {/* Target Personas */}
                {selectedCampaign.aiContent.personas && selectedCampaign.aiContent.personas.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-400 mb-1.5">
                      Target Buyer Personas
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedCampaign.aiContent.personas.map((persona, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 font-medium">
                          &bull; {persona}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ad Copy Variations */}
                {selectedCampaign.aiContent.adCopy && selectedCampaign.aiContent.adCopy.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase text-indigo-700 mb-2 flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5" />
                      Ad Copy Variations ({selectedCampaign.aiContent.adCopy.length})
                    </div>
                    <div className="space-y-2">
                      {selectedCampaign.aiContent.adCopy.map((ad, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">{ad.headline}</span>
                            <button
                              onClick={() => handleCopy(`${ad.headline}\n${ad.description}\nCTA: ${ad.callToAction}`, `ad_${i}`)}
                              className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-[11px]"
                            >
                              {copiedIndex === `ad_${i}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedIndex === `ad_${i}` ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <p className="text-slate-600 text-[11px] mb-1.5">{ad.description}</p>
                          <span className="inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-semibold">
                            CTA: {ad.callToAction}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Posts */}
                {selectedCampaign.aiContent.socialPosts && selectedCampaign.aiContent.socialPosts.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase text-indigo-700 mb-2 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5" />
                      Social Posts ({selectedCampaign.aiContent.socialPosts.length})
                    </div>
                    <div className="space-y-2">
                      {selectedCampaign.aiContent.socialPosts.map((post, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">{post.platform}</span>
                            <button
                              onClick={() => handleCopy(post.postContent, `post_${i}`)}
                              className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-[11px]"
                            >
                              {copiedIndex === `post_${i}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedIndex === `post_${i}` ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[11px]">
                            {post.postContent}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Sequences */}
                {selectedCampaign.aiContent.emailSequences && selectedCampaign.aiContent.emailSequences.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase text-indigo-700 mb-2 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      Email Outreach Sequence
                    </div>
                    <div className="space-y-2">
                      {selectedCampaign.aiContent.emailSequences.map((seq, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">Step {seq.step}: {seq.subject}</span>
                            <button
                              onClick={() => handleCopy(`Subject: ${seq.subject}\n\n${seq.body}`, `email_${i}`)}
                              className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-[11px]"
                            >
                              {copiedIndex === `email_${i}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedIndex === `email_${i}` ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <p className="text-slate-700 whitespace-pre-line text-[11px] leading-relaxed">{seq.body}</p>
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
                  loading={generatingContentId === selectedCampaign._id}
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
          {createError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <Input
            label="Campaign Name"
            placeholder="e.g. Q4 Enterprise SaaS Modernization"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Product / Service"
              placeholder="e.g. Northstar Desk & Insights"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              required
            />
            <Input
              label="Primary Objective"
              placeholder="e.g. Lead Generation & Inbound Demos"
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Audience"
              placeholder="e.g. VPs of Engineering & Support Leads"
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              required
            />
            <Input
              label="Ad Budget ($)"
              type="number"
              placeholder="e.g. 8000"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
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
              className="w-full rounded-lg border border-slate-300 text-xs p-2.5 focus:border-indigo-500 focus:outline-none bg-white"
            >
              <option value="LinkedIn & Search Ads">LinkedIn & Search Ads</option>
              <option value="LinkedIn Sponsored Content">LinkedIn Sponsored Content</option>
              <option value="Google Search PPC">Google Search PPC</option>
              <option value="Cold Email Sequence">Cold Email Sequence</option>
              <option value="Multi-Channel">Multi-Channel</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createLoading}>
              Create Campaign
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
