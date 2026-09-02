import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  UserCheck,
  Smartphone,
  Activity,
  Lock,
  FileCheck2,
  FileText
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../constants/navigation';

export const SecurityNavigationHeader: React.FC = () => {
  const tabs = [
    { name: 'Security Overview', path: `${ERP_BASE_PATH}/security/overview`, icon: ShieldAlert },
    { name: 'Access & User Control', path: `${ERP_BASE_PATH}/security/access`, icon: UserCheck },
    { name: 'Active Sessions', path: `${ERP_BASE_PATH}/security/sessions`, icon: Smartphone },
    { name: 'Security Events Stream', path: `${ERP_BASE_PATH}/security/events`, icon: Activity },
    { name: 'Security Policies', path: `${ERP_BASE_PATH}/security/policies`, icon: Lock },
    { name: 'Audit Trail', path: `${ERP_BASE_PATH}/security/audit`, icon: FileCheck2 },
    { name: 'Security & Compliance Reports', path: `${ERP_BASE_PATH}/security/reports`, icon: FileText }
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
                `px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md'
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
