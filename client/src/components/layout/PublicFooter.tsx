import React from 'react';
import { Link } from 'react-router-dom';
import { VentureLogo } from '../brand/VentureLogo';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <VentureLogo to="/" theme="dark" size="md" />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Autonomous Business Intelligence and Operations SaaS. Unifying CRM, financial runway, sprint execution, and bounded AI decision support.
            </p>
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} VentureOS Platform. Production Cloud Architecture.
            </div>
          </div>

          {/* Module Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Intelligence Modules
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Executive Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">CRM & Lead Pipeline</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">FP&A Cashflow Forecast</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Cross-Module Risk Engine</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Vector Document RAG</Link></li>
            </ul>
          </div>

          {/* Core Capabilities */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              AI Decision Tools
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">AI Business Copilot</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">AI Project Planner Wizard</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Meeting Action Converter</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">AI Lead Scoring Engine</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Action Proposal Cards</Link></li>
            </ul>
          </div>

          {/* Security & Access */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Security & Access
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Workspace Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Deploy New Tenant</Link></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Multi-Tenancy Security</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Audit Logging & RBAC</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>Built with TypeScript, React 18, Express, and MongoDB Atlas.</p>
          <div className="flex items-center gap-6">
            <span>TLS 1.3 Encrypted</span>
            <span>Zero Hallucination Math</span>
            <span>Human-in-the-Loop</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
