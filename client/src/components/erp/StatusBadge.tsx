import React from 'react';

export type ERPStatusType =
  | 'NEW'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'DRAFT'
  | 'QUOTED'
  | 'UNDER_REVIEW'
  | string;

interface StatusBadgeProps {
  status: ERPStatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status ? status.toUpperCase().replace(/\s+/g, '_') : 'UNKNOWN';

  let colorClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

  switch (normalized) {
    case 'NEW':
      colorClasses = 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      break;
    case 'PENDING':
    case 'UNDER_REVIEW':
      colorClasses = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      break;
    case 'IN_PROGRESS':
    case 'ACTIVE':
    case 'RUNNING':
      colorClasses = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      break;
    case 'COMPLETED':
    case 'APPROVED':
    case 'WON':
      colorClasses = 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700';
      break;
    case 'CANCELLED':
    case 'REJECTED':
    case 'LOST':
    case 'INACTIVE':
    case 'BREAKDOWN':
      colorClasses = 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      break;
    case 'DRAFT':
    case 'IDLE':
      colorClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      break;
    case 'QUOTED':
      colorClasses = 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800';
      break;
  }

  const displayText = normalized.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wider uppercase border ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {displayText}
    </span>
  );
};

export default StatusBadge;
