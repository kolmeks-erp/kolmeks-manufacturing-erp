import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Users, ShieldAlert } from 'lucide-react';
import { ERP_BASE_PATH } from '../../constants/navigation';

export const ActivityNavigationHeader: React.FC = () => {
  const tabs = [
    { name: 'My Personal Activity', path: `${ERP_BASE_PATH}/activity/my`, icon: User },
    { name: 'Team & Department Feed', path: `${ERP_BASE_PATH}/activity/team`, icon: Users },
    { name: 'System Security & Audit Stream', path: `${ERP_BASE_PATH}/activity/system`, icon: ShieldAlert }
  ];

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-2 shadow-lg mb-6 overflow-x-auto scrollbar-none">
      <nav className="flex space-x-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
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
