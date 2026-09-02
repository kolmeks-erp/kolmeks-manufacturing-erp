import React from 'react';
import { SettingsNavigationHeader } from './SettingsNavigationHeader';
import { Activity, CheckCircle2, ShieldCheck, RefreshCw, FileText, ShoppingCart, Truck, Wrench, AlertTriangle } from 'lucide-react';

const moduleStatuses = [
  {
    module: 'Sales & Quotations',
    icon: FileText,
    statuses: [
      { name: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      { name: 'Pending Approval', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
      { name: 'Approved', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
      { name: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
      { name: 'Converted to Order', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' }
    ]
  },
  {
    module: 'Procurement & Purchasing',
    icon: ShoppingCart,
    statuses: [
      { name: 'Draft PR', color: 'bg-gray-100 text-gray-800' },
      { name: 'PO Issued', color: 'bg-indigo-100 text-indigo-800' },
      { name: 'GRN Received', color: 'bg-emerald-100 text-emerald-800' },
      { name: 'Closed', color: 'bg-purple-100 text-purple-800' }
    ]
  },
  {
    module: 'Production & Manufacturing',
    icon: RefreshCw,
    statuses: [
      { name: 'Planned', color: 'bg-gray-100 text-gray-800' },
      { name: 'Released', color: 'bg-blue-100 text-blue-800' },
      { name: 'In Progress', color: 'bg-amber-100 text-amber-800' },
      { name: 'Quality Signoff', color: 'bg-indigo-100 text-indigo-800' },
      { name: 'Completed', color: 'bg-emerald-100 text-emerald-800' }
    ]
  },
  {
    module: 'Quality & CAPA',
    icon: AlertTriangle,
    statuses: [
      { name: 'NCR Logged', color: 'bg-red-100 text-red-800' },
      { name: 'Under Investigation', color: 'bg-amber-100 text-amber-800' },
      { name: 'CAPA Implemented', color: 'bg-blue-100 text-blue-800' },
      { name: 'Verified Closed', color: 'bg-emerald-100 text-emerald-800' }
    ]
  }
];

export const StatusSettingsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
          Status Definitions & Transitions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Centralized system-wide lifecycle status registry for Documents, Procurement, Quality, and Operations.
        </p>
      </div>

      <SettingsNavigationHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {moduleStatuses.map((mod) => {
          const Icon = mod.icon;
          return (
            <div key={mod.module} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                <Icon className="w-5 h-5 text-blue-600" />
                {mod.module}
              </h3>

              <div className="flex flex-wrap gap-2 pt-1">
                {mod.statuses.map((st) => (
                  <span key={st.name} className={`px-3 py-1 text-xs font-bold rounded-lg ${st.color}`}>
                    {st.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
