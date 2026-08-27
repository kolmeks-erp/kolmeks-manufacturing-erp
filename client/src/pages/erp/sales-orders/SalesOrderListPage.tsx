import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  ArrowUpDown,
  Calendar,
  Building2,
  AlertCircle,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  PauseCircle,
} from 'lucide-react';
import { salesOrderService } from '../../../services/sales_order.service';
import { SalesOrder, SalesOrderFilters } from '../../../types/sales_order';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const SalesOrderListPage: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filter States
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 10;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchSalesOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: SalesOrderFilters = {
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        priority: priorityFilter,
        currency: currencyFilter,
        sortBy,
        sortOrder,
      };

      const res = await salesOrderService.getSalesOrders(filters);
      if (res.success) {
        setOrders(res.data || []);
        setTotalPages(res.meta.totalPages || 1);
        setTotalCount(res.meta.total || 0);
      } else {
        setError('Failed to retrieve sales orders.');
      }
    } catch (err: any) {
      console.error('Error fetching sales orders:', err);
      setError(err.message || 'Error connecting to server to fetch sales orders.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, priorityFilter, currencyFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchSalesOrders();
  }, [fetchSalesOrders]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCurrencyFilter('all');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            DRAFT
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            CONFIRMED
          </span>
        );
      case 'IN_PRODUCTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            IN PRODUCTION
          </span>
        );
      case 'READY_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <FileCheck className="w-3.5 h-3.5" />
            READY FOR DELIVERY
          </span>
        );
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {s}
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <PauseCircle className="w-3.5 h-3.5" />
            ON HOLD
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3.5 h-3.5" />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {s}
          </span>
        );
    }
  };

  const renderPriorityBadge = (priority: string) => {
    const p = (priority || '').toUpperCase();
    switch (p) {
      case 'URGENT':
        return <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">URGENT</span>;
      case 'HIGH':
        return <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">HIGH</span>;
      case 'LOW':
        return <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">LOW</span>;
      default:
        return <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">NORMAL</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Sales Orders</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage confirmed customer orders and prepare them for manufacturing & fulfillment.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSalesOrders()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/sales-orders/new`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Sales Order
          </button>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* SEARCH INPUT */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Order # or Customer Ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* STATUS FILTER */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="IN_PRODUCTION">IN PRODUCTION</option>
              <option value="READY_FOR_DELIVERY">READY FOR DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ON_HOLD">ON HOLD</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* PRIORITY FILTER */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* CURRENCY FILTER */}
          <div>
            <select
              value={currencyFilter}
              onChange={(e) => {
                setCurrencyFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="all">All Currencies</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || currencyFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Showing filtered results ({totalCount} total orders found)
            </span>
            <button
              onClick={handleClearFilters}
              className="text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
            >
              <Filter className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <p className="font-semibold">{error}</p>
            <p className="text-slate-500 mt-0.5">Check database connection or role authorization.</p>
          </div>
        </div>
      )}

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('order_number')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Order #</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Quotation Ref</th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('order_date')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Order Date</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Req. Delivery</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-900" />
                    Loading Sales Orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-3">
                      <div className="p-3 bg-slate-100 w-fit mx-auto rounded-full text-slate-400">
                        <FileSpreadsheet className="w-8 h-8" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">No Sales Orders Found</h3>
                      <p className="text-xs text-slate-500">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No sales orders match your active filter criteria.'
                          : 'No confirmed customer sales orders have been generated yet.'}
                      </p>
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/sales-orders/new`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create Sales Order
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((so) => (
                  <tr key={so.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ORDER NUMBER */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/sales-orders/${so.id}`)}
                        className="hover:underline text-slate-900"
                      >
                        {so.order_number}
                      </button>
                      {so.customer_reference && (
                        <div className="text-[10px] font-normal text-slate-400">
                          Ref: {so.customer_reference}
                        </div>
                      )}
                    </td>

                    {/* CUSTOMER */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {so.customer_master ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold">{so.customer_master.company_name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Direct Customer</span>
                      )}
                    </td>

                    {/* QUOTATION REF */}
                    <td className="py-3.5 px-4 font-medium">
                      {so.quotation_master ? (
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/quotations/${so.quotation_id}`)}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          {so.quotation_master.quotation_number}
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* ORDER DATE */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {so.order_date ? new Date(so.order_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>

                    {/* REQUESTED DELIVERY */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {so.requested_delivery_date ? (
                        <span className="font-medium text-slate-700">
                          {new Date(so.requested_delivery_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* TOTAL AMOUNT */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {so.currency || 'EUR'} {Number(so.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* PRIORITY */}
                    <td className="py-3.5 px-4 text-center">{renderPriorityBadge(so.priority)}</td>

                    {/* STATUS */}
                    <td className="py-3.5 px-4 text-center">{renderStatusBadge(so.status)}</td>

                    {/* ACTIONS */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/sales-orders/${so.id}`)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Sales Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {so.status === 'DRAFT' && (
                          <button
                            onClick={() => navigate(`${ERP_BASE_PATH}/sales-orders/${so.id}/edit`)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Draft Sales Order"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs">
          <div className="text-slate-500 font-medium">
            Page <span className="font-bold text-slate-900">{page}</span> of{' '}
            <span className="font-bold text-slate-900">{totalPages}</span> ({totalCount} total sales orders)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-2xs"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
