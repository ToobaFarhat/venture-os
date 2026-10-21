import React, { useEffect, useState } from 'react';
import {
  MessageSquareQuote,
  Plus,
  Upload,
  Sparkles,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { FeedbackService } from '../../services/api';
import { FeedbackItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

export const FeedbackPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [topicFilter, setTopicFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    customerName: '',
    content: '',
    source: 'Email Survey',
    rating: 5,
    topic: 'product',
  });

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await FeedbackService.list();
      if (res.data.success) {
        setFeedbackList(res.data.data.feedbacks || res.data.data.feedback || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [activeWorkspace]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await FeedbackService.create(formData);
      if (res.data.success) {
        setCreateModalOpen(false);
        setFormData({
          customerName: '',
          content: '',
          source: 'Email Survey',
          rating: 5,
          topic: 'product',
        });
        fetchFeedback();
      }
    } catch (err) {
      console.error('Failed to create feedback:', err);
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setImporting(true);
    const form = new FormData();
    form.append('file', csvFile);

    try {
      const res = await FeedbackService.importCsv(form);
      if (res.data.success) {
        setImportModalOpen(false);
        setCsvFile(null);
        fetchFeedback();
      }
    } catch (err) {
      console.error('Failed to import feedback CSV:', err);
    } finally {
      setImporting(false);
    }
  };

  const filtered = feedbackList.filter((item) => {
    const matchTopic = topicFilter === 'all' || item.topic === topicFilter;
    const matchSentiment = sentimentFilter === 'all' || item.sentiment === sentimentFilter;
    return matchTopic && matchSentiment;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const positiveCount = feedbackList.filter((f) => f.sentiment === 'positive').length;
  const neutralCount = feedbackList.filter((f) => f.sentiment === 'neutral').length;
  const negativeCount = feedbackList.filter((f) => f.sentiment === 'negative').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <MessageSquareQuote className="w-6 h-6 text-indigo-600" />
            Customer Feedback & Sentiment Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated sentiment NLP, topic classification, urgency scoring, and retention trigger actions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)} icon={<Upload className="w-3.5 h-3.5" />}>
            Import CSV
          </Button>
          <Button size="sm" onClick={() => setCreateModalOpen(true)} icon={<Plus className="w-3.5 h-3.5" />}>
            Log Feedback
          </Button>
        </div>
      </div>

      {/* Sentiment Overview Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Positive Sentiment</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{positiveCount}</div>
            <div className="text-[10px] text-slate-400">Advocates & satisfaction</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Smile className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-slate-400">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Neutral / Inquiries</div>
            <div className="text-2xl font-black text-slate-700 mt-0.5">{neutralCount}</div>
            <div className="text-[10px] text-slate-400">Feature requests & questions</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Meh className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-rose-500">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Negative / Churn Risks</div>
            <div className="text-2xl font-black text-rose-600 mt-0.5">{negativeCount}</div>
            <div className="text-[10px] text-slate-400">Requires swift remediation</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Frown className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Topic:</span>
          {['all', 'product', 'pricing', 'support', 'delivery'].map((t) => (
            <button
              key={t}
              onClick={() => setTopicFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                topicFilter === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Sentiment:</span>
          {['all', 'positive', 'neutral', 'negative'].map((s) => (
            <button
              key={s}
              onClick={() => setSentimentFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                sentimentFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Stream Grid */}
      <div className="space-y-3">
        {filtered.map((fb) => (
          <Card key={fb._id} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-slate-900">{fb.customerName}</span>
                  <span className="text-[11px] text-slate-400 font-medium">via {fb.source}</span>
                  <Badge
                    variant={fb.sentiment === 'positive' ? 'success' : fb.sentiment === 'neutral' ? 'info' : 'danger'}
                    size="sm"
                  >
                    {fb.sentiment}
                  </Badge>
                  <Badge variant="secondary" size="sm" className="capitalize">
                    {fb.topic}
                  </Badge>
                  {fb.urgency && fb.urgency !== 'low' && (
                    <Badge variant={fb.urgency === 'critical' || fb.urgency === 'high' ? 'danger' : 'warning'} size="sm">
                      {fb.urgency} urgency
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "{fb.content}"
                </p>

                {fb.suggestedAction && (
                  <div className="mt-2 text-[11px] text-indigo-900 bg-indigo-50/60 border border-indigo-100 p-2 rounded-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span><strong>Suggested Remediation:</strong> {fb.suggestedAction}</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 flex-shrink-0">
                {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : 'Recent'}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Log Feedback Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Log Customer Feedback"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Customer or Contact Name"
            placeholder="David Henderson (Apex Cloud)"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Feedback Content
            </label>
            <textarea
              rows={4}
              placeholder="e.g. The automated reporting pipeline is fantastic, but we experienced a 2-hour delay in yesterday's sync..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-3 text-xs focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Topic
              </label>
              <select
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full rounded-lg border border-slate-300 text-xs p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="product">Product & Features</option>
                <option value="pricing">Pricing & Billing</option>
                <option value="support">Customer Support</option>
                <option value="delivery">Delivery & SLA</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Source Channel
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full rounded-lg border border-slate-300 text-xs p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Email Survey">Email Survey</option>
                <option value="Support Ticket">Support Ticket</option>
                <option value="Quarterly Review">Quarterly Review</option>
                <option value="Direct Call">Direct Call</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit & Analyze</Button>
          </div>
        </form>
      </Modal>

      {/* Import CSV Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Customer Feedback CSV"
        size="md"
      >
        <form onSubmit={handleImportCsv} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-600"
              required
            />
            <p className="text-[10px] text-slate-400 mt-2">
              CSV should contain headers: <code>customerName, content, source, rating</code>
            </p>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={importing}>
              Import & Process
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
