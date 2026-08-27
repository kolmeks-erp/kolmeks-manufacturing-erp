import React from 'react';

interface LoadingStateProps {
  label?: string;
  rows?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading operational telemetry...',
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`p-6 bg-white rounded-2xl border border-slate-200 space-y-4 animate-pulse ${className}`}>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-1/6" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="h-10 bg-slate-100 rounded-lg w-full" />
        ))}
      </div>
      <p className="text-[11px] text-slate-400 font-mono text-center pt-2">{label}</p>
    </div>
  );
};
