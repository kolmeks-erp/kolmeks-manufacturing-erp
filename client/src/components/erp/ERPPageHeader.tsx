import React from 'react';
import { useSystemSettings } from '../../context/SystemSettingsContext';

interface ERPPageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const ERPPageHeader: React.FC<ERPPageHeaderProps> = ({ title, subtitle, description, actions }) => {
  const { theme } = useSystemSettings();
  const isDark = theme === 'dark';
  const subText = subtitle || description;

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800/80">
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h1>
        {subText && <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{subText}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
};

export default ERPPageHeader;
