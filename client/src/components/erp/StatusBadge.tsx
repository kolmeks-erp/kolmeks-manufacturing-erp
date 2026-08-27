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

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';

  switch (normalized) {
    case 'NEW':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'PENDING':
    case 'UNDER_REVIEW':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'IN_PROGRESS':
    case 'ACTIVE':
    case 'RUNNING':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'COMPLETED':
    case 'APPROVED':
    case 'WON':
      colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      break;
    case 'CANCELLED':
    case 'REJECTED':
    case 'LOST':
    case 'INACTIVE':
    case 'BREAKDOWN':
      colorClasses = 'bg-red-50 text-red-700 border-red-200';
      break;
    case 'DRAFT':
    case 'IDLE':
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-300';
      break;
    case 'QUOTED':
      colorClasses = 'bg-violet-50 text-violet-700 border-violet-200';
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
