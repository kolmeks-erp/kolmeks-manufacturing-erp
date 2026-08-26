import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Factory,
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  Truck,
  FileText,
  FileSpreadsheet,
  ShoppingCart,
  Receipt,
  Cpu,
  Warehouse,
  ShieldCheck,
  Ruler,
  Wrench,
  Navigation,
  BarChart3,
  UserCheck,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  LogOut,
  User,
  Activity,
} from 'lucide-react';
import { ERP_SIDEBAR_MENU, ERP_BASE_PATH } from '../constants/navigation';
import { useAuth } from '../context/AuthContext';
import { KolmeksLogo } from '../components/ui/KolmeksLogo';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  Truck,
  FileText,
  FileSpreadsheet,
  ShoppingCart,
  Receipt,
  Factory,
  Cpu,
  Warehouse,
  ShieldCheck,
  Ruler,
  Wrench,
  Navigation,
  BarChart3,
  UserCheck,
  Bell,
  Settings,
};

const formatRoleLabel = (roleName?: string | null): string => {
  if (!roleName) return 'Staff User';
  return roleName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ERPLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { profile, role, signOut } = useAuth();

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate(`${ERP_BASE_PATH}/login`, { replace: true });
  };

  // Filter sidebar menu items based on current authenticated user role
  const visibleMenuItems = ERP_SIDEBAR_MENU.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return role ? item.roles.includes(role) : false;
  });

  const formattedRoleName = formatRoleLabel(role);
  const displayName = profile?.full_name || 'Staff User';
  const displayEmail = profile?.email || '';
  const userInitials = displayName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      {/* ERP Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#0B1E36] text-slate-300 border-r border-slate-800 transition-all duration-300 z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-[#0B1E36]">
          <Link to={`${ERP_BASE_PATH}/dashboard`} className="flex items-center gap-3 overflow-hidden">
            <KolmeksLogo variant="dark-bg" size="sm" />
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = iconMap[item.iconName] || Factory;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0F2C59] text-white border-l-4 border-emerald-500 shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-600 text-white uppercase">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer System Health Indicator */}
        <div className="p-3 border-t border-slate-800 bg-[#0B1E36]">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
            {!collapsed && <span className="truncate font-mono">System Online (Supabase Auth)</span>}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header / Navbar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          {/* Mobile Sidebar Toggle & Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Quick Search */}
            <div className="relative hidden sm:block w-64 md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search RFQs, Products, Sales Orders..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* Notification Badge */}
            <Link
              to={`${ERP_BASE_PATH}/notifications`}
              className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="System Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800"></span>
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-[#0F2C59] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {userInitials || <User className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{displayName}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">
                    {formattedRoleName}
                  </div>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-xl py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{displayName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{displayEmail}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 uppercase">
                      {formattedRoleName}
                    </span>
                  </div>
                  <Link
                    to={`${ERP_BASE_PATH}/settings`}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Settings className="w-3.5 h-3.5" /> System Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Menu Overlay */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
            <div className="relative w-64 bg-[#0B1E36] text-slate-300 flex flex-col h-full z-50">
              <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
                <KolmeksLogo variant="dark-bg" size="sm" />
                <button onClick={() => setMobileOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {visibleMenuItems.map((item) => {
                  const Icon = iconMap[item.iconName] || Factory;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded text-xs text-slate-300 hover:bg-slate-800"
                    >
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ERP Main Body Outlet */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
