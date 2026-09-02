import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Users,
  ShoppingCart,
  Receipt,
  Factory,
  ShieldCheck,
  Wrench,
  Settings,
  Globe
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { useAuth } from '../../../context/AuthContext';

export const QuickActions: React.FC = () => {
  const { role } = useAuth();
  const currentRole = role || 'staff';

  const allActions = [
    {
      title: 'Submit Public RFQ',
      description: 'Test public quote request flow',
      path: '/request-quote',
      external: true,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100/80 dark:hover:bg-blue-500/20 border-blue-200/80 dark:border-blue-500/30',
      roles: ['admin', 'master_admin', 'executive', 'sales_manager', 'crm_manager', 'staff']
    },
    {
      title: 'RFQ Management Hub',
      description: 'Review pending customer requests',
      path: `${ERP_BASE_PATH}/rfqs`,
      external: false,
      icon: PlusCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/20 border-emerald-200/80 dark:border-emerald-500/30',
      roles: ['admin', 'master_admin', 'executive', 'sales_manager', 'crm_manager']
    },
    {
      title: 'New Quotation',
      description: 'Create commercial price proposal',
      path: `${ERP_BASE_PATH}/quotations`,
      external: false,
      icon: FileText,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/20 border-indigo-200/80 dark:border-indigo-500/30',
      roles: ['admin', 'master_admin', 'executive', 'sales_manager', 'sales_executive']
    },
    {
      title: 'Customers Directory',
      description: 'Manage accounts & client profiles',
      path: `${ERP_BASE_PATH}/customers`,
      external: false,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100/80 dark:hover:bg-purple-500/20 border-purple-200/80 dark:border-purple-500/30',
      roles: ['admin', 'master_admin', 'executive', 'sales_manager', 'crm_manager']
    },
    {
      title: 'New Purchase Order',
      description: 'Issue procurement purchase order',
      path: `${ERP_BASE_PATH}/procurement/orders`,
      external: false,
      icon: Receipt,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100/80 dark:hover:bg-amber-500/20 border-amber-200/80 dark:border-amber-500/30',
      roles: ['admin', 'master_admin', 'executive', 'procurement_manager', 'purchase_manager']
    },
    {
      title: 'Production Orders',
      description: 'Master shopfloor manufacturing',
      path: `${ERP_BASE_PATH}/production/orders`,
      external: false,
      icon: Factory,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100/80 dark:hover:bg-cyan-500/20 border-cyan-200/80 dark:border-cyan-500/30',
      roles: ['admin', 'master_admin', 'executive', 'production_manager']
    },
    {
      title: 'Quality Control',
      description: 'Inspections & non-conformance',
      path: `${ERP_BASE_PATH}/quality/inspections`,
      external: false,
      icon: ShieldCheck,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100/80 dark:hover:bg-rose-500/20 border-rose-200/80 dark:border-rose-500/30',
      roles: ['admin', 'master_admin', 'executive', 'quality_manager']
    },
    {
      title: 'Plant Maintenance',
      description: 'Equipment work orders & PM',
      path: `${ERP_BASE_PATH}/maintenance/work-orders`,
      external: false,
      icon: Wrench,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100/80 dark:hover:bg-orange-500/20 border-orange-200/80 dark:border-orange-500/30',
      roles: ['admin', 'master_admin', 'executive', 'maintenance_manager']
    }
  ];

  // Filter actions user is authorized to see
  const authorizedActions = allActions.filter(
    (action) => action.roles.includes(currentRole) || currentRole === 'admin' || currentRole === 'master_admin'
  );

  return (
    <div className="bg-white dark:bg-[#0F2647] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Operational Action Shortcuts</h3>
        <span className="text-xs font-mono text-slate-400 dark:text-slate-400 uppercase">Role-Aware Palette</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {authorizedActions.map((action, idx) => {
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
    </div>
  );
};
