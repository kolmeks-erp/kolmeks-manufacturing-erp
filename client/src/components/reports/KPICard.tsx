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
    value: number; // percentage change e.g. 12.5 or -5.2
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
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  };

  const cardContent = (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-lg hover:border-slate-600 transition group relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-white mt-1.5">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(trend || drillDownUrl) && (
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
          {trend ? (
            <div
              className={`flex items-center space-x-1 font-semibold ${
                trend.value >= 0
                  ? trend.isPositiveGood !== false
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                  : trend.isPositiveGood !== false
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              {trend.value >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{Math.abs(trend.value)}% vs prev. period</span>
            </div>
          ) : (
            <span className="text-slate-500">Live Metric</span>
          )}

          {drillDownUrl && (
            <div className="text-slate-400 group-hover:text-blue-400 flex items-center space-x-1 font-medium transition">
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
