import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  centered = false,
  className,
}) => {
  return (
    <div className={twMerge(clsx('space-y-2 mb-8', centered && 'text-center mx-auto max-w-3xl', className))}>
      {eyebrow && (
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-industrial-700 bg-industrial-50 border border-industrial-200 px-3 py-1 rounded-full">
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-base text-slate-600 font-normal leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
