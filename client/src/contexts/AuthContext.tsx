import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Workspace } from '../types';
import { AuthService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  login: (token: string, user: User, workspaces: Workspace[], activeWorkspace?: Workspace) => void;
  logout: () => void;
  switchWorkspace: (workspace: Workspace) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ventureos_token'));
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await AuthService.getMe();
      if (res.data.success) {
        setUser(res.data.data.user);
        setWorkspaces(res.data.data.workspaces || []);

        const savedWsId = localStorage.getItem('ventureos_workspace_id');
        const found = (res.data.data.workspaces || []).find((w: Workspace) => (w.id || w._id) === savedWsId);
        const active = found || res.data.data.activeWorkspace || res.data.data.workspaces[0] || null;

        setActiveWorkspace(active);
        if (active) {
          const activeId = active.id || active._id;
          if (activeId) {
            localStorage.setItem('ventureos_workspace_id', activeId);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = (newToken: string, newUser: User, newWorkspaces: Workspace[], initialActive?: Workspace) => {
    localStorage.setItem('ventureos_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setWorkspaces(newWorkspaces);

    const active = initialActive || newWorkspaces[0] || null;
    setActiveWorkspace(active);
    if (active) {
      const activeId = active.id || active._id;
      if (activeId) {
        localStorage.setItem('ventureos_workspace_id', activeId);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('ventureos_token');
    localStorage.removeItem('ventureos_workspace_id');
    setToken(null);
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspace(null);
  };

  const switchWorkspace = (ws: Workspace) => {
    setActiveWorkspace(ws);
    const wsId = ws.id || ws._id;
    if (wsId) {
      localStorage.setItem('ventureos_workspace_id', wsId);
    }
    window.location.reload(); // Refresh application context
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        workspaces,
        activeWorkspace,
        loading,
        login,
        logout,
        switchWorkspace,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
