import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { VentureLogo } from '../../components/brand/VentureLogo';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please provide a valid work email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await AuthService.forgotPassword(trimmed);
      if (res.data.success) {
        setSubmitted(true);
      } else {
        setError(res.data.error || 'Failed to process request. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to connect to identity services. Please retry shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background architectural grid */}
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
          Reset your credentials
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          Enter your registered work email to receive a secure, single-use reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/60 border border-slate-800 py-8 px-6 shadow-xl rounded-xl sm:px-8">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-semibold text-white">Reset Link Dispatched</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an account matches <span className="text-slate-200 font-mono font-medium">{email}</span>, you will receive an email shortly with instructions to reset your password.
              </p>
              <div className="pt-4">
                <Link to="/login">
                  <Button variant="outline" className="w-full justify-center text-xs">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Work Email Address
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
                    autoFocus
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
                  Send Reset Link
                </Button>
              </div>

              <div className="pt-4 text-center">
                <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
                  Remembered your password? <span className="text-blue-400 hover:text-blue-300">Sign in</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
