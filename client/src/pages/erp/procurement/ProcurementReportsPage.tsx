import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  FileText,
  Download,
  Users,
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
    const headers = ['Supplier Code', 'Supplier Name', 'Total POs', 'Total Purchase Value (€)', 'On-Time Delivery %', 'Quality Acceptance %', 'Returns Count', 'Rating'];
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <BarChart3 className="w-7 h-7 text-blue-400" />
            <span>Procurement & Supplier Performance Reports</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Executive analytics on vendor spend, on-time delivery ratios, quality acceptance %, returns, and rating scorecards.
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Total Purchase Orders</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{loading ? '...' : reportData?.totalPOsCount || 0}</h3>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Total Goods Receipts (GRN)</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{loading ? '...' : reportData?.totalGRNsCount || 0}</h3>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Supplier Returns (RMA)</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{loading ? '...' : reportData?.totalReturnsCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Supplier Performance Table */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Supplier Performance & Spend Summary</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
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
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Loading procurement performance...
                  </td>
                </tr>
              ) : !reportData?.supplierPerformance || reportData.supplierPerformance.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No supplier performance data available.
                  </td>
                </tr>
              ) : (
                reportData.supplierPerformance.map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-mono text-slate-400 font-medium">{s.supplier_code}</td>
                    <td className="px-6 py-4 font-bold text-white">{s.name}</td>
                    <td className="px-6 py-4 font-medium text-slate-200">{s.totalOrders} order(s)</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">€{s.totalValue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-blue-400 font-semibold">{s.onTimeDeliveryPct.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-indigo-400 font-semibold">{s.qualityAcceptancePct.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-rose-400 font-semibold">{s.returnsCount}</td>
                    <td className="px-6 py-4 font-bold text-amber-400 flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-amber-400" />
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
