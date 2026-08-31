import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  isPlaceholder?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext = 'Verified metric',
  isPlaceholder = true,
}) => {
  return (
    <div className="p-6 bg-white dark:bg-[#0F2647] rounded-xl border border-slate-200 dark:border-slate-800/80 text-center space-y-2 shadow-xs hover:border-blue-600 dark:hover:border-blue-500 transition-colors">
      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0B1E36] dark:text-blue-400">
        {value}
      </div>
      <div className="text-sm font-bold text-slate-800 dark:text-white">{label}</div>
      {subtext && (
        <div className="text-[11px] font-mono text-slate-400 dark:text-slate-400">
          {isPlaceholder ? `* ${subtext}` : subtext}
        </div>
      )}
    </div>
  );
};
