import React, { useEffect, useState } from 'react';
import { Smartphone, LogOut, CheckCircle, XCircle, Download } from 'lucide-react';
import { SecurityNavigationHeader } from '../../../components/security/SecurityNavigationHeader';
import { securityService } from '../../../services/security.service';
import { UserSessionRecord } from '../../../types/security';

export const SessionSecurityPage: React.FC = () => {
  const [sessions, setSessions] = useState<UserSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await securityService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load session records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this user device session?')) return;
    try {
      await securityService.revokeSession(sessionId);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Revocation failed.');
    }
  };

  const handleExport = () => {
    const headers = ['Session ID', 'User Email', 'Device / Browser', 'IP Address', 'Last Activity', 'Status'];
    const rows = sessions.map((s) => [
      s.id,
      s.user?.email || s.user_id,
      `${s.device_info} (${s.browser})`,
      s.ip_address,
      new Date(s.last_activity).toLocaleString(),
      s.status
    ]);
    securityService.exportSecurityCSV('Active_Sessions_Security_Report', headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Smartphone className="w-7 h-7 text-blue-400" />
            <span>Active Session Lifecycle & Device Security</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor active ERP login sessions, device telemetry, browser footprints, and revoke suspicious connections.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Sessions CSV</span>
        </button>
      </div>

      <SecurityNavigationHeader />

      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Monitored Session Telemetry ({sessions.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">User Email</th>
                <th className="px-6 py-4">Device & Browser</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Revocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Loading active sessions...</td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">No session telemetry records found.</td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-semibold text-white">{s.user?.email || s.user_id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="font-medium text-white">{s.device_info}</div>
                      <div className="text-xs text-slate-400">{s.browser}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-400">{s.ip_address}</td>
                    <td className="px-6 py-4 text-slate-300 text-xs">{new Date(s.last_activity).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase border ${
                          s.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {s.status === 'active' ? (
                        <button
                          onClick={() => handleRevoke(s.id)}
                          className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1 ml-auto"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Terminated</span>
                      )}
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
