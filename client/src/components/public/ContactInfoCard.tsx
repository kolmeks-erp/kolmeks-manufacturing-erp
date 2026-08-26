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
    <div className={`p-6 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs hover:border-blue-600 transition-colors ${className}`}>
      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-sm font-mono font-semibold text-blue-700">{value}</p>
        {note && <p className="text-[11px] text-slate-400 leading-relaxed">{note}</p>}
      </div>
    </div>
  );
};
