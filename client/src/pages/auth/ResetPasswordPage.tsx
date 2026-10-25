import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { VentureLogo } from '../../components/brand/VentureLogo';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing or invalid reset token. Please request a new link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      const res = await AuthService.resetPassword({ token, password });
      if (res.data.success) {
        setSuccess(true);
      } else {
        setError(res.data.error || 'Failed to reset password. The link may have expired.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Password reset failed. Link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>

        <div className="flex justify-center mb-6">
          <VentureLogo to="/" theme="dark" size="lg" />
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight">
          Create new password
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          Enter your updated credentials to regain authorized workspace access.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/60 border border-slate-800 py-8 px-6 shadow-xl rounded-xl sm:px-8">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-semibold text-white">Password Updated</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your credentials have been securely updated. You can now sign in to your workspace.
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => navigate('/login')}
                  variant="ai"
                  className="w-full justify-center text-xs"
                >
                  Proceed to Sign In
                </Button>
              </div>
            </div>
          ) : !token ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-slate-400">
                No reset token was found in the URL. Please request a new password reset link.
              </p>
              <Link to="/forgot-password">
                <Button variant="outline" className="w-full justify-center text-xs">
                  Request Reset Link
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-slate-950 text-white placeholder:text-slate-600 text-sm pl-10 pr-3.5 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                    required
                    minLength={6}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-slate-950 text-white placeholder:text-slate-600 text-sm pl-10 pr-3.5 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                    required
                    minLength={6}
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
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
