import React from 'react';
import { Container } from '../ui/Container';
import { Badge } from '../ui/Badge';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}) => {
  return (
    <div className="bg-[#0B1E36] text-white py-12 lg:py-16 relative overflow-hidden border-b border-slate-800">
      {/* Industrial Grid Background */}
      <div className="absolute inset-0 industrial-grid-dark opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#0F2C59] opacity-40 blur-3xl" />

      <Container className="relative z-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        <div className="max-w-3xl space-y-4">
          {eyebrow && (
            <Badge variant="industrial" className="bg-[#0F2C59] border-slate-700 text-emerald-400 font-mono">
              {eyebrow}
            </Badge>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {title}
          </h1>

          {description && (
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              {description}
            </p>
          )}

          {children && <div className="pt-2">{children}</div>}
        </div>
      </Container>
    </div>
  );
};
