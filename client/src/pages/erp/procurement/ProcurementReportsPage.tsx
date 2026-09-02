import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  RotateCcw,
  BarChart3,
  Truck,
  Building2,
  Star,
} from 'lucide-react';
import { procurementP2PService } from '../../../services/procurement_p2p.service';

export const ProcurementReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await procurementP2PService.getProcurementReports();
      setReportData(data);
    } catch (err) {
      console.error('Failed to load procurement reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!reportData?.supplierPerformance) return;
    const headers = ['Supplier Code', 'Supplier Name', 'Total POs', 'Total Purchase Value (₹)', 'On-Time Delivery %', 'Quality Acceptance %', 'Returns Count', 'Rating'];
    const rows = reportData.supplierPerformance.map((s: any) => [
      `"${s.supplier_code}"`,
      `"${s.name}"`,
      s.totalOrders,
      s.totalValue.toFixed(2),
      s.onTimeDeliveryPct.toFixed(1),
      s.qualityAcceptancePct.toFixed(1),
      s.returnsCount,
      `"${s.rating}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Procurement_P2P_Report_${new Date().toISOString().split('T')[0]}.csv`);
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
              Procurement & Supplier Performance Reports
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Executive analytics on vendor spend, on-time delivery ratios, quality acceptance %, returns, and rating scorecards.
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Total Purchase Orders</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{loading ? '...' : reportData?.totalPOsCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Total Goods Receipts (GRN)</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{loading ? '...' : reportData?.totalGRNsCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-800">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Supplier Returns (RMA)</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{loading ? '...' : reportData?.totalReturnsCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Supplier Performance Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Supplier Performance & Spend Summary</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Supplier Name</th>
                <th className="px-6 py-4">Total Orders</th>
                <th className="px-6 py-4">Total Value</th>
                <th className="px-6 py-4">On-Time %</th>
                <th className="px-6 py-4">Quality %</th>
                <th className="px-6 py-4">Returns</th>
                <th className="px-6 py-4">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    Loading procurement performance...
                  </td>
                </tr>
              ) : !reportData?.supplierPerformance || reportData.supplierPerformance.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    No supplier performance data available.
                  </td>
                </tr>
              ) : (
                reportData.supplierPerformance.map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400 font-semibold">{s.supplier_code}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{s.name}</td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 font-mono">{s.totalOrders} order(s)</td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹{s.totalValue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-bold font-mono">{s.onTimeDeliveryPct.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-bold font-mono">{s.qualityAcceptancePct.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-rose-600 dark:text-rose-400 font-bold font-mono">{s.returnsCount}</td>
                    <td className="px-6 py-4 font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1 font-mono">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{s.rating}</span>
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
