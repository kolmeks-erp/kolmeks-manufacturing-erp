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
  CheckCircle2,
  Activity
} from 'lucide-react';
import { ERP_SIDEBAR_MENU, ERP_BASE_PATH } from '../constants/navigation';

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

export const ERPLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logout handling placeholder
    navigate(`${ERP_BASE_PATH}/login`);
  };

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans text-slate-900">
      {/* ERP Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-industrial-950 text-slate-300 border-r border-slate-800 transition-all duration-300 z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-industrial-950">
          <Link to={`${ERP_BASE_PATH}/dashboard`} className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded bg-industrial-850 flex items-center justify-center text-white shrink-0">
              <Factory className="w-5 h-5 text-industrial-500" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                  KOLMEKS ERP
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">v1.0 Operations</span>
              </div>
            )}
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
          {ERP_SIDEBAR_MENU.map((item) => {
            const Icon = iconMap[item.iconName] || Factory;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-industrial-850 text-white border-l-4 border-industrial-500 shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-industrial-500' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-industrial-700 text-white uppercase">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer System Health Indicator */}
        <div className="p-3 border-t border-slate-800 bg-industrial-950">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
            {!collapsed && <span className="truncate font-mono">System Online (Supabase)</span>}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header / Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          {/* Mobile Sidebar Toggle & Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded text-slate-600 hover:bg-slate-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Quick Search */}
            <div className="relative hidden sm:block w-64 md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search RFQs, Products, Sales Orders..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-industrial-700 transition-all"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* Notification Badge Placeholder */}
            <Link
              to={`${ERP_BASE_PATH}/notifications`}
              className="relative p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="System Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-industrial-700 ring-2 ring-white"></span>
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-industrial-900 text-white flex items-center justify-center font-bold text-xs">
                  OP
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900">Kolmeks Admin</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Operations Officer</div>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-industrial-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">Kolmeks Operations</p>
                    <p className="text-[10px] text-slate-500 truncate">ops@kolmeks.com</p>
                  </div>
                  <Link
                    to={`${ERP_BASE_PATH}/settings`}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-3.5 h-3.5" /> System Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium"
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
            <div className="fixed inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
            <div className="relative w-64 bg-industrial-950 text-slate-300 flex flex-col h-full z-50">
              <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
                <span className="font-bold text-white text-sm">KOLMEKS ERP</span>
                <button onClick={() => setMobileOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {ERP_SIDEBAR_MENU.map((item) => {
                  const Icon = iconMap[item.iconName] || Factory;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded text-xs text-slate-300 hover:bg-slate-800"
                    >
                      <Icon className="w-4 h-4 text-industrial-500" />
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
