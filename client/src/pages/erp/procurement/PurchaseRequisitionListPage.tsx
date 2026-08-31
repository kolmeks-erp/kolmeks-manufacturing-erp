import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  ArrowUpDown,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  FileCheck,
} from 'lucide-react';
import { ProcurementService } from '../../../services/procurement.service';
import { PurchaseRequisition, PurchaseRequisitionFilters } from '../../../types/procurement';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const PurchaseRequisitionListPage: React.FC = () => {
  const navigate = useNavigate();

  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 10;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchRequisitions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: PurchaseRequisitionFilters = {
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        department: departmentFilter,
        priority: priorityFilter,
        sortBy,
        sortOrder,
      };

      const res = await ProcurementService.getRequisitions(filters);
      if (res.success) {
        setRequisitions(res.data || []);
        setTotalPages(res.meta.totalPages || 1);
        setTotalCount(res.meta.total || 0);
      } else {
        setError('Failed to retrieve purchase requisitions.');
      }
    } catch (err: any) {
      console.error('Error fetching requisitions:', err);
      setError(err.message || 'Error connecting to server to fetch purchase requisitions.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, departmentFilter, priorityFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchRequisitions();
  }, [fetchRequisitions]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setPriorityFilter('all');
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
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            {s === 'UNDER_REVIEW' ? 'UNDER REVIEW' : 'SUBMITTED'}
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            APPROVED
          </span>
        );
      case 'CONVERTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <FileCheck className="w-3.5 h-3.5" />
            CONVERTED TO PO
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            REJECTED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F2647] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl">
            <ClipboardList className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Purchase Requisitions</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage internal procurement requests for materials, components, equipment, and services.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchRequisitions()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/purchase-requisitions/new`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Requisition
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white dark:bg-[#0F2647] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* SEARCH */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search Requisition #, Reason, Department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* STATUS */}
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
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="CONVERTED">CONVERTED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* DEPARTMENT */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">All Departments</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Supply Chain">Supply Chain</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>

          {/* PRIORITY */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' || priorityFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Showing filtered results ({totalCount} requisitions found)
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
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Please check network or backend connection.</p>
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
                  onClick={() => handleSort('requisition_number')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Requisition #</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Requested By</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Reason / Purpose</th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => handleSort('required_date')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Required Date</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-900 dark:text-slate-200" />
                    Loading Purchase Requisitions...
                  </td>
                </tr>
              ) : requisitions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-3">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 w-fit mx-auto rounded-full text-slate-400 dark:text-slate-500">
                        <ClipboardList className="w-8 h-8" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Purchase Requisitions Found</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No requisitions match your filter criteria.'
                          : 'No purchase requisitions have been submitted yet.'}
                      </p>
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/purchase-requisitions/new`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create Requisition
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                requisitions.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-50/80 dark:hover:bg-[#163761]/50 transition-colors">
                    {/* REQUISITION NUMBER */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-blue-400">
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/purchase-requisitions/${pr.id}`)}
                        className="hover:underline text-slate-900 dark:text-blue-400"
                      >
                        {pr.requisition_number}
                      </button>
                    </td>

                    {/* REQUESTED BY */}
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{pr.requester_user?.full_name || 'Staff User'}</span>
                      </div>
                    </td>

                    {/* DEPARTMENT */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {pr.department || 'Manufacturing'}
                    </td>

                    {/* REASON */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {pr.reason}
                    </td>

                    {/* REQUIRED DATE */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {pr.required_date ? new Date(pr.required_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>

                    {/* ITEMS COUNT */}
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {pr.item_count || 0}
                    </td>

                    {/* PRIORITY */}
                    <td className="py-3.5 px-4 text-center">{renderPriorityBadge(pr.priority)}</td>

                    {/* STATUS */}
                    <td className="py-3.5 px-4 text-center">{renderStatusBadge(pr.status)}</td>

                    {/* ACTIONS */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/purchase-requisitions/${pr.id}`)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {['DRAFT', 'SUBMITTED'].includes(pr.status.toUpperCase()) && (
                          <button
                            onClick={() => navigate(`${ERP_BASE_PATH}/purchase-requisitions/${pr.id}/edit`)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                            title="Edit Requisition"
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

        {/* PAGINATION */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-[#0B1E36] border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({totalCount} requisitions)
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
