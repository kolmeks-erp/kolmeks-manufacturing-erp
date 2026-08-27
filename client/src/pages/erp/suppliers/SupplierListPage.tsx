import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, Eye, Edit, Power, Filter, X } from 'lucide-react';
import { Supplier, SupplierStatus, SupplierType } from '../../../types/supplier';
import { SupplierService } from '../../../services/supplier.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { ConfirmDialog } from '../../../components/erp/ConfirmDialog';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Filters & Search
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  // Sorting
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Confirm Status Dialog
  const [statusDialogTarget, setStatusDialogTarget] = useState<Supplier | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load suppliers
  const fetchSuppliers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await SupplierService.getSuppliers({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        supplier_type: typeFilter,
        country: countryFilter,
        industry: industryFilter,
        sortBy,
        sortOrder,
      });

      setSuppliers(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalItems(res.meta.total);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      setError(err?.response?.data?.error?.message || 'Unable to load suppliers. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page, debouncedSearch, statusFilter, typeFilter, countryFilter, industryFilter, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusDialogTarget) return;
    setIsUpdatingStatus(true);
    try {
      const nextStatus: SupplierStatus = statusDialogTarget.status === 'active' ? 'inactive' : 'active';
      await SupplierService.patchSupplierStatus(statusDialogTarget.id, nextStatus);
      setStatusDialogTarget(null);
      fetchSuppliers();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to update supplier status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCountryFilter('all');
    setIndustryFilter('all');
    setPage(1);
  };

  const hasActiveFilters =
    search !== '' ||
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    countryFilter !== 'all' ||
    industryFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Suppliers & Vendors"
        description="Manage supplier organizations, procurement contacts, supplier classifications, and vendor master statuses."
        badge="Procurement Module"
        actions={
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/new`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1E36] hover:bg-[#0F2C59] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        }
      />

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchSuppliers}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 font-bold rounded text-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Suppliers
            </label>
            <input
              type="text"
              placeholder="Search code, name, email, city, country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
              <option value="pending_approval">Pending Approval</option>
            </select>
          </div>

          {/* Supplier Type Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Supplier Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="RAW_MATERIAL">Raw Material</option>
              <option value="COMPONENT">Component</option>
              <option value="SERVICE">Service Provider</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="LOGISTICS">Logistics</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Industry
            </label>
            <select
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Industries</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Electrical & Electronics">Electrical & Electronics</option>
              <option value="CNC Tooling">CNC Tooling & Machining</option>
              <option value="Logistics">Logistics & Freight</option>
              <option value="Industrial Manufacturing">Industrial Manufacturing</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Filtered results: <strong className="text-slate-900">{totalItems}</strong> suppliers found
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* SUPPLIERS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Truck className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No suppliers found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No vendor records match your active search and filter options.'
                : 'Get started by adding your first supplier master record.'}
            </p>
            {!hasActiveFilters && (
              <button
                type="button"
                onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/new`)}
                className="px-4 py-2 bg-[#0B1E36] text-white text-xs font-bold rounded-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add First Supplier
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort('supplier_code')}
                  >
                    Supplier Code {sortBy === 'supplier_code' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort('company_name')}
                  >
                    Company Name {sortBy === 'company_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Industry</th>
                  <th
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort('country')}
                  >
                    Country {sortBy === 'country' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-5">Email / Phone</th>
                  <th
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-slate-800">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-blue-700">
                      {sup.supplier_code}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <div>{sup.company_name}</div>
                      {sup.legal_name && (
                        <div className="text-[10px] font-normal text-slate-500">{sup.legal_name}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-700">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 text-slate-700">
                        {sup.supplier_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">{sup.industry || '—'}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-900">{sup.country}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-600">
                      <div>{sup.email || '—'}</div>
                      <div className="text-[10px] text-slate-400">{sup.phone || ''}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={sup.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/${sup.id}`)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/${sup.id}/edit`)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                        title="Edit Supplier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusDialogTarget(sup)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          sup.status === 'active'
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                        title={sup.status === 'active' ? 'Deactivate Supplier' : 'Activate Supplier'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {!isLoading && suppliers.length > 0 && (
          <div className="py-3 px-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Showing page <strong className="text-slate-900">{page}</strong> of{' '}
              <strong className="text-slate-900">{totalPages}</strong> ({totalItems} total suppliers)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold disabled:opacity-40 hover:bg-white transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold disabled:opacity-40 hover:bg-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRM STATUS TOGGLE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(statusDialogTarget)}
        title="Change Supplier Status?"
        message={`Are you sure you want to change the operational status for supplier "${statusDialogTarget?.company_name}" (${statusDialogTarget?.supplier_code}) from ${statusDialogTarget?.status} to ${statusDialogTarget?.status === 'active' ? 'inactive' : 'active'}?`}
        confirmText={statusDialogTarget?.status === 'active' ? 'Deactivate Supplier' : 'Activate Supplier'}
        onConfirm={handleConfirmToggleStatus}
        onClose={() => setStatusDialogTarget(null)}
      />
    </div>
  );
};
