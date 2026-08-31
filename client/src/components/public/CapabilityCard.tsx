import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface CapabilityCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export const CapabilityCard: React.FC<CapabilityCardProps> = ({
  icon: Icon,
  title,
  description,
  href,
  badge,
}) => {
  return (
    <Card
      variant="industrial"
      className="group hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-200 h-full flex flex-col justify-between"
    >
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-[#0F2C59] dark:text-blue-400 flex items-center justify-center group-hover:bg-[#0F2C59] dark:group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
              <Icon className="w-6 h-6" />
            </div>
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                {badge}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            to={href}
            className="inline-flex items-center text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-[#0B1E36] dark:hover:text-white gap-1 group-hover:translate-x-1 transition-transform"
          >
            Learn More <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
