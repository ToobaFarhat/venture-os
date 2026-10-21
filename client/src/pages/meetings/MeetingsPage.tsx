import React, { useEffect, useState } from 'react';
import {
  Video,
  Plus,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  CheckSquare,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { MeetingService } from '../../services/api';
import { MeetingItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

export const MeetingsPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Analysis modal
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTranscript, setMeetingTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Selected meeting detail
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(null);
  const [approvingItemId, setApprovingItemId] = useState<string | null>(null);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await MeetingService.list();
      if (res.data.success) {
        setMeetings(res.data.data.meetings || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [activeWorkspace]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTranscript.trim()) return;

    setAnalyzing(true);
    try {
      const res = await MeetingService.analyze({
        title: meetingTitle || `Meeting: ${new Date().toLocaleDateString()}`,
        transcript: meetingTranscript,
        date: new Date().toISOString(),
      });
      if (res.data.success) {
        setAnalyzeModalOpen(false);
        setMeetingTitle('');
        setMeetingTranscript('');
        fetchMeetings();
        setSelectedMeeting(res.data.data);
      }
    } catch (err) {
      console.error('Failed to analyze meeting transcript:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApproveActionItem = async (meetingId: string, actionItemId: string, itemTitle: string) => {
    setApprovingItemId(actionItemId);
    try {
      const res = await MeetingService.approveActionItem(meetingId, actionItemId, {
        title: itemTitle,
        priority: 'high',
      });
      if (res.data.success) {
        // Refresh meeting list and selected meeting
        await fetchMeetings();
        if (selectedMeeting && selectedMeeting._id === meetingId) {
          setSelectedMeeting({
            ...selectedMeeting,
            actionItems: selectedMeeting.actionItems.map((item) =>
              item._id === actionItemId ? { ...item, status: 'approved' } : item
            ),
          });
        }
      }
    } catch (err) {
      console.error('Failed to approve action item:', err);
    } finally {
      setApprovingItemId(null);
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
            <Video className="w-6 h-6 text-indigo-600" />
            Meeting Intelligence & Action Execution
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Turn meeting transcripts and stakeholder conversations into structured decisions and approved tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setAnalyzeModalOpen(true)} icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200" />}>
            Analyze New Meeting
          </Button>
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {meetings.map((m) => (
          <Card key={m._id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(m.date).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                {m.summary}
              </p>

              <div className="flex items-center justify-between text-xs font-semibold py-2 border-y border-slate-100 mb-3">
                <span className="text-slate-600">Action Items: {m.actionItems?.length || 0}</span>
                <span className="text-indigo-600">Decisions: {m.keyDecisions?.length || 0}</span>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => setSelectedMeeting(m)}>
              Review Decisions & Action Items
            </Button>
          </Card>
        ))}
      </div>

      {/* Selected Meeting Details Modal */}
      {selectedMeeting && (
        <Modal
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          title={`Meeting Intelligence: ${selectedMeeting.title}`}
          size="lg"
        >
          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {/* Executive Summary */}
            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Executive Summary</div>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                {selectedMeeting.summary}
              </p>
            </div>

            {/* Key Decisions */}
            {selectedMeeting.keyDecisions && selectedMeeting.keyDecisions.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase text-emerald-700 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Confirmed Strategic Decisions
                </div>
                <ul className="space-y-1">
                  {selectedMeeting.keyDecisions.map((dec, i) => (
                    <li key={i} className="text-xs text-slate-800 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                      &bull; {dec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items with 1-Click Task Creation */}
            <div>
              <div className="text-xs font-bold uppercase text-indigo-700 mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                Action Items & Human Approval
              </div>
              <div className="space-y-2">
                {selectedMeeting.actionItems?.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Assignee: {item.suggestedAssignee || 'Unassigned'} • Due:{' '}
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Next Sprint'}
                      </div>
                    </div>

                    <div>
                      {item.status === 'approved' ? (
                        <Badge variant="success" size="sm">
                          Task Created
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          loading={approvingItemId === item._id}
                          onClick={() => handleApproveActionItem(selectedMeeting._id, item._id, item.title)}
                        >
                          Approve & Create Task
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Transcript Analysis Modal */}
      <Modal
        isOpen={analyzeModalOpen}
        onClose={() => setAnalyzeModalOpen(false)}
        title="Analyze Meeting Transcript with AI"
        size="lg"
      >
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Meeting Title
            </label>
            <input
              type="text"
              placeholder="Q3 Product & Enterprise Sales Sync"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Transcript or Meeting Notes Content
            </label>
            <textarea
              rows={8}
              placeholder="Paste raw transcript, Zoom/Teams notes, or meeting takeaways here...
e.g. Alex agreed we need to accelerate the SOC2 audit before closing the NovaPulse deal. Sarah is assigned to finalize the API docs by Friday..."
              value={meetingTranscript}
              onChange={(e) => setMeetingTranscript(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 text-xs focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setAnalyzeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="ai" type="submit" loading={analyzing} icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200" />}>
              Extract Intelligence & Actions
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
