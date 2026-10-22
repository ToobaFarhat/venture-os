import React, { useState } from 'react';
import {
  Menu,
  Bell,
  ChevronDown,
  Building2,
  Plus,
  LogOut,
  User as UserIcon,
  Bot,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Workspace } from '../../types';

export interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenCopilot: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, onOpenCopilot }) => {
  const { user, activeWorkspace, workspaces, switchWorkspace, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Mobile Toggle + Workspace Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
          className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="max-w-[140px] sm:max-w-[180px] truncate">
              {activeWorkspace?.name || 'Select Workspace'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in">
              <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Switch Workspace
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                {workspaces.map((ws: Workspace) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      switchWorkspace(ws);
                      setWorkspaceMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700"
                  >
                    <span className="truncate font-medium">{ws.name}</span>
                    {ws.id === activeWorkspace?.id && (
                      <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: AI Copilot Trigger + Notifications + User Menu */}
      <div className="flex items-center gap-2.5">
        {/* AI Copilot Trigger Button */}
        <button
          onClick={onOpenCopilot}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-all active:scale-[0.98]"
        >
          <Bot className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">AI Copilot</span>
          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Ask
          </span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
            aria-label="View Notifications"
            className="p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          {notificationMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-in fade-in">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-medium text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n: any) => (
                    <div
                      key={n.id || n._id}
                      onClick={() => markAsRead(n.id || n._id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.isRead ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="font-semibold text-slate-800">{n.title}</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-md hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-700 hidden md:inline">
              {user?.name || 'User'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-semibold text-slate-900 truncate">{user?.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
