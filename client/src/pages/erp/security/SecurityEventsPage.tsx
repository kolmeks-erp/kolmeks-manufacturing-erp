import React, { useEffect, useState } from 'react';
import { Activity, Download, Filter } from 'lucide-react';
import { SecurityNavigationHeader } from '../../../components/security/SecurityNavigationHeader';
import { securityService } from '../../../services/security.service';
import { SecurityEventRecord } from '../../../types/security';

export const SecurityEventsPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await securityService.getSecurityEvents({ category: categoryFilter, severity: severityFilter });
      setEvents(data);
    } catch (err) {
      console.error('Failed to load security events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, severityFilter]);

  const handleExport = () => {
    const headers = ['Timestamp', 'Actor Email', 'Event Type', 'Category', 'Severity', 'Module', 'Target ID', 'IP Address'];
    const rows = events.map((e) => [
      new Date(e.event_timestamp).toLocaleString(),
      e.actor_email || 'System / Anonymous',
      e.event_type,
      e.category,
      e.severity,
      e.module,
      e.target_id || 'N/A',
      e.ip_address
    ]);
    securityService.exportSecurityCSV('Security_Event_Stream_Audit', headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Activity className="w-7 h-7 text-amber-400" />
            <span>Real-Time Security Event & Threat Stream</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Categorized event telemetry capturing auth failures, privilege escalations, configuration changes, and data exports.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Event Stream CSV</span>
        </button>
      </div>

      <SecurityNavigationHeader />

      {/* Filters */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 shadow-lg flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Categories</option>
            <option value="AUTHENTICATION">AUTHENTICATION</option>
            <option value="AUTHORIZATION">AUTHORIZATION</option>
            <option value="SESSION">SESSION</option>
            <option value="SECURITY_POLICY">SECURITY_POLICY</option>
            <option value="DATA_ACCESS">DATA_ACCESS</option>
            <option value="EXPORT">EXPORT</option>
            <option value="SYSTEM_CONFIG">SYSTEM_CONFIG</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Severities</option>
            <option value="INFO">INFO</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Security Events Stream Table */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Event Log Stream ({events.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Loading security event stream...</td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">No security events found.</td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">{new Date(e.event_timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-white">{e.actor_email || 'System'}</td>
                    <td className="px-6 py-4 font-mono text-xs text-amber-400">{e.event_type}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-300">{e.category}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase border ${
                          e.severity === 'CRITICAL' || e.severity === 'HIGH'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : e.severity === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}
                      >
                        {e.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{e.ip_address}</td>
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
