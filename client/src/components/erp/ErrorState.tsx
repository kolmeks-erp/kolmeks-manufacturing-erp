import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Operational Error',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-900 mb-1">{title}</h4>
          <p className="text-xs text-red-700 leading-relaxed mb-4">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Operation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
