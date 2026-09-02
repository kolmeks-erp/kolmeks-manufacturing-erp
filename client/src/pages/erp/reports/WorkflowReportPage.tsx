import React, { useEffect, useState } from 'react';
import { GitMerge, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { GlobalReportFilters } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const WorkflowReportPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({ date_range: 'this_month' });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getWorkflowReport(filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load workflow report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleExport = () => {
    if (!reportData?.instancesTable) return;
    const headers = ['Workflow Title', 'Entity', 'Initiated Date', 'Status'];
    const rows = reportData.instancesTable.map((i: any) => [
      i.title || i.entity_type,
      i.entity_type,
      new Date(i.created_at).toLocaleDateString(),
      i.status
    ]);
    reportsService.exportToCSV('Workflow_Execution_Report', headers, rows);
  };

  const metrics = reportData?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-3">
            <GitMerge className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            <span>Workflow Execution & Approval Bottleneck Analytics</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Active workflow instances, pending approval tasks, stage duration, and rejection rates.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Workflow CSV</span>
        </button>
      </div>

      <ReportsNavigationHeader />
      <GlobalReportFilterBar filters={filters} onChange={setFilters} onRefresh={fetchReport} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Active Workflows"
          value={loading ? '...' : metrics?.activeWorkflows || 0}
          subtitle="Workflows in progress"
          icon={GitMerge}
          color="cyan"
        />
        <KPICard
          title="Pending Approval Tasks"
          value={loading ? '...' : metrics?.pendingTasks || 0}
          subtitle="Tasks assigned to approvers"
          icon={Clock}
          color="amber"
        />
        <KPICard
          title="Completed Workflows"
          value={loading ? '...' : metrics?.completedWorkflows || 0}
          subtitle="Fully approved instances"
          icon={CheckCircle}
          color="emerald"
        />
        <KPICard
          title="Rejected Workflows"
          value={loading ? '...' : metrics?.rejectedWorkflows || 0}
          subtitle="Rejected or cancelled requests"
          icon={XCircle}
          color="rose"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Workflow Instances</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Workflow Name</th>
                <th className="px-6 py-4">Entity Type</th>
                <th className="px-6 py-4">Initiated Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400">Loading workflow instances...</td></tr>
              ) : !reportData?.instancesTable || reportData.instancesTable.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400">No active workflow instances found.</td></tr>
              ) : (
                reportData.instancesTable.map((i: any) => (
                  <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{i.title || i.entity_type}</td>
                    <td className="px-6 py-4 font-mono text-xs text-cyan-600 dark:text-cyan-400 uppercase">{i.entity_type}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{new Date(i.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-cyan-50 text-cyan-600 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20 rounded-full text-xs font-semibold uppercase">
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
