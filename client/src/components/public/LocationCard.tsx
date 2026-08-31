import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';

interface LocationCardProps {
  region: string;
  capability: string;
  status: string;
  isPlaceholder?: boolean;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  region,
  capability,
  status,
  isPlaceholder = true,
}) => {
  return (
    <Card variant="industrial" className="hover:border-blue-600 dark:hover:border-blue-500 transition-colors h-full flex flex-col justify-between">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg bg-[#0F2C59] dark:bg-blue-600 text-white flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          {isPlaceholder && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              LOCATION DATA TO BE VERIFIED
            </span>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{region}</h3>
          <div className="text-xs font-mono text-blue-700 dark:text-blue-400 font-semibold mt-0.5">
            {status}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {capability}
        </p>

        <div className="pt-2">
          <Link
            to="/locations"
            className="inline-flex items-center text-xs font-bold text-slate-800 dark:text-blue-400 hover:text-blue-700 dark:hover:text-white gap-1"
          >
            Explore Location Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
