import React, { useEffect, useState } from 'react';
import { ShieldAlert, UserCheck, ShieldCheck, Download } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { GlobalReportFilters } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const AuditReportPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({ date_range: 'this_month' });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getAuditReport(filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load audit report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleExport = () => {
    if (!reportData?.logsTable) return;
    const headers = ['Timestamp', 'Actor', 'Action', 'Module', 'Severity'];
    const rows = reportData.logsTable.map((l: any) => [
      new Date(l.created_at).toLocaleString(),
      l.actor?.full_name || l.actor?.email || l.actor_id || 'System User',
      l.action,
      l.module || 'System',
      l.severity || 'INFO'
    ]);
    reportsService.exportToCSV('System_Audit_Logs_Report', headers, rows);
  };

  const metrics = reportData?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <ShieldAlert className="w-7 h-7 text-amber-400" />
            <span>Security Observability & Audit Trail Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            System configuration edits, administrative permission updates, user activity logs, and security telemetry.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      <ReportsNavigationHeader />
      <GlobalReportFilterBar filters={filters} onChange={setFilters} onRefresh={fetchReport} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <KPICard
          title="Total Audit Events"
          value={loading ? '...' : metrics?.totalLogs || 0}
          subtitle="Captured audit records"
          icon={ShieldAlert}
          color="amber"
        />
        <KPICard
          title="Security & Warning Events"
          value={loading ? '...' : metrics?.securityEvents || 0}
          subtitle="High-severity configuration updates"
          icon={ShieldCheck}
          color="rose"
        />
        <KPICard
          title="Monitored User Actions"
          value={loading ? '...' : metrics?.totalLogs || 0}
          subtitle="Active admin sessions"
          icon={UserCheck}
          color="blue"
        />
      </div>

      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Audit Event Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading audit logs...</td></tr>
              ) : !reportData?.logsTable || reportData.logsTable.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No audit log records found.</td></tr>
              ) : (
                reportData.logsTable.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 text-xs font-mono text-slate-300">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {l.actor?.full_name || l.actor?.email || 'Admin User'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-400">{l.action}</td>
                    <td className="px-6 py-4 text-slate-300 capitalize">{l.module || 'System'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase border ${
                        l.severity === 'SECURITY' || l.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
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
