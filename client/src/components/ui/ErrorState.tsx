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
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50/50 p-8 text-center">
      <div className="rounded-full bg-red-100 p-3 text-red-600 mb-3">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-semibold text-red-900 mb-1">{title}</h4>
      <p className="max-w-md text-xs text-red-700 mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
          Retry Connection
        </Button>
      )}
    </div>
  );
};
