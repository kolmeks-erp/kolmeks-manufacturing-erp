import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Globe,
  Settings,
  PlusCircle,
  Lock,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const QuickActions: React.FC = () => {
  const activeActions = [
    {
      title: 'Submit New Public RFQ',
      description: 'Test public quote request flow',
      path: '/request-quote',
      external: true,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100/80',
    },
    {
      title: 'RFQ Management Hub',
      description: 'Review pending customer requests',
      path: `${ERP_BASE_PATH}/rfqs`,
      external: false,
      icon: PlusCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100/80',
    },
    {
      title: 'View Public Website',
      description: 'Corporate homepage & catalog',
      path: '/',
      external: true,
      icon: Globe,
      color: 'text-slate-700',
      bgColor: 'bg-slate-100 hover:bg-slate-200/80',
    },
    {
      title: 'ERP System Settings',
      description: 'Roles, users & configuration',
      path: `${ERP_BASE_PATH}/settings`,
      external: false,
      icon: Settings,
      color: 'text-slate-700',
      bgColor: 'bg-slate-100 hover:bg-slate-200/80',
    },
  ];

  const pendingModules = [
    'New Quotation',
    'New Customer',
    'New Purchase Order',
    'New Production Order',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-bold text-[#0B1E36] text-base">Quick Executive Actions</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {activeActions.map((action, idx) => {
          const Icon = action.icon;

          return (
            <Link
              key={idx}
              to={action.path}
              className={`p-4 rounded-xl border border-slate-200/80 ${action.bgColor} transition-all flex items-start gap-3 group`}
            >
              <div className={`p-2 rounded-lg bg-white shadow-xs shrink-0 ${action.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                  {action.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Disabled Pending Modules */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
          Future Modules (Pending Implementation)
        </span>
        <div className="flex flex-wrap gap-2">
          {pendingModules.map((item, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-400 opacity-70 cursor-not-allowed"
              title="Module scheduled for upcoming prompt implementation"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>{item}</span>
              <span className="text-[9px] font-mono bg-slate-200 text-slate-600 px-1 rounded ml-1">Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
