import React, { useEffect, useState } from 'react';
import { ShoppingCart, DollarSign, FileText, CheckCircle, RotateCcw, Download, Users } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { ReportChart } from '../../../components/reports/ReportChart';
import { GlobalReportFilters } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const SalesReportPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({
    date_range: 'this_month'
  });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getSalesReport(filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load sales report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleExport = () => {
    if (!reportData?.ordersTable) return;
    const headers = ['Order Code', 'Customer', 'Order Date', 'Total (€)', 'Status'];
    const rows = reportData.ordersTable.map((o: any) => [
      o.order_number || o.id,
      o.customer?.name || 'Standard Client',
      new Date(o.created_at).toLocaleDateString(),
      Number(o.total_amount || 0).toFixed(2),
      o.status
    ]);
    reportsService.exportToCSV('Sales_Orders_Report', headers, rows);
  };

  const metrics = reportData?.metrics;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <ShoppingCart className="w-7 h-7 text-emerald-400" />
            <span>Sales & Commercial Performance Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Revenue trends, customer purchasing power, order volume distribution, and fulfillment stats.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      <ReportsNavigationHeader />
      <GlobalReportFilterBar
        filters={filters}
        onChange={setFilters}
        onRefresh={fetchReport}
        showStatusFilter
        statuses={['draft', 'pending', 'approved', 'in_progress', 'delivered', 'completed', 'cancelled']}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Sales Revenue"
          value={loading ? '...' : `€${(metrics?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Total order revenue"
          icon={DollarSign}
          color="emerald"
        />
        <KPICard
          title="Total Sales Orders"
          value={loading ? '...' : metrics?.totalOrders || 0}
          subtitle="Processed orders count"
          icon={FileText}
          color="blue"
        />
        <KPICard
          title="Average Order Value"
          value={loading ? '...' : `€${(metrics?.avgOrderValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Revenue per order"
          icon={ShoppingCart}
          color="indigo"
        />
        <KPICard
          title="Delivered Orders"
          value={loading ? '...' : metrics?.deliveredOrders || 0}
          subtitle="Orders fulfilled & shipped"
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Monthly Revenue Trend (€)"
          type="area"
          data={reportData?.monthlyChart || []}
          dataKey="revenue"
          categoryKey="period"
          color="#10b981"
        />
        <ReportChart
          title="Top Customers by Revenue (€)"
          type="bar"
          data={reportData?.customerChart || []}
          dataKey="revenue"
          categoryKey="name"
          color="#3b82f6"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Recent Sales Orders & Fulfillment Status</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Order Code</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">Loading sales records...</td>
                </tr>
              ) : !reportData?.ordersTable || reportData.ordersTable.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">No sales orders found for selected criteria.</td>
                </tr>
              ) : (
                reportData.ordersTable.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-400">{o.order_number || o.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold text-white">{o.customer?.name || 'Standard Client'}</td>
                    <td className="px-6 py-4 text-slate-300">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">€{Number(o.total_amount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold uppercase">
                        {o.status}
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
