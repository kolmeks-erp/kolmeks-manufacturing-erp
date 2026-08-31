import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  icon?: React.ElementType | React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  action,
  icon: IconProp,
  className = '',
}) => {
  const btnText = actionText || actionLabel;
  const renderIcon = () => {
    if (!IconProp) return <FolderOpen className="w-8 h-8" />;
    if (typeof IconProp === 'function' || (typeof IconProp === 'object' && IconProp !== null && '$$typeof' in IconProp && typeof (IconProp as any).type === 'function')) {
      const Comp = IconProp as React.ElementType;
      return <Comp className="w-8 h-8" />;
    }
    return IconProp;
  };

  return (
    <div className={`p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 shadow-xs ${className}`}>
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700/50">
        {renderIcon()}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-6">{description}</p>
      {action ? (
        action
      ) : btnText && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          {btnText}
        </button>
      ) : null}
    </div>
  );
};

export default EmptyState;
