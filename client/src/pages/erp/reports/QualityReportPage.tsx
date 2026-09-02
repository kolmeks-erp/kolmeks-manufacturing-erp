import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { GlobalReportFilters } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const QualityReportPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({ date_range: 'this_month' });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getQualityReport(filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load quality report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleExport = () => {
    if (!reportData?.inspectionsTable) return;
    const headers = ['Inspection ID', 'Item / Serial', 'Inspector', 'Result', 'Status'];
    const rows = reportData.inspectionsTable.map((i: any) => [
      i.inspection_number || i.id,
      i.item_name || 'Component Parts',
      i.inspector_name || 'QC Officer',
      i.result || i.status,
      i.status
    ]);
    reportsService.exportToCSV('Quality_Inspections_Report', headers, rows);
  };

  const metrics = reportData?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-3">
            <ShieldCheck className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            <span>Quality Control & Compliance Analytics</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Inspection pass/fail rates, Non-Conformance Reports (NCR), CAPA resolutions, and defect trends.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Quality CSV</span>
        </button>
      </div>

      <ReportsNavigationHeader />
      <GlobalReportFilterBar filters={filters} onChange={setFilters} onRefresh={fetchReport} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Inspections"
          value={loading ? '...' : metrics?.totalInspections || 0}
          subtitle="Quality checks conducted"
          icon={ShieldCheck}
          color="blue"
        />
        <KPICard
          title="Passed Inspections"
          value={loading ? '...' : metrics?.passedCount || 0}
          subtitle="Met quality specifications"
          icon={CheckCircle}
          color="emerald"
        />
        <KPICard
          title="Failed Inspections"
          value={loading ? '...' : metrics?.failedCount || 0}
          subtitle="Defects or tolerance errors"
          icon={XCircle}
          color="rose"
        />
        <KPICard
          title="Open CAPA / NCRs"
          value={loading ? '...' : (metrics?.ncrCount || 0) + (metrics?.openCAPA || 0)}
          subtitle="Active corrective action plans"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Inspection Logs & Findings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Inspection ID</th>
                <th className="px-6 py-4">Component / Batch</th>
                <th className="px-6 py-4">Inspector</th>
                <th className="px-6 py-4">Result</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading inspections...</td></tr>
              ) : !reportData?.inspectionsTable || reportData.inspectionsTable.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No inspection records found.</td></tr>
              ) : (
                reportData.inspectionsTable.map((i: any) => (
                  <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-rose-600 dark:text-rose-400">{i.inspection_number || i.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{i.item_name || 'Assembly Batch'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{i.inspector_name || 'QC Inspector'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200">{i.result || i.status}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 rounded-full text-xs font-semibold uppercase">
                        {i.status}
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
