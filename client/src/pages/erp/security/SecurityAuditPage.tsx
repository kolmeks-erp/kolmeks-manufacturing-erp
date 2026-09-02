import React, { useEffect, useState } from 'react';
import { FileCheck2, Download, Search, ShieldCheck } from 'lucide-react';
import { SecurityNavigationHeader } from '../../../components/security/SecurityNavigationHeader';
import { securityService } from '../../../services/security.service';
import { SystemAuditLogRecord } from '../../../types/security';

export const SecurityAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<SystemAuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const data = await securityService.getAuditTrail({ module: moduleFilter, search });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [moduleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAudit();
  };

  const handleExport = () => {
    const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Action', 'Module', 'Entity Type', 'Entity ID', 'Severity'];
    const rows = logs.map((l) => [
      new Date(l.created_at).toLocaleString(),
      l.actor?.full_name || 'System User',
      l.actor?.email || 'system@kolmeks.com',
      l.action,
      l.module,
      l.entity_type,
      l.entity_id || 'N/A',
      l.severity || 'INFO'
    ]);
    securityService.exportSecurityCSV('Immutable_Audit_Trail_Report', headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <FileCheck2 className="w-7 h-7 text-emerald-400" />
            <span>Immutable System Audit Trail Log</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Complete tamper-proof historical record of administrative alterations, state changes, and transaction postings.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Trail CSV</span>
        </button>
      </div>

      <SecurityNavigationHeader />

      {/* Controls */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search action keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
          <label className="text-xs font-semibold text-slate-400 uppercase">Module Scope:</label>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
          >
            <option value="">All ERP Modules</option>
            <option value="Security">Security</option>
            <option value="Settings">Settings</option>
            <option value="Sales">Sales</option>
            <option value="Procurement">Procurement</option>
            <option value="Inventory">Inventory</option>
            <option value="Workflows">Workflows</option>
            <option value="Documents">Documents</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Immutable Audit Logs ({logs.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Loading audit trail logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">No immutable audit records found.</td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {l.actor?.full_name || l.actor?.email || 'System User'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-400">{l.action}</td>
                    <td className="px-6 py-4 text-xs text-slate-300 capitalize">{l.module}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{l.entity_type}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold uppercase">
                        {l.severity || 'INFO'}
                      </span>
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
