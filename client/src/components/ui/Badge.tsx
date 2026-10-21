import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Sparkles } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'ai' | 'purple' | 'indigo' | 'secondary';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'default', size = 'sm', ...props }) => {
  const base = 'inline-flex items-center font-medium rounded-full';

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
  };

  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    ai: 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm font-semibold',
  };

  return (
    <span className={twMerge(clsx(base, sizes[size], variants[variant], className))} {...props}>
      {variant === 'ai' && <Sparkles className="w-3 h-3 text-indigo-600" />}
      {children}
    </span>
  );
};
