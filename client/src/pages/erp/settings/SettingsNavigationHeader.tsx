import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  SlidersHorizontal,
  Building2,
  MapPin,
  GitFork,
  Users,
  ShieldAlert,
  KeyRound,
  Hash,
  Coins,
  Scale,
  Activity,
  Database,
  Lock,
  FileCheck
} from 'lucide-react';

const tabs = [
  { label: 'Overview', path: '/secure-kolmeks-x0y0/settings', icon: LayoutDashboard, exact: true },
  { label: 'General', path: '/secure-kolmeks-x0y0/settings/general', icon: SlidersHorizontal },
  { label: 'Organization', path: '/secure-kolmeks-x0y0/settings/organization', icon: Building2 },
  { label: 'Locations', path: '/secure-kolmeks-x0y0/settings/locations', icon: MapPin },
  { label: 'Departments', path: '/secure-kolmeks-x0y0/settings/departments', icon: GitFork },
  { label: 'Users', path: '/secure-kolmeks-x0y0/settings/users', icon: Users },
  { label: 'Roles', path: '/secure-kolmeks-x0y0/settings/roles', icon: ShieldAlert },
  { label: 'Permissions', path: '/secure-kolmeks-x0y0/settings/permissions', icon: KeyRound },
  { label: 'Numbering', path: '/secure-kolmeks-x0y0/settings/numbering', icon: Hash },
  { label: 'Currencies', path: '/secure-kolmeks-x0y0/settings/currencies', icon: Coins },
  { label: 'Units', path: '/secure-kolmeks-x0y0/settings/units', icon: Scale },
  { label: 'Statuses', path: '/secure-kolmeks-x0y0/settings/statuses', icon: Activity },
  { label: 'Master Data', path: '/secure-kolmeks-x0y0/settings/masters', icon: Database },
  { label: 'Security', path: '/secure-kolmeks-x0y0/settings/security', icon: Lock },
  { label: 'Audit Log', path: '/secure-kolmeks-x0y0/settings/audit', icon: FileCheck }
];

export const SettingsNavigationHeader: React.FC = () => {
  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <nav className="flex space-x-1 min-w-max pb-2" aria-label="Settings Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.exact}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
