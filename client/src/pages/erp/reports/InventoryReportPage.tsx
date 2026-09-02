import React, { useEffect, useState } from 'react';
import { Boxes, IndianRupee, AlertTriangle, Warehouse, Download } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { GlobalReportFilters } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const InventoryReportPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({ date_range: 'all' });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getInventoryReport(filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load inventory report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleExport = () => {
    if (!reportData?.productsTable) return;
    const headers = ['SKU / Code', 'Product Name', 'Category', 'Stock Qty', 'Unit Cost (₹)', 'Valuation (₹)'];
    const rows = reportData.productsTable.map((p: any) => [
      p.sku || p.code || p.id,
      p.name,
      p.category || 'General',
      p.stock_quantity || 0,
      Number(p.unit_cost || p.unit_price || 0).toFixed(2),
      (Number(p.stock_quantity || 0) * Number(p.unit_cost || p.unit_price || 0)).toFixed(2)
    ]);
    reportsService.exportToCSV('Inventory_Valuation_Report', headers, rows);
  };

  const metrics = reportData?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Boxes className="w-7 h-7 text-purple-400" />
            <span>Inventory Valuation & Stock Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Warehouse stock levels, inventory asset valuation, low stock warnings, and reorder levels.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Inventory CSV</span>
        </button>
      </div>

      <ReportsNavigationHeader />
      <GlobalReportFilterBar filters={filters} onChange={setFilters} onRefresh={fetchReport} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Stock Valuation"
          value={loading ? '...' : `₹${(metrics?.totalValuation || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="On-hand inventory asset value"
          icon={IndianRupee}
          color="purple"
        />
        <KPICard
          title="Total Stock Items"
          value={loading ? '...' : metrics?.totalItems || 0}
          subtitle="Catalog product lines"
          icon={Boxes}
          color="blue"
        />
        <KPICard
          title="Low Stock Items"
          value={loading ? '...' : metrics?.lowStockItems || 0}
          subtitle="At or below reorder point"
          icon={AlertTriangle}
          color="rose"
        />
        <KPICard
          title="Active Warehouses"
          value={loading ? '...' : metrics?.warehouseCount || 0}
          subtitle="Storage facility count"
          icon={Warehouse}
          color="emerald"
        />
      </div>

      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Stock Items Valuation Catalog</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">SKU / Code</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock Qty</th>
                <th className="px-6 py-4">Unit Cost</th>
                <th className="px-6 py-4">Total Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading stock items...</td></tr>
              ) : !reportData?.productsTable || reportData.productsTable.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No inventory products found.</td></tr>
              ) : (
                reportData.productsTable.map((p: any) => {
                  const valuation = Number(p.stock_quantity || 0) * Number(p.unit_cost || p.unit_price || 0);
                  return (
                    <tr key={p.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-mono font-bold text-purple-400">{p.sku || p.code || p.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 font-semibold text-white">{p.name}</td>
                      <td className="px-6 py-4 text-slate-300">{p.category || 'General'}</td>
                      <td className="px-6 py-4 font-medium text-slate-200">{p.stock_quantity || 0}</td>
                      <td className="px-6 py-4 text-slate-300">₹{Number(p.unit_cost || p.unit_price || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">₹{valuation.toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
