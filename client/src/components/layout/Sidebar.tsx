import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  FileText,
  Video,
  Megaphone,
  Crosshair,
  DollarSign,
  Activity,
  MessageSquareQuote,
  Zap,
  Shield,
  Bot,
  Settings,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

export interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeWorkspace } = useAuth();

  const navGroups = [
    {
      group: 'Core Intelligence',
      items: [
        { name: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Business Health', path: '/health', icon: Activity },
        { name: 'Risk Detection', path: '/risk', icon: Shield },
      ],
    },
    {
      group: 'Revenue & Operations',
      items: [
        { name: 'CRM & Leads', path: '/crm', icon: Users },
        { name: 'Customers', path: '/customers', icon: Building2 },
        { name: 'Projects & Tasks', path: '/projects', icon: FolderKanban },
        { name: 'Finance & Forecast', path: '/finance', icon: DollarSign },
      ],
    },
    {
      group: 'AI Growth & Knowledge',
      items: [
        { name: 'Document RAG', path: '/documents', icon: FileText },
        { name: 'Meeting Intelligence', path: '/meetings', icon: Video },
        { name: 'Marketing Studio', path: '/marketing', icon: Megaphone },
        { name: 'Competitors & Research', path: '/competitors', icon: Crosshair },
        { name: 'Customer Feedback', path: '/feedback', icon: MessageSquareQuote },
      ],
    },
    {
      group: 'System & Control',
      items: [
        { name: 'Automations', path: '/automations', icon: Zap },
        { name: 'Admin & Audit', path: '/admin', icon: Shield },
        { name: 'Workspace Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 bottom-0 z-40 w-64 bg-brand-900 text-slate-300 flex flex-col border-r border-brand-800 transition-transform duration-200 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-brand-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-base shadow-sm">
              V
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-none">
                Venture<span className="text-indigo-400">OS</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 block mt-0.5">
                Intelligent BI
              </span>
            </div>
          </div>
        </div>

        {/* Current Workspace Pill */}
        {activeWorkspace && (
          <div className="px-4 py-3 border-b border-brand-800/60 bg-brand-950/40">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Active Workspace
            </div>
            <div className="text-xs font-semibold text-white truncate mt-0.5">
              {activeWorkspace.name}
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.group}>
              <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors group',
                        isActive
                          ? 'bg-indigo-600/90 text-white font-semibold shadow-sm'
                          : 'text-slate-300 hover:bg-brand-800 hover:text-white'
                      )
                    }
                  >
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* AI Copilot Quick CTA in sidebar footer */}
        <div className="p-3 border-t border-brand-800/80 bg-brand-950/30">
          <div className="p-3 bg-gradient-to-br from-brand-800 to-indigo-950/80 rounded-xl border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-white">AI Copilot</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Ask questions grounded in live CRM, projects, and finance.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
