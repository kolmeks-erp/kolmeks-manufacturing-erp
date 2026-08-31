import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  Link2,
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../../../types/quotation';
import { QuotationService } from '../../../services/quotation.service';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../types/customer';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const QuotationListPage: React.FC = () => {
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const limit = 10;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Customers for Filter Dropdown
  useEffect(() => {
    CustomerService.getCustomers({ limit: 100 })
      .then((res) => {
        if (res.success) setCustomersList(res.data);
      })
      .catch((err) => console.warn('Failed loading customers dropdown:', err));
  }, []);

  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await QuotationService.getQuotations({
        page: currentPage,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        customer_id: customerFilter,
        currency: currencyFilter,
        sortBy,
        sortOrder,
      });

      if (res.success) {
        setQuotations(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalRecords(res.meta.total);
      } else {
        setError('Failed to fetch commercial quotations.');
      }
    } catch (err: any) {
      console.error('Error loading quotations:', err);
      setError(err.response?.data?.message || 'Unable to connect to server.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, customerFilter, currencyFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setCustomerFilter('all');
    setCurrencyFilter('all');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Quotations Management"
        description="Create and manage commercial quotations for Kolmeks customers."
        actions={
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/quotations/new`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Quotation
          </button>
        }
      />

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white dark:bg-[#0F2647] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Quotation #..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
            />
          </div>

          {/* STATUS FILTER */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="SENT">SENT</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* CUSTOMER FILTER */}
          <div>
            <select
              value={customerFilter}
              onChange={(e) => {
                setCustomerFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="all">All Customers</option>
              {customersList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} ({c.customer_code})
                </option>
              ))}
            </select>
          </div>

          {/* CURRENCY FILTER */}
          <div>
            <select
              value={currencyFilter}
              onChange={(e) => {
                setCurrencyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="all">All Currencies</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        {/* CLEAR FILTERS & RECORD COUNT */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-white">{quotations.length}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-white">{totalRecords}</span> quotations
          </div>

          {(searchTerm || statusFilter !== 'all' || customerFilter !== 'all' || currencyFilter !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* TABLE CONTENT */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-[#0F2647] rounded-xl border border-slate-200 dark:border-slate-800/80">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading commercial quotations...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white dark:bg-[#0F2647] rounded-xl border border-slate-200 dark:border-slate-800/80">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchQuotations}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
          >
            Try Again
          </button>
        </div>
      ) : quotations.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#0F2647] rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Quotations Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No commercial quotations match your search criteria. Create a new quotation or adjust your filters.
          </p>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/quotations/new`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Quotation
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F2647] rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs overflow-hidden text-slate-900 dark:text-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Quotation #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">RFQ Ref</th>
                  <th className="px-4 py-3">Quotation Date</th>
                  <th className="px-4 py-3">Valid Until</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-normal">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      <Link
                        to={`${ERP_BASE_PATH}/quotations/${q.id}`}
                        className="hover:underline"
                      >
                        {q.quotation_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {q.customer_master ? (
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-white">{q.customer_master.company_name}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{q.customer_master.customer_code}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">Unknown Customer</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {q.rfq_master ? (
                        <Link
                          to={`${ERP_BASE_PATH}/rfqs/${q.rfq_master.id}`}
                          className="inline-flex items-center gap-1 font-mono text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          <Link2 className="w-3 h-3" />
                          {q.rfq_master.rfq_number}
                        </Link>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">Direct Offer</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-mono">
                      {new Date(q.quotation_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-mono">
                      {q.valid_until
                        ? new Date(q.valid_until).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'No Expiry'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {q.currency} {Number(q.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/quotations/${q.id}`)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="View Quotation Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {['DRAFT', 'UNDER_REVIEW'].includes(q.status.toUpperCase()) && (
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/quotations/${q.id}/edit`)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors"
                          title="Edit Quotation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION BAR */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Page <span className="font-semibold text-slate-800 dark:text-white">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-800 dark:text-white">{totalPages}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
