import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Power,
  Building2,
  Globe,
  Mail,
  Phone,
  Filter,
  XCircle,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { Customer, CustomerStatus } from '../../../types/customer';
import { CustomerService } from '../../../services/customer.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { EmptyState } from '../../../components/erp/EmptyState';
import { ConfirmDialog } from '../../../components/erp/ConfirmDialog';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  // Status Change Dialog State
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [targetCustomer, setTargetCustomer] = useState<Customer | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await CustomerService.getCustomers({
        page: currentPage,
        limit: 10,
        search: debouncedSearch,
        status: selectedStatus,
        industry: selectedIndustry,
        country: selectedCountry,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      setCustomers(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalCount(response.meta.total);
    } catch (err: any) {
      console.error('Failed to load customer list:', err);
      setError(err?.response?.data?.error?.message || 'Unable to load customers list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedStatus, selectedIndustry, selectedCountry]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Status Change Action
  const handleOpenStatusModal = (customer: Customer) => {
    setTargetCustomer(customer);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!targetCustomer) return;
    try {
      const nextStatus: CustomerStatus = targetCustomer.status === 'active' ? 'inactive' : 'active';
      await CustomerService.patchCustomerStatus(targetCustomer.id, nextStatus);
      setStatusDialogOpen(false);
      setTargetCustomer(null);
      loadCustomers();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to update customer status.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedIndustry('all');
    setSelectedCountry('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Customers"
        description="Manage customer organizations and their business contacts."
        badge="Sales Module"
        actions={
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/customers/new`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1E36] hover:bg-[#0F2C59] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        }
      />

      {/* FILTER TOOLBAR */}
      <div className="bg-white dark:bg-[#0F2647] p-4 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by code, company name, legal name, email, phone, city, country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* DROPDOWN FILTERS */}
          <div className="flex flex-wrap items-center gap-2">
            {/* STATUS FILTER */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* INDUSTRY FILTER */}
            <select
              value={selectedIndustry}
              onChange={(e) => {
                setSelectedIndustry(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Industries</option>
              <option value="Automotive">Automotive</option>
              <option value="Industrial Manufacturing">Industrial Manufacturing</option>
              <option value="Electrical">Electrical & Motor</option>
              <option value="Engineering">Engineering & Machinery</option>
              <option value="Aerospace">Aerospace & Marine</option>
              <option value="Other">Other</option>
            </select>

            {/* CLEAR FILTERS */}
            {(searchTerm || selectedStatus !== 'all' || selectedIndustry !== 'all' || selectedCountry !== 'all') && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}

            {/* REFRESH BUTTON */}
            <button
              type="button"
              onClick={loadCustomers}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors flex items-center justify-center shrink-0"
              title="Refresh List"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadCustomers}
            className="px-3 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 font-bold rounded-lg text-xs"
          >
            Try Again
          </button>
        </div>
      )}

      {/* MAIN DATA TABLE / CARDS */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#0F2647] p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-3" />
          Loading customer records...
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description={
            searchTerm || selectedStatus !== 'all'
              ? 'No matching customer records found for your search filters.'
              : 'Get started by creating your first client master record.'
          }
          icon={<Users className="w-8 h-8 text-slate-400" />}
          actionText="Add Customer"
          onAction={() => navigate(`${ERP_BASE_PATH}/customers/new`)}
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0F2647] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#0B1E36] text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-5">Customer Code</th>
                    <th className="py-3.5 px-5">Company & Industry</th>
                    <th className="py-3.5 px-5">Contact Details</th>
                    <th className="py-3.5 px-5">Country</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Created Date</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans text-slate-800 dark:text-slate-200">
                  {customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/80 dark:hover:bg-[#163761]/50 transition-colors">
                      {/* CODE */}
                      <td className="py-3.5 px-5 font-mono font-bold text-blue-700 dark:text-blue-400">
                        <span className="bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded border border-blue-100 dark:border-blue-800">
                          {cust.customer_code}
                        </span>
                      </td>

                      {/* COMPANY & INDUSTRY */}
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 dark:text-white block">{cust.company_name}</span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>{cust.industry || 'Unspecified'}</span>
                          {cust.legal_name && <span className="text-slate-400 dark:text-slate-500">({cust.legal_name})</span>}
                        </div>
                      </td>

                      {/* CONTACT DETAILS */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5 text-[11px]">
                          {cust.email && (
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                              <span className="truncate max-w-[180px]">{cust.email}</span>
                            </div>
                          )}
                          {cust.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                              <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                              <span>{cust.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* COUNTRY */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{cust.country || 'Finland'}</span>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-5">
                        <StatusBadge status={cust.status} />
                      </td>

                      {/* CREATED DATE */}
                      <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {cust.created_at
                          ? new Date(cust.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-5 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => navigate(`${ERP_BASE_PATH}/customers/${cust.id}`)}
                          className="inline-flex items-center gap-1 p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`${ERP_BASE_PATH}/customers/${cust.id}/edit`)}
                          className="inline-flex items-center gap-1 p-1.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-lg transition-colors"
                          title="Edit Customer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(cust)}
                          className={`inline-flex items-center gap-1 p-1.5 rounded-lg transition-colors ${
                            cust.status === 'active'
                              ? 'bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                          }`}
                          title={cust.status === 'active' ? 'Deactivate Customer' : 'Activate Customer'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION BAR */}
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#0B1E36] border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div>
                Showing <span className="font-bold text-slate-900 dark:text-white">{customers.length}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> customer records
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="font-mono font-medium px-2">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG FOR STATUS CHANGE */}
      {statusDialogOpen && targetCustomer && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setStatusDialogOpen(false)}
          onConfirm={handleConfirmStatusChange}
          title={`${targetCustomer.status === 'active' ? 'Deactivate' : 'Activate'} Customer Record`}
          message={`Are you sure you want to ${
            targetCustomer.status === 'active' ? 'deactivate' : 'activate'
          } customer "${targetCustomer.company_name}" (${targetCustomer.customer_code})? Existing historical RFQs and quotes will remain intact.`}
          confirmText={targetCustomer.status === 'active' ? 'Deactivate Customer' : 'Activate Customer'}
          isDangerous={targetCustomer.status === 'active'}
        />
      )}
    </div>
  );
};
