import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { VentureLogo } from '../../components/brand/VentureLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = searchParams.get('verify');
    const paramEmail = searchParams.get('email');

    if (paramEmail) {
      setEmail(paramEmail);
    }

    if (verifyToken) {
      AuthService.verifyEmail(verifyToken)
        .then((res) => {
          if (res.data.success) {
            setSuccessMessage('Email verified successfully! You may now sign in.');
          }
        })
        .catch(() => {
          setError('Email verification link is invalid or has expired.');
        });
    }
  }, [searchParams]);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to ventureos.io</span>
          </Link>
        </div>

        {/* Clickable Brand Logo */}
        <div className="flex justify-center mb-6">
          <VentureLogo to="/" theme="dark" size="lg" />
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight">
          Sign in to your workspace
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          Enter your authorized credentials to access your business operations platform.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/60 border border-slate-800 py-8 px-6 shadow-xl rounded-xl sm:px-8">
          {successMessage && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="alex@ventureos.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 text-white placeholder:text-slate-600 text-sm pl-10 pr-3.5 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 text-white placeholder:text-slate-600 text-sm pl-10 pr-3.5 py-2.5 focus:border-blue-500 focus:ring-1 focus:blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="ai"
                className="w-full justify-center py-2.5 text-sm font-semibold"
                loading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Workspace
              </Button>
            </div>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Seed Accounts
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('alex@ventureos.io')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/60 border border-slate-800 hover:border-blue-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    AM
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                      Alex Morgan
                    </div>
                    <div className="text-[10px] text-slate-400">Owner & CEO • NovaPulse Analytics</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-blue-400 transition-colors">
                  Auto-fill →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('sarah@ventureos.io')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/60 border border-slate-800 hover:border-blue-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                    SC
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                      Sarah Chen
                    </div>
                    <div className="text-[10px] text-slate-400">Product Lead • NovaPulse Analytics</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-blue-400 transition-colors">
                  Auto-fill →
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Need a new workspace?{' '}
            <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300">
              Create a free workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
