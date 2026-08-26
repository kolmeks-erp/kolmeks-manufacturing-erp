import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-2 text-xs">
      <ol className="flex items-center space-x-2 text-slate-500 flex-wrap">
        <li>
          <Link
            to="/"
            className="flex items-center hover:text-industrial-700 transition-colors"
            title="Return to Home"
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center space-x-2">
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              {isLast || !item.href ? (
                <span className="font-semibold text-slate-800 dark:text-slate-200" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} className="hover:text-industrial-700 transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
