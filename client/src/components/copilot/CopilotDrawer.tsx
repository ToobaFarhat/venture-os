import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Bot, CheckCircle2, ShieldAlert, MessageSquare, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { CopilotService } from '../../services/api';

export interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actionProposal?: {
    actionType: string;
    payload: any;
    status: 'pending' | 'approved' | 'executed';
  };
}

// ── Lightweight markdown renderer ──────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let keyCounter = 0;

  const inlineFormat = (line: string): React.ReactNode => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1 py-0.5 bg-slate-100 text-blue-700 rounded text-[10px] font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    if (/^#{1,3}\s/.test(line)) {
      const text = line.replace(/^#{1,3}\s/, '');
      elements.push(
        <p key={keyCounter++} className="font-bold text-slate-900 mt-2 mb-0.5">
          {inlineFormat(text)}
        </p>,
      );
      i++;
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      const bulletItems: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        bulletItems.push(lines[i].replace(/^[-*]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={keyCounter++} className="list-disc list-inside space-y-0.5 my-1 text-slate-700">
          {bulletItems.map((item, bi) => (
            <li key={bi} className="leading-relaxed">
              {inlineFormat(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const numItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        numItems.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={keyCounter++} className="list-decimal list-inside space-y-0.5 my-1 text-slate-700">
          {numItems.map((item, ni) => (
            <li key={ni} className="leading-relaxed">
              {inlineFormat(item)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    elements.push(
      <p key={keyCounter++} className="text-slate-700 leading-relaxed">
        {inlineFormat(line)}
      </p>,
    );
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}

function getStorageKey(): string {
  const wsId = localStorage.getItem('ventureos_workspace_id') ?? 'default';
  return `copilot_conv_${wsId}`;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    `Hello! I'm your **VentureOS Business Copilot**.\n\n` +
    `I have authorized access to your live CRM, financial records, sprint tasks, and customer feedback.\n\n` +
    `Ask me anything about your metrics or operations — I will fetch verified database records and propose approved actions.`,
};

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [turnCount, setTurnCount] = useState(0);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!isOpen || historyLoaded) return;
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.conversationId && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          setConversationId(parsed.conversationId);
          setMessages(parsed.messages);
          setTurnCount(parsed.turnCount ?? parsed.messages.filter((m: ChatMessage) => m.role === 'user').length);
        }
      }
    } catch {
      // Ignore parse failure
    } finally {
      setHistoryLoaded(true);
    }
  }, [isOpen, historyLoaded]);

  useEffect(() => {
    if (!historyLoaded) return;
    if (conversationId && messages.length > 1) {
      try {
        localStorage.setItem(
          getStorageKey(),
          JSON.stringify({ conversationId, messages, turnCount }),
        );
      } catch {
        // Ignore storage failure
      }
    }
  }, [conversationId, messages, turnCount, historyLoaded]);

  const handleNewThread = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
    } catch {}
    setConversationId(undefined);
    setMessages([WELCOME_MESSAGE]);
    setTurnCount(0);
    setInput('');
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userText },
    ];
    setMessages(newMessages);
    setLoading(true);
    setTurnCount((prev) => prev + 1);

    try {
      const res = await CopilotService.chat(userText, conversationId);

      if (res.data.success) {
        const { data } = res.data;
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
            actionProposal: data.actionProposal,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ I encountered an issue querying the backend. Please ensure your workspace is active and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAction = async (msgIndex: number, actionProposal: any) => {
    try {
      const res = await CopilotService.approveAction({
        actionType: actionProposal.actionType,
        payload: actionProposal.payload,
        conversationId,
        messageIndex: msgIndex,
      });

      if (res.data.success) {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[msgIndex]?.actionProposal) {
            updated[msgIndex] = {
              ...updated[msgIndex],
              actionProposal: { ...updated[msgIndex].actionProposal!, status: 'executed' },
            };
          }
          updated.push({
            role: 'assistant',
            content: `✅ Done! **${actionProposal.actionType.replace('create', '')}** was created successfully in your workspace database.`,
          });
          return updated;
        });
      }
    } catch {
      alert('Failed to execute action. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col">

          {/* Header */}
          <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-tight text-white uppercase">AI Business Copilot</h3>
                <p className="text-[10.5px] text-slate-400 font-mono">
                  {conversationId
                    ? `Thread active • ${turnCount} exchange${turnCount !== 1 ? 's' : ''}`
                    : '10 Read-Only Tools Authorized'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {conversationId && (
                <button
                  onClick={handleNewThread}
                  title="Start new thread"
                  className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-900 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick suggestion pills (only before start) */}
          {turnCount === 0 && !conversationId && (
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-[11px] custom-scrollbar">
              {[
                { label: '📊 Sales Pipeline', q: 'What does our sales pipeline look like?' },
                { label: '💰 Cash & Runway', q: 'Show me our net revenue, MRR, and burn rate' },
                { label: '⚠️ Churn Risks', q: 'Which customers are at highest churn risk?' },
                { label: '✅ Overdue Tasks', q: 'How many tasks are overdue and which are highest priority?' },
              ].map(({ label, q }) => (
                <button
                  key={label}
                  onClick={() => setInput(q)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-slate-900 hover:border-slate-300 whitespace-nowrap transition-colors shadow-2xs font-medium"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 text-xs leading-relaxed ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-slate-900 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-lg max-w-[85%] ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 shadow-card'
                  }`}
                >
                  {m.role === 'assistant'
                    ? renderMarkdown(m.content)
                    : <div className="whitespace-pre-wrap">{m.content}</div>}

                  {/* Action Proposal Card */}
                  {m.actionProposal && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                        <span>Action Proposal: {m.actionProposal.actionType}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200 my-2 overflow-x-auto">
                        {JSON.stringify(m.actionProposal.payload, null, 2)}
                      </div>
                      {m.actionProposal.status === 'executed' ? (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Committed to MongoDB
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApproveAction(idx, m.actionProposal)}
                          className="w-full mt-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-sm transition-colors"
                        >
                          Confirm &amp; Commit Action
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
                Querying database tools and synthesizing context…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot about revenue, pipeline, customer health…"
              className="flex-1 text-xs px-3.5 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
