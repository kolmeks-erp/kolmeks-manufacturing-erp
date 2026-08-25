import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading manufacturing telemetry...',
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className={`animate-spin text-industrial-850 ${iconSizes[size]} mb-3`} />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};
