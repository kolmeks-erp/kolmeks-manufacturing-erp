import React, { useEffect, useState } from 'react';
import { Truck, DollarSign, ShoppingBag, CheckSquare, Download } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { ReportChart } from '../../../components/reports/ReportChart';
import { GlobalReportFilters } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const ProcurementReportPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({
    date_range: 'this_month'
  });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getProcurementReport(filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load procurement report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleExport = () => {
    if (!reportData?.ordersTable) return;
    const headers = ['PO Number', 'Supplier', 'Date', 'Total Spend (₹)', 'Status'];
    const rows = reportData.ordersTable.map((p: any) => [
      p.po_number || p.id,
      p.supplier?.name || 'Primary Supplier',
      new Date(p.created_at).toLocaleDateString(),
      Number(p.total_amount || 0).toFixed(2),
      p.status
    ]);
    reportsService.exportToCSV('Procurement_Orders_Report', headers, rows);
  };

  const metrics = reportData?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Truck className="w-7 h-7 text-indigo-400" />
            <span>Procurement & Purchasing Spend Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Supplier spend metrics, purchase order commitments, goods receipts, and vendor performance.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Procurement CSV</span>
        </button>
      </div>

      <ReportsNavigationHeader />
      <GlobalReportFilterBar filters={filters} onChange={setFilters} onRefresh={fetchReport} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Purchase Spend"
          value={loading ? '...' : `₹${(metrics?.totalSpend || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Total PO commitments"
          icon={DollarSign}
          color="emerald"
        />
        <KPICard
          title="Total Purchase Orders"
          value={loading ? '...' : metrics?.totalPOs || 0}
          subtitle="Issued purchase orders"
          icon={ShoppingBag}
          color="blue"
        />
        <KPICard
          title="Open Purchase Orders"
          value={loading ? '...' : metrics?.openPOs || 0}
          subtitle="Active POs awaiting GRN"
          icon={Truck}
          color="amber"
        />
        <KPICard
          title="Completed Receipts"
          value={loading ? '...' : metrics?.completedPOs || 0}
          subtitle="Fully received POs"
          icon={CheckSquare}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <ReportChart
          title="Top Supplier Spend (₹)"
          type="bar"
          data={reportData?.supplierChart || []}
          dataKey="spend"
          categoryKey="name"
          color="#6366f1"
        />
      </div>

      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Purchase Orders Detail</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4">Total (₹)</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading purchase orders...</td></tr>
              ) : !reportData?.ordersTable || reportData.ordersTable.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No purchase orders found.</td></tr>
              ) : (
                reportData.ordersTable.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">{p.po_number || p.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold text-white">{p.supplier?.name || 'Primary Supplier'}</td>
                    <td className="px-6 py-4 text-slate-300">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">₹{Number(p.total_amount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold uppercase">
                        {p.status}
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
