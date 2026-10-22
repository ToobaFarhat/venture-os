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
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { VentureLogo } from '../brand/VentureLogo';

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
        { name: 'Risk Center', path: '/risk', icon: Shield },
      ],
    },
    {
      group: 'Revenue & Operations',
      items: [
        { name: 'CRM & Leads', path: '/crm', icon: Users },
        { name: 'Customers 360', path: '/customers', icon: Building2 },
        { name: 'Projects & Tasks', path: '/projects', icon: FolderKanban },
        { name: 'Finance & Forecast', path: '/finance', icon: DollarSign },
      ],
    },
    {
      group: 'Knowledge & Strategy',
      items: [
        { name: 'Document RAG', path: '/documents', icon: FileText },
        { name: 'Meeting Intelligence', path: '/meetings', icon: Video },
        { name: 'Marketing Studio', path: '/marketing', icon: Megaphone },
        { name: 'Competitors & SWOT', path: '/competitors', icon: Crosshair },
        { name: 'Customer Feedback', path: '/feedback', icon: MessageSquareQuote },
      ],
    },
    {
      group: 'Governance & Setup',
      items: [
        { name: 'Automations Engine', path: '/automations', icon: Zap },
        { name: 'Admin & Audit Logs', path: '/admin', icon: Shield },
        { name: 'Workspace Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          <VentureLogo to="/dashboard" theme="dark" size="md" />
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Workspace Card */}
        {activeWorkspace && (
          <div className="p-3 border-b border-slate-900 bg-slate-900/40">
            <div className="px-2 py-1.5 rounded-lg border border-slate-800/80 bg-slate-950 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Active Tenant
                </div>
                <div className="text-xs font-semibold text-white truncate">
                  {activeWorkspace.name}
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.group}>
              <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
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
                        'flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors group',
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                      )
                    }
                  >
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bounded AI Status Card in Footer */}
        <div className="p-3 border-t border-slate-900 bg-slate-950">
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex items-start gap-2.5">
            <Bot className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-white">AI Copilot Guard</div>
              <p className="text-[10.5px] text-slate-400 leading-tight mt-0.5">
                Tool calls bounded to active workspace with human approval.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
