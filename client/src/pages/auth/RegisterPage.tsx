import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('SaaS / Software');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await AuthService.register({
        name,
        email,
        password,
        companyName,
        industry,
      });

      if (res.data.success) {
        const { token, user, workspaces, activeWorkspace } = res.data.data;
        login(token, user, workspaces, activeWorkspace);
        navigate('/dashboard');
      } else {
        setError(res.data.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
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
          Create your intelligent workspace
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Get started in seconds with AI-driven operations and CRM
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Elena Rostova"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<UserIcon className="w-4 h-4" />}
              className="bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:ring-indigo-900"
              required
            />

            <Input
              label="Work Email"
              type="email"
              placeholder="elena@solardynamics.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              className="bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:ring-indigo-900"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              className="bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:ring-indigo-900"
              required
              minLength={6}
            />

            <Input
              label="Company / Workspace Name"
              type="text"
              placeholder="SolarDynamics AI"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              icon={<Building2 className="w-4 h-4" />}
              className="bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:ring-indigo-900"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="block w-full rounded-lg border border-slate-700 bg-slate-900/60 text-white text-sm px-3.5 py-2.5 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-900 focus:outline-none"
              >
                <option value="SaaS / Software">SaaS / Software</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                <option value="Consulting & Agency">Consulting & Agency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="ai"
                className="w-full justify-center py-2.5 text-sm"
                loading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Create Workspace & Launch
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
