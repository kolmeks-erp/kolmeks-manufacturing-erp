import React, { useEffect, useState } from 'react';
import { FileText, Clock, AlertTriangle, XCircle, Download } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { GlobalReportFilters } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const DocumentReportPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({ date_range: 'all' });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getDocumentReport(filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load document report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleExport = () => {
    if (!reportData?.docsTable) return;
    const headers = ['Document Title', 'Category', 'Version', 'Expiration', 'Status'];
    const rows = reportData.docsTable.map((d: any) => [
      d.title || d.file_name,
      d.category || 'General',
      d.version || 'v1.0',
      d.expiration_date ? new Date(d.expiration_date).toLocaleDateString() : 'N/A',
      d.status || 'Active'
    ]);
    reportsService.exportToCSV('Document_Control_Report', headers, rows);
  };

  const metrics = reportData?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <FileText className="w-7 h-7 text-blue-400" />
            <span>Document Control & Expiry Compliance Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Enterprise document library stats, approval queues, upcoming expiration dates, and compliance audits.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Document CSV</span>
        </button>
      </div>

      <ReportsNavigationHeader />
      <GlobalReportFilterBar filters={filters} onChange={setFilters} onRefresh={fetchReport} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Controlled Documents"
          value={loading ? '...' : metrics?.totalDocs || 0}
          subtitle="Managed files in system"
          icon={FileText}
          color="blue"
        />
        <KPICard
          title="Pending Approvals"
          value={loading ? '...' : metrics?.pendingApproval || 0}
          subtitle="Awaiting sign-off"
          icon={Clock}
          color="amber"
        />
        <KPICard
          title="Expiring Soon (30 Days)"
          value={loading ? '...' : metrics?.expiringSoon || 0}
          subtitle="Review/renewal required"
          icon={AlertTriangle}
          color="rose"
        />
        <KPICard
          title="Expired Documents"
          value={loading ? '...' : metrics?.expired || 0}
          subtitle="Overdue renewal policy"
          icon={XCircle}
          color="rose"
        />
      </div>

      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Controlled Document Catalog</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Document Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Version</th>
                <th className="px-6 py-4">Expiration Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading document catalog...</td></tr>
              ) : !reportData?.docsTable || reportData.docsTable.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No documents found.</td></tr>
              ) : (
                reportData.docsTable.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-semibold text-white">{d.title || d.file_name}</td>
                    <td className="px-6 py-4 text-slate-300">{d.category || 'General'}</td>
                    <td className="px-6 py-4 text-mono font-bold text-blue-400">{d.version || 'v1.0'}</td>
                    <td className="px-6 py-4 text-slate-300">{d.expiration_date ? new Date(d.expiration_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold uppercase">
                        {d.status || 'Active'}
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
