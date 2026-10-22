import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Bot,
  Activity,
  DollarSign,
  Users,
  FolderKanban,
  FileText,
  Video,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Database,
  Lock,
  Layers,
  Terminal,
  Cpu,
  Sparkles,
  AlertTriangle,
  Radio,
  BarChart3,
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const HomePage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<'feedback' | 'pipeline' | 'rag'>('feedback');

  const capabilities = [
    {
      title: 'Deterministic FP&A Engine',
      category: 'Finance & Runway',
      desc: 'Exact OLS linear regression forecasting for 30/60/90-day cash runway and MRR trajectory based on real MongoDB ledger records. Zero LLM arithmetic hallucinations.',
      icon: DollarSign,
      metric: '30/60/90 Day',
      metricLabel: 'Linear Cashflow Projections',
    },
    {
      title: 'Context-Aware AI Copilot',
      category: 'Bounded Tool Calling',
      desc: 'Floating intelligence drawer equipped with 10 read-only database inspection tools. Synthesizes operational trends and prepares structured Action Proposals for human review.',
      icon: Bot,
      metric: '10 Tools',
      metricLabel: 'Strictly Read-Only Queries',
    },
    {
      title: 'Cross-Module Risk Center',
      category: 'Autonomous Correlation',
      desc: 'Continuously correlates lead pipeline stagnation, customer sentiment drops, cash burn acceleration, and delayed sprint tasks into consolidated mitigation tasks.',
      icon: Shield,
      metric: '5 Dimensions',
      metricLabel: 'Sales, Support, Ops, Finance, Health',
    },
    {
      title: 'Knowledge Base Vector RAG',
      category: 'Document Intelligence',
      desc: 'Native multi-format ingestion for PDF, DOCX, CSV, and TXT with 250-word sliding window chunking, 768-dim embeddings, and grounded citation badges.',
      icon: FileText,
      metric: '100% Grounded',
      metricLabel: 'Exact Source Chunk Citations',
    },
    {
      title: 'AI Lead Scoring & Sales Assistant',
      category: 'Revenue Pipeline',
      desc: '0-100 conversion propensity scoring with transparent factor weighting, personalized objection handling, and automated pitch draft generation.',
      icon: Users,
      metric: '0-100 Score',
      metricLabel: 'Explainable Conversion Propensity',
    },
    {
      title: 'Meeting Intelligence & Converter',
      category: 'Execution Velocity',
      desc: 'Ingests transcripts to extract confirmed decisions, requirements, and structured action items with 1-click instantiation into the Projects Kanban.',
      icon: Video,
      metric: '1-Click',
      metricLabel: 'Transcript to Project Tasks',
    },
  ];

  const solutions = [
    {
      role: 'Founders & CEOs',
      headline: 'Unified Single Pane of Glass',
      desc: 'Correlate real-time ARR trajectory with customer sentiment and product roadmap health without chasing updates across 5 disconnected tools.',
      benefits: ['Automated linear cash runway models', 'Cross-module churn risk alerts', 'Executive briefing synthesis'],
    },
    {
      role: 'Product & Engineering',
      headline: 'Decision-to-Execution Velocity',
      desc: 'Turn meeting transcripts and customer feedback into prioritized project tasks and track sprint progress alongside revenue impact.',
      benefits: ['1-click meeting transcript task converter', 'Sprint bottleneck forecasting', 'Workspace document RAG citations'],
    },
    {
      role: 'Sales & Growth Teams',
      headline: 'High-Conversion Deal Intelligence',
      desc: 'Score inbound leads with 0-100 propensity models, generate personalized pitch emails, and auto-convert closed deals to active client accounts.',
      benefits: ['Predictive lead scoring algorithms', 'AI objection handling assistant', 'Seamless CRM-to-customer transition'],
    },
  ];

  const faqs = [
    {
      q: 'How does VentureOS eliminate LLM financial arithmetic hallucinations?',
      a: 'We strictly decouple math from generative AI. All key metrics—MRR, ARR, CAC, LTV, net burn rate, and cash runway—are calculated deterministically by pure TypeScript backend algorithms. The AI layer receives pre-computed numerical summaries and is restricted to qualitative interpretation and strategic recommendations.',
    },
    {
      q: 'Can the AI Copilot make unilateral changes to our operational database?',
      a: 'Never. VentureOS enforces human-in-the-loop authorization. When the Copilot suggests creating a project, assigning tasks, or converting a lead, it emits a structured Action Proposal card in the UI. A workspace member must review and explicitly confirm the action before any record is created in MongoDB.',
    },
    {
      q: 'How does multi-tenant workspace isolation work?',
      a: 'Every operational collection in MongoDB contains an indexed workspaceId. All Express controllers pass through our resolveWorkspace middleware, which cryptographically verifies session membership against the database before executing any query. Tenant A can never query Tenant B data.',
    },
    {
      q: 'What document formats are supported by the RAG engine?',
      a: 'VentureOS natively extracts and parses PDF (pdf-parse), Microsoft Word DOCX (mammoth), CSV spreadsheets (csv-parse), and plain text. Chunks are generated with 250-word sliding windows and 40-word overlap, embedded with Google Gemini vectors, and retrieved using cosine similarity.',
    },
    {
      q: 'How is VentureOS hosted in production?',
      a: 'The application is deployed live in the cloud: the backend runs as a high-performance Node.js 22 Web Service on Render, the frontend runs as a static Single Page Application with SPA rewrites on Render, and data is persisted in a TLS 1.3-encrypted MongoDB Atlas replica set.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <PublicNavbar />

      <main>
        {/* ═══════════════════════════════════════════════════════════════
            HERO SECTION — Editorial, Confident & High-Clarity
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative pt-32 pb-24 border-b border-slate-800/80 overflow-hidden">
          {/* Subtle architectural grid pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Ambient Glow Orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Value Proposition & CTAs */}
              <div className="lg:col-span-7">
                {/* Micro Status Chip */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-400">Autonomous Operations Engine</span>
                  <span className="text-slate-700">/</span>
                  <span className="text-blue-400 font-semibold">v2.4 Active</span>
                </div>

                {/* Primary Value Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                  The closed-loop intelligence engine for modern tech ventures.
                </h1>

                {/* Sub-headline */}
                <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-2xl">
                  VentureOS connects CRM, sprint execution, transaction ledgers, and customer health into a unified operational schema—powered by deterministic FP&A analytics and bounded AI decision support.
                </p>

                {/* Primary Actions */}
                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all active:scale-[0.98]"
                  >
                    <span>Deploy Free Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors"
                  >
                    <span>Sign In with 1-Click Demo</span>
                  </Link>
                </div>

                {/* Key Trust Metrics */}
                <div className="mt-12 pt-8 border-t border-slate-900 grid grid-cols-3 gap-6 text-left">
                  <div>
                    <div className="text-2xl font-bold text-white tracking-tight">10 Modules</div>
                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Unified Schema</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400 tracking-tight">Zero Math Drift</div>
                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Deterministic Math</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400 tracking-tight">100% Isolated</div>
                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Tenant Scoped</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Autonomous Intelligence Console */}
              <div className="lg:col-span-5 relative">
                {/* Architectural Frame with subtle float motion */}
                <div className="relative rounded-xl border border-slate-800 bg-slate-900/80 shadow-2xl p-5 backdrop-blur-xl animate-float-smooth overflow-hidden">
                  {/* Subtle Scan Line Effect */}
                  <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-blue-500/0 via-blue-500/5 to-transparent pointer-events-none animate-scan-line" />

                  {/* Header Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                        Live Intelligence Stream
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-blue-400 bg-blue-950/70 border border-blue-900 px-2 py-0.5 rounded">
                      Tenant: NovaPulse
                    </span>
                  </div>

                  {/* Operational Telemetry Cards */}
                  <div className="space-y-3 mt-4">
                    {/* Item 1: Revenue Telemetry */}
                    <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800/80 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-900 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">MRR Trajectory (Linear OLS)</span>
                          <span className="text-[10px] font-mono text-emerald-400">+18.4%</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Calculated from ledger. 14.2 months runway runway at $14,200/mo burn.
                        </p>
                      </div>
                    </div>

                    {/* Item 2: Risk Engine Alert */}
                    <div className="p-3.5 rounded-lg bg-slate-950/90 border border-rose-900/40 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-900 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">Churn Risk Detected</span>
                          <span className="text-[10px] font-mono text-rose-400 uppercase bg-rose-950 px-1.5 py-0.5 rounded border border-rose-900">
                            High (78%)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Acme Corp: Negative sentiment ticket + 2 overdue sprint deliverables.
                        </p>
                      </div>
                    </div>

                    {/* Item 3: Autonomous Copilot Action Proposal */}
                    <div className="p-3.5 rounded-lg bg-blue-950/30 border border-blue-800/60 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">Copilot Action Proposal</span>
                          <span className="text-[10px] font-mono text-blue-300 uppercase bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-700">
                            Awaiting User
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          "Create Billing Resolution Sprint" linked to Task #104.
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready to commit
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">1-click approve</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom System Pulse Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-400" />
                      <span>Gemini-768 Vector Embeddings</span>
                    </span>
                    <span className="text-emerald-400">99.9% Grounded</span>
                  </div>
                </div>

                {/* Floating micro-badge positioned bottom-left */}
                <div className="absolute -bottom-4 -left-4 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 shadow-xl flex items-center gap-2 text-xs">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300 font-medium">Tenant-isolated MongoDB Atlas</span>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                INTERACTIVE PRODUCT PREVIEW CARD (Real Architecture Simulation)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="mt-20 rounded-xl border border-slate-800 bg-slate-900/60 shadow-2xl overflow-hidden">
              {/* Mock Window Top Bar */}
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-800" />
                  <span className="w-3 h-3 rounded-full bg-slate-800" />
                  <span className="w-3 h-3 rounded-full bg-slate-800" />
                  <span className="text-xs text-slate-500 font-mono ml-2">app.ventureos.io/dashboard</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900 font-mono">
                    Tenant: NovaPulse Analytics
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> API: Healthy
                  </span>
                </div>
              </div>

              {/* Realistic Dashboard Sample Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-900/40">
                {/* Metric 1 */}
                <div className="p-5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Monthly Recurring Revenue</span>
                    <span className="text-emerald-400 font-medium">+18.4% vs last mo</span>
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">$42,500</div>
                  <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Verified from General Ledger
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Cash Runway (Linear OLS)</span>
                    <span className="text-blue-400 font-medium">Burn: $14,200/mo</span>
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">14.2 Months</div>
                  <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> 30/60/90 Day Trend Model
                  </div>
                </div>

                {/* Metric 3: AI Copilot Action Proposal Preview */}
                <div className="p-5 rounded-lg bg-slate-950 border border-blue-900/60 relative hover:border-blue-700 transition-colors">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="text-blue-400 font-semibold flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5" /> Copilot Proposal
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900">
                      Pending Review
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white">Create Billing Resolution Sprint</div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    At-risk churn detected for Acme Corp. Auto-linked to 2 overdue engineering tasks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            THE CLOSED-LOOP INTELLIGENCE PIPELINE
        ═══════════════════════════════════════════════════════════════ */}
        <section id="intelligence" className="py-24 border-b border-slate-800/80 bg-slate-950">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">
                Unified Data Loop
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                How business data turns into executed decisions
              </h2>
              <p className="text-slate-400 mt-3 text-base">
                Rather than disjointed point solutions, VentureOS establishes a closed-loop sequence where every operational signal informs strategic remediation.
              </p>
            </div>

            {/* Interactive Workflow Tabs */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1 rounded-lg bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setSelectedWorkflow('feedback')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedWorkflow === 'feedback'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Customer Risk Workflow
                </button>
                <button
                  onClick={() => setSelectedWorkflow('pipeline')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedWorkflow === 'pipeline'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CRM Won-to-Customer
                </button>
                <button
                  onClick={() => setSelectedWorkflow('rag')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedWorkflow === 'rag'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Document RAG Ingestion
                </button>
              </div>
            </div>

            {/* Workflow Steps Display */}
            {selectedWorkflow === 'feedback' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs font-mono text-slate-500 mb-2">STAGE 01</div>
                  <h3 className="text-base font-semibold text-white">Negative Signal Ingestion</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Customer logs satisfaction feedback regarding invoice latency. Stored in MongoDB Feedback collection with sentiment score.
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs font-mono text-slate-500 mb-2">STAGE 02</div>
                  <h3 className="text-base font-semibold text-white">Health Index Recalibration</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Deterministic 5-Dimension Business Health calculator drops account health from 88 to 44. Churn likelihood is elevated.
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-slate-900/50 border border-blue-900/50 bg-blue-950/20">
                  <div className="text-xs font-mono text-blue-400 mb-2">STAGE 03</div>
                  <h3 className="text-base font-semibold text-white">Bounded Copilot Proposal</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    AI synthesizes CRM contract history and generates a structured Action Proposal card for a dedicated retention task.
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-slate-900/50 border border-emerald-900/50 bg-emerald-950/20">
                  <div className="text-xs font-mono text-emerald-400 mb-2">STAGE 04</div>
                  <h3 className="text-base font-semibold text-white">Human Approval & Commit</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Manager confirms proposal with 1-click in the UI. Task is committed to database and assigned to account owner.
                  </p>
                </div>
              </div>
            )}

            {selectedWorkflow === 'pipeline' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs font-mono text-slate-500 mb-2">STAGE 01</div>
                  <h3 className="text-base font-semibold text-white">AI Lead Scoring</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Prospect evaluated with 0-100 propensity score. High-probability deals flagged for sales outreach.
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs font-mono text-slate-500 mb-2">STAGE 02</div>
                  <h3 className="text-base font-semibold text-white">Sales Assistant Pitch</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    One-click generation of customized value proposition and objection handling tailored to lead industry.
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs font-mono text-slate-500 mb-2">STAGE 03</div>
                  <h3 className="text-base font-semibold text-white">Deal Move to Won</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Opportunity reaches contract signature. Rep clicks 'Convert to Customer' in CRM pipeline.
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-slate-900/50 border border-emerald-900/50 bg-emerald-950/20">
                  <div className="text-xs font-mono text-emerald-400 mb-2">STAGE 04</div>
                  <h3 className="text-base font-semibold text-white">Customer Record Creation</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Automations engine instantiates new Customer profile, initializes baseline health, and posts audit entry.
                  </p>
                </div>
              </div>
            )}

            {selectedWorkflow === 'rag' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs font-mono text-slate-500 mb-2">STAGE 01</div>
                  <h3 className="text-base font-semibold text-white">Multi-Format Ingestion</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Upload PDF, DOCX, CSV, or TXT. Verified with strict MIME types and 15MB quota guardrails.
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs font-mono text-slate-500 mb-2">STAGE 02</div>
                  <h3 className="text-base font-semibold text-white">250-Word Chunking</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Sliding window parser creates 250-word passages with 40-word overlap to guarantee contextual coherence.
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs font-mono text-slate-500 mb-2">STAGE 03</div>
                  <h3 className="text-base font-semibold text-white">Vector Search</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Google Gemini 768-dim vector embeddings searched via cosine similarity threshold (&gt;0.40).
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-slate-900/50 border border-emerald-900/50 bg-emerald-950/20">
                  <div className="text-xs font-mono text-emerald-400 mb-2">STAGE 04</div>
                  <h3 className="text-base font-semibold text-white">Grounded Answer & Source</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Synthesizes precise response citing exact document title and chunk index with zero external hallucination.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            CAPABILITIES GRID (Structured, Non-Repetitive Cards)
        ═══════════════════════════════════════════════════════════════ */}
        <section id="capabilities" className="py-24 border-b border-slate-800/80 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">
                  System Capabilities
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Engineered for enterprise rigor
                </h2>
              </div>
              <p className="text-slate-400 max-w-md text-sm mt-4 md:mt-0">
                Every module is built with strict compound indexing, role-based authorization, and real-time analytical telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((c) => (
                <div
                  key={c.title}
                  className="p-6 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                        <c.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {c.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white tracking-tight">{c.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{c.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{c.metric}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{c.metricLabel}</div>
                    </div>
                    <Link to="/login" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SOLUTIONS SECTION (id="solutions")
        ═══════════════════════════════════════════════════════════════ */}
        <section id="solutions" className="py-24 border-b border-slate-800/80 bg-slate-950">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">
                Tailored Workflows
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Designed for high-output venture teams
              </h2>
              <p className="text-slate-400 mt-3 text-base">
                Whether you lead company strategy, product delivery, or pipeline growth, VentureOS provides purpose-built workflows with zero fluff.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {solutions.map((sol) => (
                <div
                  key={sol.role}
                  className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-blue-400 mb-3">
                      {sol.role}
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                      {sol.headline}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                      {sol.desc}
                    </p>

                    <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
                      {sol.benefits.map((b) => (
                        <div key={b} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      <span>Explore {sol.role} Flow</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FAQ ACCORDION (Technical, Honest & Informative)
        ═══════════════════════════════════════════════════════════════ */}
        <section id="faq" className="py-24 border-b border-slate-800/80 bg-slate-950">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10">
            <div className="text-center mb-16">
              <div className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">
                Technical FAQ
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Architectural Questions & Answers
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={faq.q}
                  className="rounded-lg border border-slate-800 bg-slate-900/40 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-blue-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        activeFaq === idx ? 'rotate-180 text-blue-400' : ''
                      }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-6 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-850">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FINAL DEPLOYMENT CALL TO ACTION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800/80">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Ready to explore your autonomous workspace?
            </h2>
            <p className="text-slate-400 mt-4 text-base max-w-xl mx-auto">
              Test with pre-seeded demo accounts or register a brand-new multi-tenant workspace in seconds.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all"
              >
                <span>Deploy Free Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span>Sign In as Demo CEO</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};
