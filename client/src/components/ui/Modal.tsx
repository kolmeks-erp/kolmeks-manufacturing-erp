import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 text-left shadow-2xl transition-all sm:my-8 w-full ${sizeClasses[size]}`}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-[#0B1E36]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <div className="p-6 text-slate-700 dark:text-slate-200">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1E36] px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
