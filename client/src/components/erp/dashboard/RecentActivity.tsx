import React from 'react';
import { Activity, Clock } from 'lucide-react';
import { RFQRecord } from './RecentRFQsTable';

interface RecentActivityProps {
  rfqs: RFQRecord[];
  isLoading?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ rfqs, isLoading }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' on ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-[#0F2647] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Operational Activity Stream</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
        </div>
      ) : rfqs.length === 0 ? (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
          <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p>No recent operational activity recorded.</p>
        </div>
      ) : (
        <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="flex items-start gap-3 pl-6 relative">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 border-2 border-white dark:border-[#0F2647] absolute left-2 top-1.5 shadow-xs" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                  <strong className="text-slate-900 dark:text-white">{rfq.company}</strong> submitted quotation request{' '}
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{rfq.rfq_number || 'RFQ'}</span> for{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{rfq.requirement_type}</span>.
                </p>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 block mt-0.5">
                  {formatDate(rfq.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
