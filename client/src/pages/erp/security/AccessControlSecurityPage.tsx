import React, { useEffect, useState } from 'react';
import { UserCheck, Shield, Search, UserX, CheckCircle, Download } from 'lucide-react';
import { SecurityNavigationHeader } from '../../../components/security/SecurityNavigationHeader';
import { securityService } from '../../../services/security.service';
import { SecurityUserRecord } from '../../../types/security';

export const AccessControlSecurityPage: React.FC = () => {
  const [users, setUsers] = useState<SecurityUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await securityService.getAccessRecords({ search, status: statusFilter });
      setUsers(data);
    } catch (err) {
      console.error('Failed to load user access records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user: SecurityUserRecord) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      await securityService.updateUserStatus(user.id, newStatus);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Action failed.');
    }
  };

  const handleExport = () => {
    const headers = ['User ID', 'Full Name', 'Email', 'Role', 'Department', 'Account Status', 'Created Date'];
    const rows = users.map((u) => [
      u.id,
      u.full_name,
      u.email,
      u.role?.name || 'Staff User',
      u.department || 'Operations',
      u.status,
      new Date(u.created_at).toLocaleDateString()
    ]);
    securityService.exportSecurityCSV('Access_Control_Audit_Report', headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <UserCheck className="w-7 h-7 text-emerald-400" />
            <span>Identity & Access Control Hardening</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Enforce RBAC permissions, manage user account status, prevent privilege escalation, and audit access credentials.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Access Audit CSV</span>
        </button>
      </div>

      <SecurityNavigationHeader />

      {/* Filter & Search Controls */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-400 uppercase">Status Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="suspended">Suspended Accounts</option>
            <option value="inactive">Inactive Accounts</option>
          </select>
        </div>
      </div>

      {/* Users Access Table */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span>Staff Account Profiles & RBAC Authorization ({users.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Security Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">Loading user security records...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">No user accounts found matching criteria.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{u.full_name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold capitalize">
                        {u.role?.name || 'Staff User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{u.department || 'Operations'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase border ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : u.status === 'suspended'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ml-auto ${
                          u.status === 'suspended'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-rose-600/80 hover:bg-rose-600 text-white'
                        }`}
                      >
                        {u.status === 'suspended' ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Reactivate</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Suspend Access</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
