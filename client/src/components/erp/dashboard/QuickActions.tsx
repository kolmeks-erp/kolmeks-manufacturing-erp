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
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100/80 dark:hover:bg-blue-500/20 border-blue-200/80 dark:border-blue-500/30',
    },
    {
      title: 'RFQ Management Hub',
      description: 'Review pending customer requests',
      path: `${ERP_BASE_PATH}/rfqs`,
      external: false,
      icon: PlusCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/20 border-emerald-200/80 dark:border-emerald-500/30',
    },
    {
      title: 'View Public Website',
      description: 'Corporate homepage & catalog',
      path: '/',
      external: true,
      icon: Globe,
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/60',
    },
    {
      title: 'ERP System Settings',
      description: 'Roles, users & configuration',
      path: `${ERP_BASE_PATH}/settings`,
      external: false,
      icon: Settings,
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/60',
    },
  ];

  const pendingModules = [
    'New Quotation',
    'New Customer',
    'New Purchase Order',
    'New Production Order',
  ];

  return (
    <div className="bg-white dark:bg-[#0F2647] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs p-5 space-y-4">
      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Quick Executive Actions</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {activeActions.map((action, idx) => {
          const Icon = action.icon;

          return (
            <Link
              key={idx}
              to={action.path}
              className={`p-4 rounded-xl border ${action.bgColor} transition-all flex items-start gap-3 group`}
            >
              <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 shadow-xs shrink-0 ${action.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                  {action.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Disabled Pending Modules */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 font-bold block mb-2">
          Future Modules (Pending Implementation)
        </span>
        <div className="flex flex-wrap gap-2">
          {pendingModules.map((item, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-400 opacity-70 cursor-not-allowed"
              title="Module scheduled for upcoming prompt implementation"
            >
              <Lock className="w-3 h-3 text-slate-400 dark:text-slate-400" />
              <span>{item}</span>
              <span className="text-[9px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1 rounded ml-1">Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
