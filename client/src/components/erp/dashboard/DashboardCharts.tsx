import React from 'react';
import { BarChart2, Info } from 'lucide-react';

export const DashboardCharts: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-[#0B1E36] text-base">Manufacturing Operational Telemetry & Analytics</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
          Analytics Engine Ready
        </span>
      </div>

      {/* Empty State Chart Area */}
      <div className="h-48 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
          <Info className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-slate-800 mb-1">
          Volume & Analytics Telemetry
        </h4>
        <p className="text-xs text-slate-500 max-w-md leading-relaxed">
          Chart data will populate dynamically as manufacturing quote requests, purchase orders, and production batches accumulate. No fabricated data is displayed.
        </p>
      </div>
    </div>
  );
};
