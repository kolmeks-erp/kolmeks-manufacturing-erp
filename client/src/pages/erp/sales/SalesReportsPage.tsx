import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
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
    const headers = ['Customer Name', 'Total Orders', 'Total Revenue (€)', 'Returns Count'];
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <BarChart3 className="w-7 h-7 text-blue-400" />
            <span>Sales & Distribution Analytics Reports</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Analyze customer purchase history, sales revenue per account, return ratios, and export executive reports.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Total Processed Orders</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{loading ? '...' : reportData?.totalOrdersCount || 0}</h3>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Total Customer Returns</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{loading ? '...' : reportData?.totalReturnsCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Customer Performance Breakdown Table */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Customer Sales & Revenue Performance</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Total Orders</th>
                <th className="px-6 py-4">Total Revenue</th>
                <th className="px-6 py-4">Returns Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    Generating sales reports...
                  </td>
                </tr>
              ) : !reportData?.customerPerformance || reportData.customerPerformance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    No customer performance data available.
                  </td>
                </tr>
              ) : (
                reportData.customerPerformance.map((c: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                    <td className="px-6 py-4 font-medium text-slate-200">{c.totalOrders} order(s)</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">€{c.totalRevenue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-amber-400 font-semibold">{c.returnsCount} return(s)</td>
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
