import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageCheck,
  Search,
  Filter,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { salesService } from '../../../services/sales.service';
import { FulfillmentSummaryItem } from '../../../types/sales';

export const OrderFulfillmentPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FulfillmentSummaryItem[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchFulfillment = async () => {
    setLoading(true);
    try {
      const data = await salesService.getOrderFulfillment();
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load fulfillment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFulfillment();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.order_number.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'backorder') return matchesSearch && item.totalBackorder > 0;
    if (filter === 'fulfilled') return matchesSearch && item.fulfillmentPct === 100;
    if (filter === 'partial') return matchesSearch && item.fulfillmentPct > 0 && item.fulfillmentPct < 100;
    if (filter === 'unfulfilled') return matchesSearch && item.fulfillmentPct === 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Order Fulfillment & Stock Reservations
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Track line item stock availability, reserved inventory, picking/packing progress, backorder allocation, and fulfillment percentage.
            </p>
          </div>
        </div>

        <button
          onClick={fetchFulfillment}
          disabled={loading}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Fulfillment</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Fulfillment States</option>
            <option value="unfulfilled">Unfulfilled (0%)</option>
            <option value="partial">Partially Fulfilled</option>
            <option value="fulfilled">Fully Fulfilled (100%)</option>
            <option value="backorder">Has Backorders</option>
          </select>
        </div>
      </div>

      {/* Fulfillment Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Sales Order</th>
                <th className="px-6 py-4">Ordered Qty</th>
                <th className="px-6 py-4">Reserved Qty</th>
                <th className="px-6 py-4">Delivered Qty</th>
                <th className="px-6 py-4">Backorder Qty</th>
                <th className="px-6 py-4">Fulfillment %</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    Calculating inventory stock fulfillment...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    No orders matching fulfillment query.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">
                      <Link to={`${ERP_BASE_PATH}/sales-orders/${item.id}`} className="hover:underline">
                        {item.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white font-mono">{item.totalOrdered} pcs</td>
                    <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-bold font-mono">{item.totalReserved} pcs</td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold font-mono">{item.totalDelivered} pcs</td>
                    <td className="px-6 py-4 text-amber-600 dark:text-amber-400 font-bold font-mono">{item.totalBackorder} pcs</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-700">
                          <div
                            className={`h-full rounded-full ${
                              item.fulfillmentPct === 100
                                ? 'bg-emerald-500'
                                : item.fulfillmentPct > 0
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${item.fulfillmentPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{item.fulfillmentPct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`${ERP_BASE_PATH}/sales/picking`}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition inline-flex items-center space-x-1 shadow-xs"
                      >
                        <span>Dispatch Pick</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
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
