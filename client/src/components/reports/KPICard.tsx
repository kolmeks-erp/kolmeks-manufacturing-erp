import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'cyan';
  drillDownUrl?: string;
  trend?: {
    value: number;
    isPositiveGood?: boolean;
  };
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  drillDownUrl,
  trend
}) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    rose: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20'
  };

  const cardContent = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition group relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(trend || drillDownUrl) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          {trend ? (
            <div
              className={`flex items-center space-x-1 font-semibold ${
                trend.value >= 0
                  ? trend.isPositiveGood !== false
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                  : trend.isPositiveGood !== false
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {trend.value >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{Math.abs(trend.value)}% vs prev. period</span>
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">Live Metric</span>
          )}

          {drillDownUrl && (
            <div className="text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center space-x-1 font-medium transition">
              <span>View Detail</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (drillDownUrl) {
    return <Link to={drillDownUrl}>{cardContent}</Link>;
  }

  return cardContent;
};
