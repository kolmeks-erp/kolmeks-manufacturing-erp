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
    <div className="p-6 bg-white rounded-xl border border-slate-200 text-center space-y-2 shadow-xs">
      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0B1E36]">
        {value}
      </div>
      <div className="text-sm font-bold text-slate-800">{label}</div>
      {subtext && (
        <div className="text-[11px] font-mono text-slate-400">
          {isPlaceholder ? `* ${subtext}` : subtext}
        </div>
      )}
    </div>
  );
};
