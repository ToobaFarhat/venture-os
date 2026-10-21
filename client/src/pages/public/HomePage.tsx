import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Shield, Zap, Bot, Activity, DollarSign, Users, FolderKanban, FileText, Video, CheckCircle2, ChevronDown, LineChart, Star, Globe, Lock } from "lucide-react";
import { PublicNavbar } from "../../components/layout/PublicNavbar";
import { PublicFooter } from "../../components/layout/PublicFooter";

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0; const inc = target / (1400 / 16);
    const t = setInterval(() => { start = Math.min(start + inc, target); setVal(Math.floor(start)); if (start >= target) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* Floating orb component */
function Orb({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`absolute rounded-full pointer-events-none ${className}`} style={style} />;
}

export const HomePage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const aiS = useInView(); const prodS = useInView(); const statsS = useInView();
  const solS = useInView(); const priceS = useInView(); const faqS = useInView();

  const stats = [
    { value: 10, suffix: "+", label: "Integrated Modules" },
    { value: 94, suffix: "%", label: "Churn Prediction Accuracy" },
    { value: 3, suffix: "x", label: "Faster Decisions" },
    { value: 99, suffix: "%", label: "Platform Uptime" },
  ];
  const faqs = [
    { q: "How does VentureOS differ from using separate CRM, PM, and BI tools?", a: "Disconnected tools create operational silos where your customer support sentiment never talks to your sales pipeline. VentureOS connects all 10 business modules into one MongoDB operational schema, enabling our AI Risk Engine to predict churn before revenue drops." },
    { q: "Does VentureOS prevent LLM arithmetic hallucinations?", a: "Yes. VentureOS strictly separates deterministic calculations from generative AI. All accounting metrics (MRR, burn rate, runway, CAC, LTV) are computed deterministically by backend microservices. The AI only interprets trends and formulates strategic recommendations." },
    { q: "Can the AI Copilot make unauthorized changes to our business data?", a: "Never. VentureOS enforces human-in-the-loop authorization. The Copilot generates structured action proposal cards requiring explicit user confirmation before any database record is created." },
    { q: "How does multi-tenant workspace isolation work?", a: "Every database record and document chunk is tagged with an indexed workspaceId. All REST endpoints strictly verify workspace membership from the authenticated session, preventing any cross-tenant data leakage." },
  ];
  const features = [
    { title: "AI Business Copilot", desc: "Context-aware assistant with authorized tool calling. Answers questions from real database records and prepares action proposals.", icon: Bot, tag: "Tool Calling", grad: "from-indigo-500 to-violet-500" },
    { title: "Document Intelligence & RAG", desc: "Upload PDF, DOCX, CSV. Natural language question answering grounded in workspace document vectors with source citations.", icon: FileText, tag: "Vector RAG", grad: "from-violet-500 to-purple-500" },
    { title: "Cross-Module Risk Engine", desc: "Heuristic correlation across CRM pipeline slowdowns, customer churn spikes, and project overdue bottlenecks.", icon: Shield, tag: "Predictive", grad: "from-rose-500 to-pink-500" },
    { title: "Deterministic FP&A Forecasting", desc: "30/60/90-day linear trend revenue projections and cash runway based on verified historical transactions.", icon: DollarSign, tag: "Finance", grad: "from-emerald-500 to-teal-500" },
    { title: "AI Lead Scoring & Sales Assistant", desc: "0-100 conversion propensity score with explainable reasons, objection handling, and personalized email outreach generator.", icon: Users, tag: "CRM", grad: "from-blue-500 to-cyan-500" },
    { title: "Meeting Intelligence", desc: "Paste or upload transcripts. AI automatically extracts decisions, requirements, and action items for 1-click task creation.", icon: Video, tag: "Productivity", grad: "from-amber-500 to-orange-500" },
  ];
  const solutions = [
    { industry: "SaaS & Software", icon: Bot, grad: "from-indigo-600 to-violet-600", headline: "Reduce Churn. Accelerate ARR.", description: "Link customer support sentiment to MRR impact in real time. AI flags at-risk accounts before renewals and scores your inbound pipeline.", useCases: ["AI Churn Prediction from Feedback", "Lead-to-ARR Pipeline Forecasting", "Sprint Velocity & Release Risk Tracking", "Automated Customer Health Scoring"] },
    { industry: "E-Commerce & Retail", icon: Activity, grad: "from-violet-600 to-purple-600", headline: "Maximize Margins. Retain Buyers.", description: "Correlate customer lifetime value with support ticket sentiment and campaign performance. AI recommends product bundling strategies.", useCases: ["LTV Segmentation & Cohort Analysis", "Fulfillment Risk Early-Warning", "Review Sentiment NLP Classification", "AI Content for Campaign Personalization"] },
    { industry: "Consulting & Agency", icon: FolderKanban, grad: "from-emerald-600 to-teal-600", headline: "Deliver On Time. Expand Accounts.", description: "Manage complex client engagements with AI project planning, meeting intelligence for client calls, and automated proposal generation.", useCases: ["AI Project Planner with Milestone Tracking", "Meeting Transcript to Action Items", "Document RAG for Proposal Generation", "Competitor & Market Research Synthesis"] },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <PublicNavbar />
      <main>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 overflow-hidden">

        {/* Animated background orbs */}
        <Orb className="w-[700px] h-[700px] bg-indigo-600/20 blur-[120px] top-[-10%] left-[-5%] animate-pulse-slow" />
        <Orb className="w-[500px] h-[500px] bg-violet-600/20 blur-[100px] bottom-[-5%] right-[10%] animate-pulse-slow" style={{ animationDelay: "2s" } as React.CSSProperties} />
        <Orb className="w-[300px] h-[300px] bg-blue-600/15 blur-[80px] top-[40%] right-[-5%] animate-float" />
        <Orb className="w-[250px] h-[250px] bg-purple-600/15 blur-[70px] bottom-[20%] left-[5%] animate-float-slow" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Radial fade */}
        <div className="absolute inset-0 bg-radial-gradient" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, #020617 100%)" }} />

        {/* Floating decorative elements */}
        <div className="absolute top-[20%] left-[8%] hidden xl:block animate-float-slow" style={{ animationDelay: "1s" }}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 backdrop-blur-sm flex items-center justify-center">
            <Bot className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
        <div className="absolute top-[35%] right-[7%] hidden xl:block animate-float" style={{ animationDelay: "0.5s" }}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 backdrop-blur-sm flex items-center justify-center">
            <LineChart className="w-5 h-5 text-violet-400" />
          </div>
        </div>
        <div className="absolute bottom-[30%] left-[6%] hidden xl:block animate-float-slow" style={{ animationDelay: "1.5s" }}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 backdrop-blur-sm flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 text-center">

          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Next-Gen Enterprise Business Intelligence & Operations
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 text-[10px] font-bold tracking-wider">AI-POWERED</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up-delay-1 text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] max-w-5xl mx-auto">
            <span className="text-white">One Connected</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">
              Platform.
            </span>
          </h1>

          <p className="animate-fade-up-delay-2 mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate software tool sprawl. VentureOS unifies your CRM, Customer Intelligence, Project Management, Financial Forecasting, and Document RAG into one proactive AI operating system.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <button className="group relative flex items-center gap-2.5 px-8 py-4 text-sm font-bold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/25">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:from-indigo-500 group-hover:to-violet-500 transition-all duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.4) 0%, transparent 70%)" }} />
                <Zap className="relative w-4 h-4" />
                <span className="relative">Deploy Your Workspace Free</span>
                <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/login">
              <button className="flex items-center gap-2 px-8 py-4 text-sm font-semibold text-slate-300 border border-white/15 rounded-2xl hover:border-white/30 hover:text-white hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-200">
                Explore Live Demo
              </button>
            </Link>
          </div>

          {/* Trust row */}
          <div className="animate-fade-up-delay-4 mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            {[{ icon: CheckCircle2, label: "14-Day Free Trial" }, { icon: Lock, label: "No Credit Card" }, { icon: Globe, label: "Multi-Tenant RBAC" }, { icon: Star, label: "Enterprise Grade" }].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"><Icon className="w-3.5 h-3.5 text-emerald-500" />{label}</span>
            ))}
          </div>

          {/* Dashboard Preview */}
          <div className="animate-fade-up-delay-4 mt-20 max-w-5xl mx-auto">
            {/* Glow behind preview */}
            <div className="absolute left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-600/20 blur-[60px] -mt-8" />
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 bg-slate-900/80 backdrop-blur-sm animate-float-slow">
              {/* Browser bar */}
              <div className="h-10 bg-slate-800/80 flex items-center px-4 gap-2 border-b border-white/5">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500/80" /><div className="w-3 h-3 rounded-full bg-amber-500/80" /><div className="w-3 h-3 rounded-full bg-emerald-500/80" /></div>
                <div className="flex-1 mx-4 h-5 rounded-md bg-slate-700/60 flex items-center px-3 text-[10px] text-slate-500 font-mono">ventureos.io/app/dashboard</div>
                <div className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">● LIVE</div>
              </div>
              <div className="p-5 bg-slate-900/50 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                {[
                  { label: "Monthly Recurring (MRR)", value: "$46,500", change: "↑ 18.4%", color: "text-emerald-400" },
                  { label: "CRM Conversion Rate", value: "32.8%", change: "AI Scoring Active", color: "text-emerald-400" },
                  { label: "Customer Health", value: "86 / 100", change: "1 at churn risk", color: "text-amber-400" },
                  { label: "Cash Runway", value: "14.2 Mo", change: "Margin 36.2%", color: "text-emerald-400" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-slate-800/60 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
                    <div className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-slate-400 transition-colors">{kpi.label}</div>
                    <div className="text-xl font-black text-white mt-1">{kpi.value}</div>
                    <div className={`text-[11px] font-medium mt-1 ${kpi.color}`}>{kpi.change}</div>
                  </div>
                ))}
                <div className="col-span-2 md:col-span-4 bg-gradient-to-r from-indigo-950/80 to-violet-950/80 p-4 rounded-xl border border-indigo-500/20 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 flex-shrink-0 border border-indigo-500/30"><Sparkles className="w-4 h-4" /></div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-indigo-300">Cross-Module Risk Engine Alert</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">Priority Action</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Specter Media submitted negative feedback citing custom export delays, lowering health score to 58. Recommended: Assign custom export task to protect $18,000 ARR.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-slate-900/60 border-y border-white/5">
        <div ref={statsS.ref} className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 text-center transition-all duration-700 ${statsS.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            {stats.map((s) => (
              <div key={s.label} className="group">
                <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  {statsS.inView ? <AnimatedNumber target={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wider group-hover:text-slate-400 transition-colors">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI WORKFLOW */}
      <section id="ai" className="py-24 bg-slate-950 border-b border-white/5 relative overflow-hidden">
        <Orb className="w-[400px] h-[400px] bg-violet-600/10 blur-[100px] top-0 right-0" />
        <div ref={aiS.ref} className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${aiS.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Deterministic + Generative Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight text-white">
              How Business Activity Turns into{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Autonomous Intelligence</span>
            </h2>
            <p className="text-base text-slate-400 mt-4 leading-relaxed">VentureOS connects every operational touchpoint through a closed-loop intelligence architecture. No fragmented data silos. No hallucinations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { step: "01", title: "Operational Activity", desc: "Sales calls, client feedback, project milestones, and expense receipts are logged in MongoDB.", icon: Users },
              { step: "02", title: "Deterministic Analytics", desc: "Backend microservices calculate MRR, CAC, LTV, and trend projections with arithmetic precision.", icon: LineChart },
              { step: "03", title: "AI Intelligence & Risk", desc: "Cross-module AI evaluates signals across sales, sentiment, and delivery to flag risks and opportunities.", icon: Sparkles },
              { step: "04", title: "Authorized Action", desc: "Review and approve AI-generated tasks, outreach emails, or marketing campaigns with 1-click execution.", icon: Zap },
            ].map((item, idx) => (
              <div key={idx} className={`relative bg-slate-900/80 rounded-2xl p-6 border border-white/5 hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 group ${aiS.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${idx * 100}ms` }}>
                <div className="text-3xl font-black text-slate-800 font-mono mb-3">{item.step}</div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-500/20 transition-colors"><item.icon className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="product" className="py-24 bg-slate-900/40 border-b border-white/5 relative overflow-hidden">
        <Orb className="w-[500px] h-[500px] bg-indigo-600/8 blur-[120px] bottom-0 left-0" />
        <div ref={prodS.ref} className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${prodS.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Enterprise Modules</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight text-white">Everything Your Business Needs In One System</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature, idx) => (
              <div key={idx} className={`group relative bg-slate-900/80 rounded-2xl p-6 border border-white/5 hover:border-white/15 hover:-translate-y-1 transition-all duration-300 overflow-hidden ${prodS.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${idx * 80}ms` }}>
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${feature.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${feature.grad} bg-opacity-10 border border-white/10`}><feature.icon className="w-5 h-5 text-white" /></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">{feature.tag}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="py-24 bg-slate-950 border-b border-white/5 relative overflow-hidden">
        <Orb className="w-[400px] h-[400px] bg-emerald-600/8 blur-[100px] top-0 right-1/4" />
        <div ref={solS.ref} className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${solS.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Built For Every Industry</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight text-white">Solutions Tailored to Your Business Model</h2>
            <p className="text-base text-slate-400 mt-4 leading-relaxed">Whether you run a SaaS company, an e-commerce brand, or a consulting firm, VentureOS adapts its AI modules to your exact operational context.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {solutions.map((sol, idx) => (
              <div key={idx} className={`group relative bg-slate-900/80 rounded-2xl border border-white/5 p-8 hover:border-white/15 hover:-translate-y-1 transition-all duration-300 overflow-hidden ${solS.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${idx * 120}ms` }}>
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${sol.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sol.grad} flex items-center justify-center mb-5 shadow-lg`}><sol.icon className="w-6 h-6 text-white" /></div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">{sol.industry}</div>
                <h3 className="text-lg font-extrabold text-white mb-3 group-hover:text-indigo-300 transition-colors">{sol.headline}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-5">{sol.description}</p>
                <ul className="space-y-2 mb-6">
                  {sol.useCases.map((uc, i) => (<li key={i} className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />{uc}</li>))}
                </ul>
                <Link to="/register"><button className="w-full py-2.5 text-xs font-semibold border border-white/10 text-slate-300 rounded-xl hover:border-indigo-500/50 hover:text-white transition-all">Get Started Free</button></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-slate-900/40 border-b border-white/5 relative overflow-hidden">
        <Orb className="w-[500px] h-[500px] bg-violet-600/8 blur-[120px] bottom-0 right-0" />
        <div ref={priceS.ref} className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
          <div className={`transition-all duration-700 ${priceS.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Transparent B2B Tiering</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight text-white">Invest in Growth, Not Tool Sprawl</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 max-w-5xl mx-auto text-left">
            {[
              { name: "Starter Workspace", price: "$49", desc: "For early startups seeking clean operational alignment.", features: ["Up to 5 Team Members", "Full CRM & Projects", "Document RAG (100 files)", "500 AI Copilot queries/mo", "Deterministic Financial Metrics"], button: "Start Free Trial", popular: false },
              { name: "Growth Scale", price: "$149", desc: "For high-growth businesses requiring automated risk engines.", features: ["Up to 25 Team Members", "Cross-Module Risk Engine", "AI Project Planner & Meetings", "30/60/90-Day Forecasting", "Unlimited RAG & Automations", "Priority AI Latency"], button: "Deploy Growth Workspace", popular: true },
              { name: "Enterprise", price: "$499", desc: "For mature businesses with custom compliance mandates.", features: ["Unlimited Seats", "Custom LLM Provider Keys", "Dedicated MongoDB Atlas Tier", "Full Audit Trail Retention", "Custom SLA & Support"], button: "Contact Sales", popular: false },
            ].map((tier, idx) => (
              <div key={idx} className={`relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 ${tier.popular ? "border-indigo-500/50 bg-slate-900 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/20" : "border-white/8 bg-slate-900/60 hover:border-white/15"} ${priceS.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${idx * 100}ms` }}>
                {tier.popular && (<><div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-2xl" /><span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg">Most Popular</span></>)}
                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{tier.desc}</p>
                <div className="mt-5 mb-6"><span className="text-4xl font-extrabold text-white">{tier.price}</span><span className="text-xs text-slate-500"> / month</span></div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  {tier.features.map((f, fIdx) => (<li key={fIdx} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />{f}</li>))}
                </ul>
                <Link to="/register"><button className={`w-full py-3 text-sm font-bold rounded-xl transition-all duration-200 ${tier.popular ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25" : "border border-white/10 text-slate-300 hover:border-white/25 hover:text-white"}`}>{tier.button}</button></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-950 border-b border-white/5">
        <div ref={faqS.ref} className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className={`text-center mb-14 transition-all duration-700 ${faqS.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Got Questions?</span>
            <h2 className="text-3xl font-extrabold mt-2 tracking-tight text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden hover:border-white/15 transition-all duration-200 ${faqS.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: `${idx * 80}ms` }}>
                <button onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-semibold text-slate-200 hover:text-white transition-colors">
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 flex-shrink-0 ml-4 transition-transform duration-200 ${activeFaq === idx ? "rotate-180 text-indigo-400" : ""}`} />
                </button>
                {activeFaq === idx && (<div className="px-6 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5 animate-fade-in">{faq.a}</div>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="relative py-28 overflow-hidden bg-slate-950">
        <Orb className="w-[600px] h-[600px] bg-indigo-600/15 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <Orb className="w-[300px] h-[300px] bg-violet-600/15 blur-[80px] top-0 right-0" />
        <Orb className="w-[300px] h-[300px] bg-blue-600/10 blur-[80px] bottom-0 left-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-8">
            <Sparkles className="w-3.5 h-3.5 animate-float" /> Start in under 2 minutes
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ready to Upgrade to{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">
              Autonomous Operations?
            </span>
          </h2>
          <p className="mt-5 text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">Join forward-thinking founders and operations executives using VentureOS to eliminate data silos and accelerate business velocity.</p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <button className="group relative flex items-center gap-2.5 px-8 py-4 text-sm font-bold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/30">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:from-indigo-500 group-hover:to-violet-500 transition-all" />
                <Zap className="relative w-4 h-4" />
                <span className="relative">Create Free Workspace</span>
                <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/login">
              <button className="flex items-center gap-2 px-8 py-4 text-sm font-semibold text-slate-300 border border-white/15 rounded-2xl hover:bg-white/5 hover:border-white/25 hover:text-white hover:-translate-y-0.5 transition-all duration-200">Sign In to Existing Account</button>
            </Link>
          </div>
        </div>
      </section>

    </main>
    <PublicFooter />
  </div>
  );
};
