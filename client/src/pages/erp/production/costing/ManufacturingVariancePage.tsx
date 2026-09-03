import React, { useState, useEffect } from 'react';
import { TrendingDown, Search, RefreshCw, AlertTriangle, Layers, CheckCircle2 } from 'lucide-react';
import { costingService } from '../../../../services/costing.service';

export const ManufacturingVariancePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [variances, setVariances] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');

  const fetchVariances = async () => {
    try {
      setLoading(true);
      const res = await costingService.getVariances({ search });
      if (res.success) {
        setVariances(res.data);
      }
    } catch (err) {
      console.error('Error fetching variances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariances();
  }, []);

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <TrendingDown className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Manufacturing Cost Variance Analysis
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Compare planned BOM & Routing standard baseline costs vs actual shop floor execution
          </p>
        </div>
        <button
          onClick={fetchVariances}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Variances
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search variance by order # or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchVariances()}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Variances Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Variance Ref</th>
                <th className="p-4">Production Order</th>
                <th className="p-4">Product / Item</th>
                <th className="p-4">Material Qty Var</th>
                <th className="p-4">Labor Efficiency Var</th>
                <th className="p-4">Overhead Var</th>
                <th className="p-4">Total Variance</th>
                <th className="p-4">Recorded Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Loading cost variance telemetry...
                  </td>
                </tr>
              ) : variances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No production cost variances recorded yet.
                  </td>
                </tr>
              ) : (
                variances.map((v) => {
                  const totalVar = v.total_variance || 0;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">{v.variance_number}</td>
                      <td className="p-4 font-mono text-purple-600 dark:text-purple-400 text-xs">
                        {v.production_order?.production_order_number}
                      </td>
                      <td className="p-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{v.product?.name}</div>
                        <div className="text-xs text-slate-400">{v.product?.product_code}</div>
                      </td>
                      <td className={`p-4 font-medium ${(v.material_qty_variance || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(v.material_qty_variance)}
                      </td>
                      <td className={`p-4 font-medium ${(v.labor_efficiency_variance || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(v.labor_efficiency_variance)}
                      </td>
                      <td className={`p-4 font-medium ${(v.overhead_variance || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(v.overhead_variance)}
                      </td>
                      <td className={`p-4 font-bold ${totalVar > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(totalVar)}
                      </td>
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(v.recorded_at).toLocaleDateString()}
                      </td>
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

export default ManufacturingVariancePage;
