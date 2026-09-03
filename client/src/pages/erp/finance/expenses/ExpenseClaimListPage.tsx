import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../../components/erp/LoadingState';
import { ErrorState } from '../../../../components/erp/ErrorState';
import { expenseService, ExpenseClaim } from '../../../../services/expense.service';
import { ERP_BASE_PATH } from '../../../../constants/navigation';

export const ExpenseClaimListPage: React.FC = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseService.getClaims({
        status: selectedStatus,
        search: searchQuery,
      });
      setClaims(data);
    } catch (err: any) {
      console.error('Failed to load claims:', err);
      setError(err?.response?.data?.message || 'Failed to fetch expense claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClaims();
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-700 border-slate-200/80',
      SUBMITTED: 'bg-amber-50 text-amber-800 border-amber-200/80',
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80',
      RETURNED: 'bg-orange-50 text-orange-800 border-orange-200/80',
      PARTIALLY_REIMBURSED: 'bg-blue-50 text-blue-700 border-blue-200/80',
      REIMBURSED: 'bg-purple-50 text-purple-700 border-purple-200/80',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colors[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const statusTabs = [
    { label: 'All Claims', value: 'ALL' },
    { label: 'Pending Approval', value: 'SUBMITTED' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Reimbursed', value: 'REIMBURSED' },
    { label: 'Drafts', value: 'DRAFT' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  return (
    <ERPLayout activeTab="finance">
      <div className="space-y-6">
        <ERPPageHeader
          title="Expense Claims Register"
          subtitle="Master register of employee expense claim submissions, pending reviews, accounting postings, and status history."
          actions={
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchClaims}
                className="inline-flex items-center px-3.5 py-2 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Refresh
              </button>
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/new`)}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                New Expense Claim
              </button>
            </div>
          }
        />

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === tab.value
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Action Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by claim number, employee, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </form>
          <div className="flex items-center space-x-3 text-xs font-semibold text-slate-500">
            <span>Showing {claims.length} claims</span>
          </div>
        </div>

        {/* Claims Table */}
        {loading ? (
          <LoadingState message="Loading expense claims..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchClaims} />
        ) : claims.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 shadow-xs">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No Expense Claims Found</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">No records match your selected status tab or search filter.</p>
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/new`)}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Create First Claim
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Claim #</th>
                    <th className="py-3.5 px-5">Employee</th>
                    <th className="py-3.5 px-5">Claim Date</th>
                    <th className="py-3.5 px-5">Description</th>
                    <th className="py-3.5 px-5">Cost Center</th>
                    <th className="py-3.5 px-5 text-right">Total Amount</th>
                    <th className="py-3.5 px-5 text-right">Approved Amt</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-emerald-700 font-bold">{claim.claim_number}</td>
                      <td className="py-3.5 px-5 text-slate-900 font-semibold">
                        {claim.employee ? `${claim.employee.first_name} ${claim.employee.last_name}` : 'N/A'}
                        {claim.employee?.department && (
                          <div className="text-[11px] text-slate-500 font-medium">{claim.employee.department}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 font-medium">{claim.claim_date}</td>
                      <td className="py-3.5 px-5 text-slate-700 font-medium max-w-xs truncate">{claim.description}</td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">{claim.cost_center?.name || 'General'}</td>
                      <td className="py-3.5 px-5 text-right font-bold text-slate-900">
                        {formatCurrency(claim.total_amount)}
                      </td>
                      <td className="py-3.5 px-5 text-right font-bold text-emerald-700">
                        {claim.approved_amount > 0 ? formatCurrency(claim.approved_amount) : '-'}
                      </td>
                      <td className="py-3.5 px-5 text-center">{getStatusBadge(claim.status)}</td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/${claim.id}`)}
                          className="inline-flex items-center text-xs text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1 rounded-lg transition-all font-semibold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ERPLayout>
  );
};

export default ExpenseClaimListPage;
