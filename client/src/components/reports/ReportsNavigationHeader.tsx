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
  IndianRupee,
  TrendingUp,
  FileText,
  GitMerge,
  ShieldAlert,
  Bookmark
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';

export const ReportsNavigationHeader: React.FC = () => {
  const { role } = useAuth();
  const currentRole = (role || '').toLowerCase().trim();
  const isMasterAdmin = currentRole === 'admin' || currentRole === 'master_admin' || currentRole === 'system_admin';
  const isHr = currentRole.startsWith('hr') || currentRole.includes('human');
  const isFinance = currentRole.startsWith('finance') || currentRole === 'accountant';

  const allTabs = [
    { name: 'Executive Overview', path: `${ERP_BASE_PATH}/reports/dashboard`, icon: BarChart3, roles: ['admin', 'executive'] },
    { name: 'Sales', path: `${ERP_BASE_PATH}/reports/sales`, icon: ShoppingCart, roles: ['admin', 'sales_manager', 'executive'] },
    { name: 'Procurement', path: `${ERP_BASE_PATH}/reports/procurement`, icon: Truck, roles: ['admin', 'purchase_manager', 'executive'] },
    { name: 'Inventory', path: `${ERP_BASE_PATH}/reports/inventory`, icon: Boxes, roles: ['admin', 'warehouse_manager', 'inventory_manager', 'executive'] },
    { name: 'Production', path: `${ERP_BASE_PATH}/reports/production`, icon: Factory, roles: ['admin', 'production_manager', 'executive'] },
    { name: 'Quality', path: `${ERP_BASE_PATH}/reports/quality`, icon: ShieldCheck, roles: ['admin', 'quality_manager', 'executive'] },
    { name: 'Maintenance', path: `${ERP_BASE_PATH}/reports/maintenance`, icon: Wrench, roles: ['admin', 'maintenance_manager', 'executive'] },
    { name: 'HR', path: `${ERP_BASE_PATH}/reports/hr`, icon: Users, roles: ['admin', 'hr', 'executive'] },
    { name: 'Finance', path: `${ERP_BASE_PATH}/reports/finance`, icon: IndianRupee, roles: ['admin', 'finance', 'executive'] },
    { name: 'CRM', path: `${ERP_BASE_PATH}/reports/crm`, icon: TrendingUp, roles: ['admin', 'sales_manager', 'executive'] },
    { name: 'Documents', path: `${ERP_BASE_PATH}/reports/documents`, icon: FileText, roles: ['admin', 'quality_manager', 'hr', 'executive'] },
    { name: 'Workflows', path: `${ERP_BASE_PATH}/reports/workflows`, icon: GitMerge, roles: ['admin', 'hr', 'finance', 'executive'] },
    { name: 'Audit', path: `${ERP_BASE_PATH}/reports/audit`, icon: ShieldAlert, roles: ['admin', 'hr', 'security_officer', 'executive'] },
    { name: 'Saved & Custom', path: `${ERP_BASE_PATH}/reports/custom`, icon: Bookmark, roles: ['admin', 'hr', 'finance', 'executive'] }
  ];

  const visibleTabs = allTabs.filter((tab) => {
    if (isMasterAdmin) return true;
    if (isHr) return tab.roles.includes('hr');
    if (isFinance) return tab.roles.includes('finance');
    return tab.roles.some((r) => r === currentRole);
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-sm mb-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <nav className="flex space-x-1.5 min-w-max">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
