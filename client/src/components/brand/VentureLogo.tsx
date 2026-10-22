import React from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export interface VentureLogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'monogram' | 'wordmark';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  showSubtitle?: boolean;
}

export const VentureLogo: React.FC<VentureLogoProps> = ({
  to,
  size = 'md',
  variant = 'full',
  theme = 'auto',
  className,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-extrabold',
    lg: 'text-2xl font-extrabold',
    xl: 'text-3xl font-black',
  };

  const content = (
    <div className={clsx('flex items-center gap-3 select-none transition-transform duration-150 active:scale-[0.98]', className)}>
      {/* Icon Emblem (The Nexus V) */}
      {(variant === 'full' || variant === 'monogram') && (
        <div className={clsx('relative flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-sm', iconSizes[size])}>
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="v-blade-left" x1="6" y1="8" x2="32" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="70%" stopColor="#1D4ED8" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
              <linearGradient id="v-blade-right" x1="24" y1="8" x2="44" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
            {/* Dark Obsidian Base */}
            <rect width="48" height="48" rx="12" fill="#090D16" />
            <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" stroke="#1E293B" strokeWidth="1" />
            {/* Structural Geometry */}
            <path d="M12 14L22 36L26 36L18 14H12Z" fill="url(#v-blade-left)" />
            <path d="M36 14L24 36L27.5 36L38 14H36Z" fill="url(#v-blade-right)" />
            {/* Core Data Node */}
            <circle cx="24" cy="22" r="3.2" fill="#FFFFFF" />
            <circle cx="24" cy="22" r="1.5" fill="#2563EB" />
          </svg>
        </div>
      )}

      {/* Typography Wordmark */}
      {(variant === 'full' || variant === 'wordmark') && (
        <div className="flex items-center leading-none">
          <div className={clsx('tracking-tight flex items-center', textSizes[size])}>
            <span className={theme === 'dark' ? 'text-white' : theme === 'light' ? 'text-slate-900' : 'text-slate-900 dark:text-white'}>
              Venture
            </span>
            <span className="text-blue-500 dark:text-blue-400 ml-0.5">
              OS
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        aria-label="VentureOS Home"
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg group"
      >
        {content}
      </Link>
    );
  }

  return content;
};
