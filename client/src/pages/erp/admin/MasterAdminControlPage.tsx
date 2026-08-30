import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Sliders,
  Users,
  CheckCircle2,
  XCircle,
  Power,
  RefreshCw,
  Search,
  Lock,
  Layers,
  DollarSign,
  Users2,
  Wrench,
  ShieldCheck,
  Factory,
  Boxes,
  Package,
  Truck,
  ShoppingCart
} from 'lucide-react';
import { useSystemSettings } from '../../../context/SystemSettingsContext';
import { systemSettingsService, AdminUserControlItem } from '../../../services/systemSettings.service';
import { useAuth } from '../../../context/AuthContext';

const categoryIconMap: Record<string, React.ElementType> = {
  'Sales': ShoppingCart,
  'Procurement': Truck,
  'Products': Package,
  'Inventory': Boxes,
  'Production': Factory,
  'Quality': ShieldCheck,
  'Maintenance': Wrench,
  'HR & Operations': Users2,
  'Finance & Accounting': DollarSign,
  'Self Service': Layers,
};

export const MasterAdminControlPage: React.FC = () => {
  const { featureFlags, loadingFlags, toggleModule, refreshFlags } = useSystemSettings();
  const { role } = useAuth();

  const [users, setUsers] = useState<AdminUserControlItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [userSearch, setUserSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'modules' | 'users'>('modules');
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await systemSettingsService.getUsersForControl();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load user control list:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleModule = async (key: string, currentStatus: boolean) => {
    try {
      setUpdatingKey(key);
      await toggleModule(key, !currentStatus);
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: nextStatus } : u))
      );
      await systemSettingsService.toggleUserActive(userId, nextStatus);
    } catch (err) {
      console.error('Failed to update user active status:', err);
      fetchUsers();
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const term = userSearch.toLowerCase();
    return (
      (u.full_name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.role?.name || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Master Admin System Control</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Master Governance & Module Toggles</h1>
          <p className="text-slate-600 text-sm">
            Enable or disable entire ERP functional modules and manage active access for Admins and Staff members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refreshFlags();
              fetchUsers();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Settings</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold transition-all ${
            activeTab === 'modules'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>ERP Module Feature Flags ({featureFlags.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Access Control ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: MODULE FEATURE TOGGLES */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Instant System-Wide Module Disabling</p>
              <p className="text-amber-800 mt-0.5">
                Toggling a module OFF (e.g. <strong>Finance & Accounting</strong>) instantly hides its sidebar navigation, dashboard links, and routes for all staff users across the organization.
              </p>
            </div>
          </div>

          {loadingFlags ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading module settings...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featureFlags.map((flag) => {
                const Icon = categoryIconMap[flag.category] || Sliders;
                const isEnabled = flag.is_enabled;
                const isUpdating = updatingKey === flag.key;

                return (
                  <div
                    key={flag.key}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                      isEnabled ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-200 bg-slate-50/60 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl border ${isEnabled ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* TOGGLE SWITCH */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleModule(flag.key, isEnabled)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{flag.label}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{flag.description || `Controls functionality for ${flag.category}`}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 uppercase text-[10px] tracking-wider font-mono">{flag.category}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {isEnabled ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                        <span>{isEnabled ? 'MODULE ON' : 'MODULE OFF'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER ACCESS CONTROL */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search staff user by name, email, or role..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Showing {filteredUsers.length} of {users.length} registered accounts
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {loadingUsers ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading user accounts...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-4">User Details</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 text-right">Master Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const isActive = u.is_active !== false;
                      const roleName = u.role?.name || 'Staff User';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                                {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{u.full_name || 'Staff User'}</div>
                                <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono font-semibold text-[11px] border border-slate-200 capitalize">
                              {roleName.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                              <Power className="w-3 h-3" />
                              <span>{isActive ? 'Active' : 'Disabled'}</span>
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u.id, isActive)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                                isActive
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>{isActive ? 'Disable User' : 'Enable User'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
