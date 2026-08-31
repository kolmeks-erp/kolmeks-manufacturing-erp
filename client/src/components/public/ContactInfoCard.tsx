import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ContactInfoCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  note?: string;
  className?: string;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({
  icon: Icon,
  title,
  value,
  note,
  className = '',
}) => {
  return (
    <div className={`p-6 bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-3 shadow-xs hover:border-blue-600 dark:hover:border-blue-500 transition-colors ${className}`}>
      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm font-mono font-semibold text-blue-700 dark:text-blue-400">{value}</p>
        {note && <p className="text-[11px] text-slate-400 dark:text-slate-400 leading-relaxed">{note}</p>}
      </div>
    </div>
  );
};
