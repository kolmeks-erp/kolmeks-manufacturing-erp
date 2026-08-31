import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackageCheck,
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
  Clock,
  CheckCircle2,
  Ban,
  FileText,
} from 'lucide-react';
import { GrnService } from '../../../services/grn.service';
import { SupplierService } from '../../../services/supplier.service';
import { GoodsReceipt, GRNFilters } from '../../../types/grn';
import { Supplier } from '../../../types/supplier';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const GoodsReceiptListPage: React.FC = () => {
  const navigate = useNavigate();

  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load active suppliers list for dropdown filter
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const res = await SupplierService.getSuppliers({ limit: 100, status: 'active' });
        if (res.success) {
          setSuppliers(res.data || []);
        }
      } catch (err) {
        console.warn('Failed to load suppliers for GRN filter:', err);
      }
    };
    loadSuppliers();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchGoodsReceipts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: GRNFilters = {
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        supplier_id: supplierFilter,
        sortBy,
        sortOrder,
      };

      const res = await GrnService.getGoodsReceipts(filters);
      if (res.success) {
        setReceipts(res.data || []);
        setTotalPages(res.meta.totalPages || 1);
        setTotalCount(res.meta.total || 0);
      } else {
        setError('Failed to retrieve goods receipts list.');
      }
    } catch (err: any) {
      console.error('Error fetching goods receipts:', err);
      setError(err.message || 'Error connecting to server to fetch goods receipts.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, supplierFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchGoodsReceipts();
  }, [fetchGoodsReceipts]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setSupplierFilter('all');
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
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            IN PROGRESS
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            COMPLETED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            REJECTED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
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

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F2647] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl">
            <PackageCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Goods Receipts (GRN)</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record, inspect, and complete physical material receipts delivered by suppliers against Purchase Orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchGoodsReceipts()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/goods-receipts/new`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Goods Receipt
          </button>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white dark:bg-[#0F2647] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* SEARCH INPUT */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search GRN # or Delivery Reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 focus:outline-hidden"
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
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* SUPPLIER FILTER */}
          <div>
            <select
              value={supplierFilter}
              onChange={(e) => {
                setSupplierFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.company_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter !== 'all' || supplierFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Showing filtered results ({totalCount} total receipts found)
            </span>
            <button
              onClick={handleClearFilters}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
            >
              <Filter className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div>
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* DATA TABLE */}
      <div className="bg-white dark:bg-[#0F2647] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B1E36] border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => handleSort('grn_number')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>GRN #</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Purchase Order</th>
                <th className="py-3.5 px-4">Supplier / Vendor</th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => handleSort('receipt_date')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Receipt Date</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Delivery Ref</th>
                <th className="py-3.5 px-4 text-center">Quantities (Rec / Rej / Acc)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-900 dark:text-slate-200" />
                    Loading Goods Receipts...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-3">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 w-fit mx-auto rounded-full text-slate-400 dark:text-slate-500">
                        <PackageCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Goods Receipts Found</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No goods receipts match your active filters.'
                          : 'No goods receipts have been logged yet.'}
                      </p>
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/goods-receipts/new`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Log Goods Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                receipts.map((grn) => (
                  <tr key={grn.id} className="hover:bg-slate-50/80 dark:hover:bg-[#163761]/50 transition-colors">
                    {/* GRN NUMBER */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-blue-400">
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/goods-receipts/${grn.id}`)}
                        className="hover:underline text-slate-900 dark:text-blue-400 flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{grn.grn_number}</span>
                      </button>
                    </td>

                    {/* PO REF */}
                    <td className="py-3.5 px-4 font-medium">
                      {grn.purchase_order ? (
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/purchase-orders/${grn.purchase_order_id}`)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                        >
                          {grn.purchase_order.po_number}
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* SUPPLIER */}
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {grn.supplier ? (
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/${grn.supplier_id}`)}
                          className="flex items-center gap-1.5 hover:underline text-slate-900 dark:text-white"
                        >
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold">{grn.supplier.name}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">Direct Supplier</span>
                      )}
                    </td>

                    {/* RECEIPT DATE */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {grn.receipt_date ? new Date(grn.receipt_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>

                    {/* DELIVERY REF */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {grn.delivery_reference || <span className="text-slate-400 font-sans italic">Not specified</span>}
                    </td>

                    {/* QUANTITIES SUMMARY */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 text-xs font-mono">
                        <span className="text-slate-700 dark:text-slate-200 font-semibold">{grn.totals?.total_received || 0}</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">{grn.totals?.total_rejected || 0}</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{grn.totals?.total_accepted || 0}</span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-4 text-center">{renderStatusBadge(grn.status)}</td>

                    {/* ACTIONS */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/goods-receipts/${grn.id}`)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {['DRAFT', 'IN_PROGRESS'].includes(grn.status.toUpperCase()) && (
                          <button
                            onClick={() => navigate(`${ERP_BASE_PATH}/goods-receipts/${grn.id}/edit`)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                            title="Edit Goods Receipt"
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
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-[#0B1E36] border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({totalCount} total receipts)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
