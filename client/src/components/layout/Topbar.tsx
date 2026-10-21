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
  Sparkles,
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
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Hamburger + Workspace Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace Switcher */}
        <div className="relative">
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="max-w-[140px] sm:max-w-[180px] truncate">
              {activeWorkspace?.name || 'Select Workspace'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-2 text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-100">
                Switch Workspace
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                {workspaces.map((ws: Workspace) => (
                  <button
                    key={ws.id || ws._id}
                    onClick={() => {
                      switchWorkspace(ws);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      (ws.id || ws._id) === (activeWorkspace?.id || activeWorkspace?._id)
                        ? 'font-bold text-indigo-600 bg-indigo-50/50'
                        : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal capitalize">
                      {ws.role || 'Member'}
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-1">
                <a
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Workspace Settings & Profile
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: AI Copilot trigger, Notification bell, User profile */}
      <div className="flex items-center gap-3">
        {/* Launch Copilot Button */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-xs font-semibold shadow-ai-glow transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.read ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div className="font-semibold text-slate-900 mb-0.5">{n.title}</div>
                      <div className="text-slate-600 text-[11px] line-clamp-2">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                {user?.name?.[0] || 'U'}
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-900 truncate max-w-[100px]">
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">
                {activeWorkspace?.currentUserRole || 'Member'}
              </div>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-semibold text-slate-900">{user?.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
              </div>
              <a
                href="/settings"
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" /> Profile & Settings
              </a>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-slate-100"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
