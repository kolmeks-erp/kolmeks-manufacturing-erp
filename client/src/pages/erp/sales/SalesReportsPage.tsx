import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Users,
  RotateCcw,
  BarChart3,
} from 'lucide-react';
import { salesService } from '../../../services/sales.service';

export const SalesReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await salesService.getSalesReports();
      setReportData(data);
    } catch (err) {
      console.error('Failed to load sales reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!reportData?.customerPerformance) return;
    const headers = ['Customer Name', 'Total Orders', 'Total Revenue (₹)', 'Returns Count'];
    const rows = reportData.customerPerformance.map((c: any) => [
      `"${c.name}"`,
      c.totalOrders,
      c.totalRevenue.toFixed(2),
      c.returnsCount,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Distribution_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sales & Distribution Analytics Reports
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Analyze customer purchase history, sales revenue per account, return ratios, and export executive reports.
            </p>
          </div>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-2 text-xs shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Total Processed Orders</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{loading ? '...' : reportData?.totalOrdersCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Total Customer Returns</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{loading ? '...' : reportData?.totalReturnsCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Customer Performance Breakdown Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Customer Sales & Revenue Performance</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Total Orders</th>
                <th className="px-6 py-4">Total Revenue</th>
                <th className="px-6 py-4">Returns Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    Generating sales reports...
                  </td>
                </tr>
              ) : !reportData?.customerPerformance || reportData.customerPerformance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    No customer performance data available.
                  </td>
                </tr>
              ) : (
                reportData.customerPerformance.map((c: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 font-mono">{c.totalOrders} order(s)</td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹{c.totalRevenue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-amber-600 dark:text-amber-400 font-bold font-mono">{c.returnsCount} return(s)</td>
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
