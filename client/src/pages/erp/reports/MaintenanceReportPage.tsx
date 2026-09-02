import React, { useEffect, useState } from 'react';
import { Wrench, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { GlobalReportFilters } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const MaintenanceReportPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({ date_range: 'this_month' });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getMaintenanceReport(filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load maintenance report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleExport = () => {
    if (!reportData?.workOrdersTable) return;
    const headers = ['WO Code', 'Asset', 'Type', 'Due Date', 'Status'];
    const rows = reportData.workOrdersTable.map((w: any) => [
      w.wo_number || w.id,
      w.asset?.name || 'Production Machine',
      w.work_type || 'Preventive',
      w.due_date ? new Date(w.due_date).toLocaleDateString() : 'N/A',
      w.status
    ]);
    reportsService.exportToCSV('Maintenance_Work_Orders_Report', headers, rows);
  };

  const metrics = reportData?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Wrench className="w-7 h-7 text-cyan-400" />
            <span>Plant Maintenance & Equipment Reliability</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Preventive maintenance compliance, equipment breakdowns, work order status, and downtime logs.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Maintenance CSV</span>
        </button>
      </div>

      <ReportsNavigationHeader />
      <GlobalReportFilterBar filters={filters} onChange={setFilters} onRefresh={fetchReport} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Work Orders"
          value={loading ? '...' : metrics?.totalWorkOrders || 0}
          subtitle="Maintenance requests"
          icon={Wrench}
          color="cyan"
        />
        <KPICard
          title="Open Work Orders"
          value={loading ? '...' : metrics?.openWorkOrders || 0}
          subtitle="Scheduled / in progress"
          icon={Clock}
          color="blue"
        />
        <KPICard
          title="Overdue Work Orders"
          value={loading ? '...' : metrics?.overdueWorkOrders || 0}
          subtitle="Past due target completion"
          icon={AlertTriangle}
          color="rose"
        />
        <KPICard
          title="Completed Orders"
          value={loading ? '...' : metrics?.completedWorkOrders || 0}
          subtitle="Resolved maintenance tasks"
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Equipment Maintenance Work Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">WO Code</th>
                <th className="px-6 py-4">Equipment / Asset</th>
                <th className="px-6 py-4">Maintenance Type</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading work orders...</td></tr>
              ) : !reportData?.workOrdersTable || reportData.workOrdersTable.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No maintenance work orders found.</td></tr>
              ) : (
                reportData.workOrdersTable.map((w: any) => (
                  <tr key={w.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400">{w.wo_number || w.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold text-white">{w.asset?.name || 'CNC Machine Line 1'}</td>
                    <td className="px-6 py-4 text-slate-300">{w.work_type || 'Preventive'}</td>
                    <td className="px-6 py-4 text-slate-300">{w.due_date ? new Date(w.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-semibold uppercase">
                        {w.status}
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
