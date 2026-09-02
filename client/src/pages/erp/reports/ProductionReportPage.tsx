import React, { useEffect, useState } from 'react';
import { Factory, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { GlobalReportFilters } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const ProductionReportPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({ date_range: 'this_month' });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getProductionReport(filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load production report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleExport = () => {
    if (!reportData?.ordersTable) return;
    const headers = ['WO Number', 'Product', 'Quantity', 'Due Date', 'Status'];
    const rows = reportData.ordersTable.map((w: any) => [
      w.work_order_number || w.order_number || w.id,
      w.product_name || 'Manufacturing Component',
      w.quantity || 1,
      w.due_date ? new Date(w.due_date).toLocaleDateString() : 'N/A',
      w.status
    ]);
    reportsService.exportToCSV('Production_Work_Orders_Report', headers, rows);
  };

  const metrics = reportData?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-3">
            <Factory className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            <span>Manufacturing & Production Analytics</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Shop floor work order progress, completion throughput, scrap rate, and schedule delays.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Production CSV</span>
        </button>
      </div>

      <ReportsNavigationHeader />
      <GlobalReportFilterBar filters={filters} onChange={setFilters} onRefresh={fetchReport} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Production Orders"
          value={loading ? '...' : metrics?.totalOrders || 0}
          subtitle="Orders logged in period"
          icon={Factory}
          color="amber"
        />
        <KPICard
          title="In Progress Orders"
          value={loading ? '...' : metrics?.inProgressOrders || 0}
          subtitle="Active on manufacturing floor"
          icon={Clock}
          color="blue"
        />
        <KPICard
          title="Completed Work Orders"
          value={loading ? '...' : metrics?.completedOrders || 0}
          subtitle="Finished assembly runs"
          icon={CheckCircle}
          color="emerald"
        />
        <KPICard
          title="Delayed Orders"
          value={loading ? '...' : metrics?.delayedOrders || 0}
          subtitle="Behind target due date"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Production Work Orders Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Work Order</th>
                <th className="px-6 py-4">Assembly / Item</th>
                <th className="px-6 py-4">Target Qty</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading work orders...</td></tr>
              ) : !reportData?.ordersTable || reportData.ordersTable.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No production orders found.</td></tr>
              ) : (
                reportData.ordersTable.map((w: any) => (
                  <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-amber-600 dark:text-amber-400">{w.work_order_number || w.order_number || w.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{w.product_name || 'Pump Component'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{w.quantity || 1} unit(s)</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{w.due_date ? new Date(w.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 rounded-full text-xs font-semibold uppercase">
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
