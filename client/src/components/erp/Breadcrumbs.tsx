import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ERP_BASE_PATH } from '../../constants/navigation';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  // Strip ERP base path and split remaining pathname
  const relativePath = location.pathname.replace(ERP_BASE_PATH, '');
  const pathSegments = relativePath.split('/').filter(Boolean);

  const formatSegment = (segment: string) => {
    return segment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <nav aria-label="ERP Breadcrumb" className="flex items-center space-x-2 text-xs font-medium text-slate-500">
      <Link
        to={`${ERP_BASE_PATH}/dashboard`}
        className="flex items-center gap-1 hover:text-slate-900 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Dashboard</span>
      </Link>

      {pathSegments.map((segment, idx) => {
        if (segment === 'dashboard') return null;

        const isLast = idx === pathSegments.length - 1;
        const targetPath = `${ERP_BASE_PATH}/${pathSegments.slice(0, idx + 1).join('/')}`;

        return (
          <React.Fragment key={segment}>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            {isLast ? (
              <span className="text-slate-800 font-bold">{formatSegment(segment)}</span>
            ) : (
              <Link to={targetPath} className="hover:text-slate-900 transition-colors">
                {formatSegment(segment)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
