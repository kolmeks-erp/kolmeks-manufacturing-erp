import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Download, ShieldCheck, Clock } from 'lucide-react';
import { documentService } from '../../../services/document.service';

export const DocumentReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    documentService
      .getDocumentReports()
      .then((data) => setReportData(data))
      .catch((err) => console.error('Failed to generate document reports:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!reportData?.documents) return;
    const headers = ['Document Number', 'Title', 'Type', 'Category', 'Status', 'Confidentiality', 'Created Date'];
    const rows = reportData.documents.map((d: any) => [
      `"${d.document_number}"`,
      `"${d.title?.replace(/"/g, '""')}"`,
      `"${d.type?.name || 'General'}"`,
      `"${d.category?.name || 'Uncategorized'}"`,
      `"${d.status}"`,
      `"${d.confidentiality_level}"`,
      `"${new Date(d.created_at).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kolmeks_Document_Compliance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Compliance & Audit Reports</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Generate executive document reports and export metadata audit logs</p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={!reportData}
          className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export Metadata CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase">Managed Documents</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {loading ? '...' : reportData?.totalCount || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase">Recorded Approvals</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {loading ? '...' : reportData?.approvals?.length || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase">Audit Log Events</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {loading ? '...' : reportData?.recentAudits?.length || 0}
          </div>
        </div>
      </div>

      {/* Recent Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            System Document Audit Trail
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Reason / Notes</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : (
                (reportData?.recentAudits || []).map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{log.action}</td>
                    <td className="px-6 py-4 text-xs">{log.actor?.full_name || 'System Admin'}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-sm truncate">{log.reason || '-'}</td>
                    <td className="px-6 py-4 text-xs font-mono">{new Date(log.created_at).toLocaleString()}</td>
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
