import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  aiVariant?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, aiVariant = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-xl border transition-all duration-200',
          aiVariant
            ? 'border-indigo-200 bg-gradient-to-b from-white to-indigo-50/20 shadow-ai-glow'
            : 'border-slate-200/80 shadow-card hover:border-slate-300',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge('px-6 py-5 border-b border-slate-100 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
  <h3 className={twMerge('text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => (
  <p className={twMerge('text-xs text-slate-500 mt-0.5', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge('p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge('px-6 py-4 bg-slate-50/50 border-t border-slate-100 rounded-b-xl flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);
