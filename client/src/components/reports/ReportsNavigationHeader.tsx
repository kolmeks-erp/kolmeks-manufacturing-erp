import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  ShoppingCart,
  Truck,
  Boxes,
  Factory,
  ShieldCheck,
  Wrench,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  GitMerge,
  ShieldAlert,
  Bookmark
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../constants/navigation';

export const ReportsNavigationHeader: React.FC = () => {
  const tabs = [
    { name: 'Executive Overview', path: `${ERP_BASE_PATH}/reports/dashboard`, icon: BarChart3 },
    { name: 'Sales', path: `${ERP_BASE_PATH}/reports/sales`, icon: ShoppingCart },
    { name: 'Procurement', path: `${ERP_BASE_PATH}/reports/procurement`, icon: Truck },
    { name: 'Inventory', path: `${ERP_BASE_PATH}/reports/inventory`, icon: Boxes },
    { name: 'Production', path: `${ERP_BASE_PATH}/reports/production`, icon: Factory },
    { name: 'Quality', path: `${ERP_BASE_PATH}/reports/quality`, icon: ShieldCheck },
    { name: 'Maintenance', path: `${ERP_BASE_PATH}/reports/maintenance`, icon: Wrench },
    { name: 'HR', path: `${ERP_BASE_PATH}/reports/hr`, icon: Users },
    { name: 'Finance', path: `${ERP_BASE_PATH}/reports/finance`, icon: DollarSign },
    { name: 'CRM', path: `${ERP_BASE_PATH}/reports/crm`, icon: TrendingUp },
    { name: 'Documents', path: `${ERP_BASE_PATH}/reports/documents`, icon: FileText },
    { name: 'Workflows', path: `${ERP_BASE_PATH}/reports/workflows`, icon: GitMerge },
    { name: 'Audit', path: `${ERP_BASE_PATH}/reports/audit`, icon: ShieldAlert },
    { name: 'Saved & Custom', path: `${ERP_BASE_PATH}/reports/custom`, icon: Bookmark }
  ];

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-2 shadow-lg mb-6 overflow-x-auto scrollbar-none">
      <nav className="flex space-x-1 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
