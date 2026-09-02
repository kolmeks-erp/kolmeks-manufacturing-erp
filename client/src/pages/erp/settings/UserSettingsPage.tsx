import React, { useEffect, useState } from 'react';
import { SettingsNavigationHeader } from './SettingsNavigationHeader';
import { settingsService } from '../../../services/settings.service';
import { UserItem, RoleItem } from '../../../types/settings';
import { Users, Shield, UserCheck, UserX, CheckCircle2, AlertCircle, Edit } from 'lucide-react';

export const UserSettingsPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<UserItem | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uData, rData] = await Promise.all([settingsService.getUsers(), settingsService.getRoles()]);
      setUsers(uData);
      setRoles(rData);
    } catch (err) {
      console.error('Failed to load user management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await settingsService.updateUserStatus(userId, newStatus);
      setToast({ message: `User status changed to ${newStatus}.`, type: 'success' });
      loadData();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update user status.', type: 'error' });
    } finally {
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleOpenRoleModal = (user: UserItem) => {
    setRoleModalUser(user);
    setSelectedRoleId(user.role?.id || '');
  };

  const handleRoleSave = async () => {
    if (!roleModalUser || !selectedRoleId) return;
    try {
      setUpdating(true);
      await settingsService.updateUserRole(roleModalUser.id, selectedRoleId);
      setToast({ message: 'User role updated successfully.', type: 'success' });
      setRoleModalUser(null);
      loadData();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update user role.', type: 'error' });
    } finally {
      setUpdating(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          ERP User Management & Accounts
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage user profiles, assign organizational roles, and enforce account active/suspended statuses.
        </p>
      </div>

      <SettingsNavigationHeader />

      {toast && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200'
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {users.map((u) => {
                const status = u.status || (u.is_active !== false ? 'active' : 'inactive');
                return (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                        {u.full_name?.charAt(0) || u.email?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <span>{u.full_name}</span>
                        {u.is_master_admin && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded font-semibold">
                            Master Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono text-xs">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-medium text-gray-800 dark:text-gray-200">
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                        {u.role?.name || 'Standard User'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{u.department || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          status === 'active' || status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : status === 'suspended'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenRoleModal(u)}
                        className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg font-medium transition-all"
                      >
                        Change Role
                      </button>

                      {status === 'active' || status === 'Active' ? (
                        <button
                          onClick={() => handleStatusChange(u.id, 'suspended')}
                          className="px-2.5 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg font-medium transition-all"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(u.id, 'active')}
                          className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg font-medium transition-all"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Change Role for {roleModalUser.full_name}
            </h3>

            <div className="space-y-3 text-sm">
              <label className="block font-semibold text-gray-700 dark:text-gray-300">Select New Role</label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="">-- Select Role --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.description ? `(${r.description})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRoleSave}
                disabled={updating || !selectedRoleId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
