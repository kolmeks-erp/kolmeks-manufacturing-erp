import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PauseCircle,
  Calendar,
  Building2,
  FileText,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { productionService } from '../../../services/production.service';
import { ProductionOrder, ProductionOrderStatus, ProductionPriority } from '../../../types/production';

export const ProductionOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    fetchOrders();
  }, [search, status, priority, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await productionService.getOrders({
        search,
        status,
        priority,
        page,
        limit: 10,
      });
      setOrders(res.data);
      setTotalRecords(res.pagination.totalRecords);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch production orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const renderStatusBadge = (st: ProductionOrderStatus) => {
    switch (st) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Clock className="w-3.5 h-3.5" /> DRAFT
          </span>
        );
      case 'PLANNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> PLANNED
          </span>
        );
      case 'RELEASED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Play className="w-3.5 h-3.5" /> RELEASED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
            <Play className="w-3.5 h-3.5" /> IN PROGRESS
          </span>
        );
      case 'PAUSED':
      case 'ON_HOLD':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <PauseCircle className="w-3.5 h-3.5" /> {st}
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> CANCELLED
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{st}</span>;
    }
  };

  const renderPriorityBadge = (pr: ProductionPriority) => {
    switch (pr) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">Urgent</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">High</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">Medium</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30 uppercase">Low</span>;
      default:
        return <span className="text-xs text-slate-400">{pr}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0F2647] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Manufacturing Work Orders</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Production Orders</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Manage shop floor execution, planned quantities, and manufacturing progress.</p>
        </div>

        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/production/orders/new`)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-xs active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Production Order</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 shadow-xs p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by MO number, product, or sales order..."
            value={search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PLANNED">PLANNED</option>
            <option value="RELEASED">RELEASED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="PAUSED">PAUSED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">URGENT</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-[#0B1E36] text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4">Order Number</th>
                <th className="px-5 py-4">Product Details</th>
                <th className="px-5 py-4">Sales Order / Customer</th>
                <th className="px-5 py-4 text-center">Quantities & Progress</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading production orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                    No production orders found matching criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const planned = typeof ord.planned_quantity === 'number' ? ord.planned_quantity : parseFloat(String(ord.planned_quantity || '0'));
                  const completed = typeof ord.completed_quantity === 'number' ? ord.completed_quantity : parseFloat(String(ord.completed_quantity || '0'));
                  const pct = planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : 0;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-[#163761]/50 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {ord.production_order_number}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{ord.product?.name || 'Unknown Product'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          Code: {ord.product?.product_code}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {ord.sales_order ? (
                          <div>
                            <div className="font-mono text-xs text-indigo-700 dark:text-indigo-400 font-medium">{ord.sales_order.order_number}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{ord.sales_order.customer?.company_name}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Standalone Order</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="w-48 mx-auto space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-600 dark:text-slate-300">{completed} / {planned} {ord.product?.unit || 'pcs'}</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{pct}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">{renderPriorityBadge(ord.priority)}</td>
                      <td className="px-5 py-4">{renderStatusBadge(ord.status)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/production/orders/${ord.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-[#0B1E36] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div>
            Showing <span className="text-slate-900 dark:text-white font-semibold">{orders.length}</span> of <span className="text-slate-900 dark:text-white font-semibold">{totalRecords}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => handleFilterChange('page', String(page - 1))}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700 dark:text-slate-300">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => handleFilterChange('page', String(page + 1))}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
