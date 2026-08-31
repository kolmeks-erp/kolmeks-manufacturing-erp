import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'industrial';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const baseStyles = 'bg-white dark:bg-[#0F2647] rounded-xl transition-all duration-200 text-slate-900 dark:text-slate-100';

  const variants = {
    default: 'border border-slate-200 dark:border-slate-800/80 shadow-xs',
    bordered: 'border border-slate-300 dark:border-slate-700/80',
    elevated: 'border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/40',
    industrial: 'border-l-4 border-l-blue-600 border-y border-r border-slate-200 dark:border-slate-800 shadow-xs',
  };

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge('px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
  <h3 className={twMerge('text-base font-semibold text-slate-900 dark:text-white tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge('p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge('px-6 py-3 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 rounded-b-xl flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);
