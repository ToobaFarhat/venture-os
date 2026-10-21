import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface AIInsightCardProps {
  title: string;
  impact?: string;
  recommendation: string;
  type?: 'opportunity' | 'warning' | 'achievement';
  confidence?: number;
  onAction?: () => void;
  actionLabel?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  impact,
  recommendation,
  type = 'opportunity',
  confidence,
  onAction,
  actionLabel,
}) => {
  const typeIcons = {
    opportunity: <Sparkles className="w-4 h-4 text-indigo-600" />,
    warning: <ShieldAlert className="w-4 h-4 text-amber-600" />,
    achievement: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  };

  const borderStyles = {
    opportunity: 'border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/20 to-white hover:border-indigo-300',
    warning: 'border-amber-200/80 bg-gradient-to-br from-white via-amber-50/20 to-white hover:border-amber-300',
    achievement: 'border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/20 to-white hover:border-emerald-300',
  };

  return (
    <div className={`rounded-xl border p-4.5 shadow-subtle transition-all duration-200 ${borderStyles[type]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-white shadow-sm border border-slate-100">
            {typeIcons[type]}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            AI Operational Insight
          </span>
        </div>
        {confidence !== undefined && (
          <Badge variant="ai" size="sm">
            {Math.round(confidence * 100)}% Conf
          </Badge>
        )}
      </div>

      <h4 className="text-sm font-bold text-slate-900 mb-1">{title}</h4>
      {impact && <p className="text-xs text-slate-600 mb-2 leading-relaxed">{impact}</p>}

      <div className="bg-white/80 rounded-lg p-2.5 border border-slate-200/60 mt-2">
        <p className="text-xs font-medium text-slate-800 flex items-start gap-1.5">
          <span className="font-semibold text-indigo-600">Action:</span>
          {recommendation}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
        >
          {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
