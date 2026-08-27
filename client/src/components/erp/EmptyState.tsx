import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  icon?: React.ElementType | React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  action,
  icon: IconProp,
  className = '',
}) => {
  const renderIcon = () => {
    if (!IconProp) return <FolderOpen className="w-8 h-8" />;
    if (typeof IconProp === 'function' || (typeof IconProp === 'object' && IconProp !== null && '$$typeof' in IconProp && typeof (IconProp as any).type === 'function')) {
      const Comp = IconProp as React.ElementType;
      return <Comp className="w-8 h-8" />;
    }
    return IconProp;
  };

  return (
    <div className={`p-8 sm:p-12 text-center rounded-2xl bg-white border border-slate-200 ${className}`}>
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-6">{description}</p>
      {action ? (
        action
      ) : actionText && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-[#0B1E36] hover:bg-[#0F2C59] text-white text-xs font-bold rounded-lg transition-colors"
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
};
