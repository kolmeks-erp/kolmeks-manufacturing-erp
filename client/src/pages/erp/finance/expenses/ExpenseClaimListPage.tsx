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
      DRAFT: 'bg-slate-800 text-slate-300 border-slate-700',
      SUBMITTED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      RETURNED: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      PARTIALLY_REIMBURSED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      REIMBURSED: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[status] || 'bg-slate-800 text-slate-400'}`}>
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
                className="inline-flex items-center px-3 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/new`)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 shadow-md transition"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Expense Claim
              </button>
            </div>
          }
        />

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedStatus === tab.value
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Action Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by claim number, employee, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </form>
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span>Showing {claims.length} claims</span>
          </div>
        </div>

        {/* Claims Table */}
        {loading ? (
          <LoadingState message="Loading expense claims..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchClaims} />
        ) : claims.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200 mb-1">No Expense Claims Found</h3>
            <p className="text-xs text-slate-400 mb-4">No records match your selected status tab or search filter.</p>
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/new`)}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-500 transition"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create First Claim
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">Claim #</th>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Claim Date</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Cost Center</th>
                    <th className="py-3.5 px-4 text-right">Total Amount</th>
                    <th className="py-3.5 px-4 text-right">Approved Amt</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-medium">{claim.claim_number}</td>
                      <td className="py-3.5 px-4 text-slate-200 font-medium">
                        {claim.employee ? `${claim.employee.first_name} ${claim.employee.last_name}` : 'N/A'}
                        {claim.employee?.department && (
                          <div className="text-xs text-slate-500 font-normal">{claim.employee.department}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{claim.claim_date}</td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{claim.description}</td>
                      <td className="py-3.5 px-4 text-slate-400">{claim.cost_center?.name || 'General'}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-100">
                        {formatCurrency(claim.total_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-400">
                        {claim.approved_amount > 0 ? formatCurrency(claim.approved_amount) : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(claim.status)}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/${claim.id}`)}
                          className="inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded transition font-medium"
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
