import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Eye,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { RFQItem, RFQFilters } from '../../../types/rfq';
import { RFQService } from '../../../services/rfq.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const RFQListPage: React.FC = () => {
  const navigate = useNavigate();

  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters State
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reqTypeFilter, setReqTypeFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
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

  const fetchRFQs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: RFQFilters = {
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        requirement_type: reqTypeFilter,
        assigned_to: assignedFilter,
        sortBy,
        sortOrder,
      };

      const res = await RFQService.getRFQs(filters);
      if (res.success) {
        setRfqs(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages);
      } else {
        setError('Unable to load quote requests.');
      }
    } catch (err: any) {
      console.error('Error loading RFQs:', err);
      setError(err.response?.data?.message || 'Unable to connect to RFQ server.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, reqTypeFilter, assignedFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchRFQs();
  }, [fetchRFQs]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setReqTypeFilter('all');
    setAssignedFilter('all');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters =
    searchTerm !== '' || statusFilter !== 'all' || reqTypeFilter !== 'all' || assignedFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="RFQs Management"
        description="Review and manage customer manufacturing quotation requests."
      />

      {/* TOOLBAR & FILTERS */}
      <div className="bg-white dark:bg-[#0F2647] rounded-xl shadow-xs border border-slate-200 dark:border-slate-800/80 p-4 space-y-4 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* SEARCH BAR */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by RFQ #, company, contact name, email, project..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* QUICK REFRESH BUTTON */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              onClick={fetchRFQs}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* SELECT FILTERS ROW */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters:</span>
          </div>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Statuses</option>
            <option value="NEW">New (Unreviewed)</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="NEED_MORE_INFORMATION">Need Information</option>
            <option value="QUOTATION_PREPARATION">Quotation Prep</option>
            <option value="QUOTED">Quoted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* REQUIREMENT TYPE FILTER */}
          <select
            value={reqTypeFilter}
            onChange={(e) => {
              setReqTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Requirement Types</option>
            <option value="CNC Machining">CNC Machining</option>
            <option value="Motor Components">Motor Components</option>
            <option value="Assembly">Assembly</option>
            <option value="Contract Manufacturing">Contract Manufacturing</option>
            <option value="Custom Engineering">Custom Engineering</option>
          </select>

          {/* ASSIGNED FILTER */}
          <select
            value={assignedFilter}
            onChange={(e) => {
              setAssignedFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Assignments</option>
            <option value="unassigned">Unassigned Only</option>
          </select>

          {/* CLEAR FILTERS */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg font-medium transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* RFQ TABLE CONTAINER */}
      <div className="bg-white dark:bg-[#0F2647] rounded-xl shadow-xs border border-slate-200 dark:border-slate-800/80 overflow-hidden text-slate-900 dark:text-slate-100">
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400 dark:text-slate-500 mx-auto mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading RFQs directory...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">Unable to load RFQs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{error}</p>
            <button
              onClick={fetchRFQs}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : rfqs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">No RFQs found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              {hasActiveFilters
                ? 'No manufacturing quote requests match your selected search or filter criteria.'
                : 'No customer quotation requests have been submitted yet.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Company & Contact</th>
                  <th className="py-3 px-4">Requirement</th>
                  <th className="py-3 px-4">Project & Qty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {rfqs.map((rfq) => (
                  <tr
                    key={rfq.id}
                    onClick={() => navigate(`${ERP_BASE_PATH}/rfqs/${rfq.id}`)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    {/* REQUEST NUMBER */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {rfq.rfq_number}
                    </td>

                    {/* COMPANY & CONTACT */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-white">{rfq.company}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>{rfq.full_name}</span>
                        <span>•</span>
                        <span className="text-slate-400 dark:text-slate-500 truncate max-w-[140px]">{rfq.email}</span>
                      </div>
                    </td>

                    {/* REQUIREMENT TYPE */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium text-[11px]">
                        <Layers className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        {rfq.requirement_type}
                      </span>
                    </td>

                    {/* PROJECT NAME & QTY */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                        {rfq.component_name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {rfq.quantity.toLocaleString()} {rfq.unit || 'Pcs'}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rfq.status} />
                    </td>

                    {/* ASSIGNED TO */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {rfq.assigned_user ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">{rfq.assigned_user.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                      )}
                    </td>

                    {/* SUBMITTED DATE */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                      {new Date(rfq.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/rfqs/${rfq.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {!isLoading && !error && total > 0 && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-900 dark:text-white">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{total}</span> quote requests
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
