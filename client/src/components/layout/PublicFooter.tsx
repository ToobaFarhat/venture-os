import React from "react";
import { Link } from "react-router-dom";

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-base shadow-sm">V</div>
            <span className="text-xl font-bold tracking-tight text-white">Venture<span className="text-indigo-400">OS</span></span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-4">The AI-powered Business Intelligence and Operations Platform for ambitious startups and growing businesses.</p>
          <div className="text-xs text-slate-600">copyright {new Date().getFullYear()} VentureOS Inc. All rights reserved.</div>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Product</h4>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#product" className="hover:text-white transition-colors">Executive Dashboard</a></li>
            <li><a href="#ai" className="hover:text-white transition-colors">AI Business Copilot</a></li>
            <li><a href="#product" className="hover:text-white transition-colors">Document RAG</a></li>
            <li><a href="#product" className="hover:text-white transition-colors">Risk Engine</a></li>
            <li><a href="#product" className="hover:text-white transition-colors">Forecasting</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Solutions</h4>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#solutions" className="hover:text-white transition-colors">SaaS and Software</a></li>
            <li><a href="#solutions" className="hover:text-white transition-colors">E-Commerce and Retail</a></li>
            <li><a href="#solutions" className="hover:text-white transition-colors">Consulting and Agency</a></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Create Workspace</Link></li>
            <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            <li><a href="#faq" className="hover:text-white transition-colors">Security and Privacy</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
