import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the Kolmeks backend services.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 p-8 text-center">
      <div className="rounded-full bg-red-100 dark:bg-red-900/40 p-3 text-red-600 dark:text-red-400 mb-3">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">{title}</h4>
      <p className="max-w-md text-xs text-red-700 dark:text-red-300 mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
          Retry Connection
        </Button>
      )}
    </div>
  );
};
