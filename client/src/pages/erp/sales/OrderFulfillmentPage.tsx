import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageCheck,
  Search,
  Filter,
  Lock,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <PackageCheck className="w-7 h-7 text-emerald-400" />
            <span>Order Fulfillment & Stock Reservations</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track line item stock availability, reserved inventory, picking/packing progress, backorder allocation, and fulfillment percentage.
          </p>
        </div>
        <button
          onClick={fetchFulfillment}
          disabled={loading}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Fulfillment</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 text-white text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
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
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
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
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Calculating inventory stock fulfillment...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No orders matching fulfillment query.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-semibold text-white">
                      <Link to={`${ERP_BASE_PATH}/sales-orders/${item.id}`} className="hover:text-emerald-400 transition">
                        {item.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{item.totalOrdered} pcs</td>
                    <td className="px-6 py-4 text-blue-400 font-semibold">{item.totalReserved} pcs</td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">{item.totalDelivered} pcs</td>
                    <td className="px-6 py-4 text-amber-400 font-semibold">{item.totalBackorder} pcs</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div
                            className={`h-full rounded-full ${
                              item.fulfillmentPct === 100
                                ? 'bg-emerald-500'
                                : item.fulfillmentPct > 0
                                ? 'bg-blue-500'
                                : 'bg-slate-600'
                            }`}
                            style={{ width: `${item.fulfillmentPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-200">{item.fulfillmentPct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`${ERP_BASE_PATH}/sales/picking`}
                        className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition inline-flex items-center space-x-1"
                      >
                        <span>Dispatch Pick</span>
                        <ChevronRight className="w-3 h-3" />
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
