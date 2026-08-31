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
  PackageCheck,
  Cpu,
  Warehouse,
  Building2,
  History,
  ShieldCheck,
  Ruler,
  Wrench,
  Navigation,
  BarChart3,
  UserCheck,
  Bell,
  Settings,
  Layers,
  FolderTree,
  GitFork,
  Play,
  ClipboardCheck,
  AlertTriangle,
  Lock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  LogOut,
  User,
  ChevronDown,
  DollarSign,
  BookOpen,
  Calendar,
  Scale,
  TrendingUp,
  PieChart,
  TrendingDown,
  FileCheck,
  ClipboardList,
  Clock,
  Timer,
  CalendarRange,
  Sun,
  Moon,
} from 'lucide-react';
import { ERP_SIDEBAR_MENU, ERP_BASE_PATH } from '../constants/navigation';
import { useAuth } from '../context/AuthContext';
import { useSystemSettings } from '../context/SystemSettingsContext';
import { KolmeksLogo } from '../components/ui/KolmeksLogo';
import { Breadcrumbs } from '../components/erp/Breadcrumbs';

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
  PackageCheck,
  Factory,
  Cpu,
  Warehouse,
  Building2,
  History,
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  Lock,
  Ruler,
  Wrench,
  Navigation,
  BarChart3,
  UserCheck,
  Bell,
  Settings,
  Layers,
  FolderTree,
  GitFork,
  Play,
  DollarSign,
  BookOpen,
  Calendar,
  Scale,
  TrendingUp,
  PieChart,
  TrendingDown,
  FileCheck,
  ClipboardList,
  Clock,
  Timer,
  CalendarRange,
};

const formatRoleLabel = (roleName?: string | null): string => {
  if (!roleName) return 'Staff User';
  return roleName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface ERPLayoutProps {
  children?: React.ReactNode;
  activeTab?: string;
}

export const ERPLayout: React.FC<ERPLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { profile, role, signOut } = useAuth();
  const { isCategoryEnabled, theme, toggleTheme } = useSystemSettings();
  const isDark = theme === 'dark';

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate(`${ERP_BASE_PATH}/login`, { replace: true });
  };

  // Filter sidebar menu items based on current authenticated user role AND system feature flags
  const visibleMenuItems = ERP_SIDEBAR_MENU.filter((item) => {
    if (item.category && !isCategoryEnabled(item.category)) {
      return false;
    }
    if (!item.roles || item.roles.length === 0) return true;
    return role ? item.roles.includes(role) : false;
  });

  // Group items by category
  const categories = Array.from(new Set(visibleMenuItems.map((item) => item.category || 'Core')));

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
    <div className="min-h-screen flex font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white bg-slate-100 text-slate-900">
      {/* MOBILE BACKDROP DRAWER OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ERP SIDEBAR */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0B1E36] text-white flex flex-col transition-all duration-300 border-r border-slate-800/80 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* LOGO HEADER */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
          <Link to={`${ERP_BASE_PATH}/dashboard`} className="flex items-center gap-2 overflow-hidden">
            <KolmeksLogo variant="dark-bg" size="sm" />
            {!collapsed && (
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                ERP v2.4
              </span>
            )}
          </Link>

          {/* Desktop Toggle Button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SIDEBAR NAVIGATION ITEMS */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar pb-6">
          {categories.map((cat) => {
            const catItems = visibleMenuItems.filter((item) => (item.category || 'Core') === cat);
            if (catItems.length === 0) return null;

            return (
              <div key={cat} className="space-y-1">
                {!collapsed && cat !== 'core' && (
                  <div className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                    {cat}
                  </div>
                )}

                {catItems.map((item) => {
                  const Icon = iconMap[item.iconName] || LayoutDashboard;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group focus:outline-hidden ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                          }`}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!collapsed && item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-colors ${
                            isActive
                              ? 'bg-white/20 text-white border border-white/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* USER INFO FOOTER */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {userInitials}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{displayName}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{formattedRoleName}</div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Logout from ERP"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN ERP CONTAINER */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* TOPBAR */}
        <header className="h-16 border-b px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200 bg-white border-slate-200 text-slate-900 shadow-xs">
          {/* Left: Mobile Menu Toggle & Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Open Mobile Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumbs />
          </div>

          {/* Right: Search, Notifications & Profile Menu */}
          <div className="flex items-center gap-3">
            {/* Search Placeholder */}
            <div className="hidden sm:flex items-center px-3 py-1.5 rounded-lg border text-xs w-48 transition-colors bg-slate-50 border-slate-200 text-slate-500">
              <Search className="w-3.5 h-3.5 mr-2 text-slate-400" />
              <span>Search ERP...</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                className={`p-2 rounded-lg transition-colors relative ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {userInitials}
                </div>
                <span className={`hidden md:inline text-xs font-bold ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}>{displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border py-2 z-50 animate-in fade-in duration-150 bg-white border-slate-200 text-slate-800 shadow-slate-300/50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold truncate text-slate-900">{displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {formattedRoleName}
                    </span>
                  </div>

                  <Link
                    to={`${ERP_BASE_PATH}/settings`}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs transition-colors text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile & Settings</span>
                  </Link>

                  {role === 'admin' && (
                    <Link
                      to={`${ERP_BASE_PATH}/master-admin`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
                    >
                      <Settings className="w-4 h-4 text-indigo-600" />
                      <span>Master Governance & Toggles</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out of ERP</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN OUTLET CONTENT */}
        <main className="flex-1 p-4 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
