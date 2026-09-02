import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import { costingService } from '../../../../services/costing.service';

export const ProductionCostListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [calculatingId, setCalculatingId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await costingService.getProductionCostOrders({ search, status });
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error fetching production cost orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const handleCalculate = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    try {
      setCalculatingId(orderId);
      const res = await costingService.calculateCost(orderId);
      if (res.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Error calculating cost:', err);
    } finally {
      setCalculatingId(null);
    }
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getCostStatusBadge = (costStatus?: string) => {
    switch (costStatus) {
      case 'POSTED':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> POSTED</span>;
      case 'CALCULATED':
        return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded-full flex items-center gap-1"><Calculator className="w-3 h-3"/> CALCULATED</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full flex items-center gap-1"><Clock className="w-3 h-3"/> PENDING</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Calculator className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Production Costing Orders
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Calculate material, labor, and overhead absorption costs per production order
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Orders
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order # or Notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Production Statuses</option>
          <option value="RELEASED">RELEASED</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>

      {/* Orders Master Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Production Order</th>
                <th className="p-4">Product / Item</th>
                <th className="p-4">Qty (Planned / Done)</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4">Unit Cost</th>
                <th className="p-4">Variance</th>
                <th className="p-4">Costing Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Loading production orders costing telemetry...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No production orders found matching filters.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const mfgCost = ord.manufacturing_cost;
                  const totalCost = mfgCost?.total_cost || 0;
                  const unitCost = mfgCost?.unit_cost || 0;
                  const variance = mfgCost?.total_variance || 0;

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => navigate(`/secure-kolmeks-x0y0/production/costing/orders/${ord.id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        {ord.production_order_number || ord.production_number}
                      </td>
                      <td className="p-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{ord.product?.name}</div>
                        <div className="text-xs text-slate-400">{ord.product?.product_code}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-900 dark:text-white font-medium">{ord.completed_quantity || 0}</span>
                        <span className="text-slate-400"> / {ord.planned_quantity} {ord.product?.unit}</span>
                      </td>
                      <td className="p-4 text-slate-900 dark:text-white font-semibold">
                        {mfgCost ? formatCurrency(totalCost) : '—'}
                      </td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium">
                        {mfgCost ? formatCurrency(unitCost) : '—'}
                      </td>
                      <td className={`p-4 font-medium ${variance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {mfgCost ? formatCurrency(variance) : '—'}
                      </td>
                      <td className="p-4">
                        {getCostStatusBadge(mfgCost?.status)}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={(e) => handleCalculate(e, ord.id)}
                          disabled={calculatingId === ord.id}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold rounded-lg transition"
                        >
                          {calculatingId === ord.id ? 'Calculating...' : 'Recalculate Cost'}
                        </button>
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

export default ProductionCostListPage;
