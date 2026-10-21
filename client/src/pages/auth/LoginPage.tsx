import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    try {
      const res = await AuthService.login({ email: loginEmail, password: loginPass });
      if (res.data.success) {
        const { token, user, workspaces, activeWorkspace } = res.data.data;
        login(token, user, workspaces, activeWorkspace);
        navigate('/dashboard');
      } else {
        setError(res.data.message || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    handleSubmit(undefined, demoEmail, 'password123');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
            V
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Venture<span className="text-indigo-400">OS</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Sign in to access your intelligent business operations platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="alex@ventureos.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              className="bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:ring-indigo-900"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              className="bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:ring-indigo-900"
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="ai"
                className="w-full justify-center py-2.5 text-sm"
                loading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Workspace
              </Button>
            </div>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-700/60">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Seed Accounts
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('alex@ventureos.io')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-indigo-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    AM
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      Alex Morgan
                    </div>
                    <div className="text-[10px] text-slate-400">Owner & CEO • NovaPulse Analytics</div>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-indigo-400 opacity-60 group-hover:opacity-100" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('sarah@ventureos.io')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-indigo-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs">
                    SC
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors">
                      Sarah Chen
                    </div>
                    <div className="text-[10px] text-slate-400">Product Lead • NovaPulse Analytics</div>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-violet-400 opacity-60 group-hover:opacity-100" />
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have a workspace?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Create a free workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
