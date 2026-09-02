import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Download, BarChart2, Filter, Layers } from 'lucide-react';
import { costingService } from '../../../../services/costing.service';

export const CostReportsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [reportType, setReportType] = useState<string>('PRODUCT');
  const [reports, setReports] = useState<any[]>([]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await costingService.getReports({ report_type: reportType });
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Error fetching cost reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType]);

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Manufacturing Cost Financial Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Aggregated cost analysis by Finished Product & Cost Center allocations
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Report
        </button>
      </div>

      {/* Report Controls */}
      <div className="flex items-center gap-4 bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-400">Report View:</label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="PRODUCT">Product Cost Summary Report</option>
          <option value="ORDER">Order-by-Order Detail Report</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">{reportType === 'PRODUCT' ? 'Product Name' : 'Order #'}</th>
                <th className="p-4">Completed Qty</th>
                <th className="p-4">Direct Material</th>
                <th className="p-4">Direct Labor</th>
                <th className="p-4">Overhead</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4">Avg Unit Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Generating manufacturing cost reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No production cost data available for report.
                  </td>
                </tr>
              ) : (
                reports.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {reportType === 'PRODUCT' ? `${r.product_name} (${r.product_code})` : r.order?.production_order_number}
                    </td>
                    <td className="p-4 text-slate-900 dark:text-white font-medium">
                      {r.completed_quantity} {r.unit || ''}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{formatCurrency(r.material_cost)}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{formatCurrency(r.labor_cost)}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{formatCurrency(r.overhead_cost)}</td>
                    <td className="p-4 text-slate-900 dark:text-white font-bold">{formatCurrency(r.total_cost)}</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(r.average_unit_cost || r.unit_cost)}</td>
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

export default CostReportsPage;
