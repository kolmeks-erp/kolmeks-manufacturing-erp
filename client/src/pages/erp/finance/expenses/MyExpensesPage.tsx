import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  PlusCircle,
  RefreshCw,
  Clock,
  CheckCircle,
  CreditCard,
  Eye,
  Edit,
  FileText,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../../components/erp/LoadingState';
import { ErrorState } from '../../../../components/erp/ErrorState';
import { expenseService, ExpenseClaim } from '../../../../services/expense.service';
import { ERP_BASE_PATH } from '../../../../constants/navigation';

export const MyExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseService.getMyClaims();
      setClaims(data);
    } catch (err: any) {
      console.error('Failed to load my expense claims:', err);
      setError(err?.response?.data?.message || 'Failed to fetch your expense claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClaims();
  }, []);

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

  // Summary Metrics
  const totalClaimed = claims.reduce((sum, c) => sum + (c.total_amount || 0), 0);
  const totalApproved = claims.reduce((sum, c) => sum + (c.approved_amount || 0), 0);
  const totalReimbursed = claims.reduce((sum, c) => sum + (c.reimbursed_amount || 0), 0);
  const pendingCount = claims.filter((c) => ['SUBMITTED', 'MANAGER_REVIEW', 'FINANCE_REVIEW'].includes(c.status)).length;

  return (
    <ERPLayout activeTab="my-hr">
      <div className="space-y-6">
        <ERPPageHeader
          title="My Expense Claims Portal"
          subtitle="Submit, track, and manage your personal business expense claims, receipt uploads, and reimbursement status."
          actions={
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchMyClaims}
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
                Submit New Expense
              </button>
            </div>
          }
        />

        {/* Summary Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Claims Submitted</span>
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">{formatCurrency(totalClaimed)}</div>
            <div className="mt-1 text-xs text-slate-400">{claims.length} total requests</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">{pendingCount}</div>
            <div className="mt-1 text-xs text-slate-400">Under manager / finance review</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Approved Amount</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300">{formatCurrency(totalApproved)}</div>
            <div className="mt-1 text-xs text-slate-400">Total verified claims</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Total Reimbursed</span>
              <CreditCard className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-300">{formatCurrency(totalReimbursed)}</div>
            <div className="mt-1 text-xs text-slate-400">Settled to your bank account</div>
          </div>
        </div>

        {/* Claims Table */}
        {loading ? (
          <LoadingState message="Loading your expense claims..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchMyClaims} />
        ) : claims.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200 mb-1">No Personal Expense Claims</h3>
            <p className="text-xs text-slate-400 mb-4">You have not submitted any expense claims yet.</p>
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/new`)}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-500 transition"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Submit Your First Claim
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 font-semibold text-slate-200 text-sm">
              My Personal Expense Claims Register
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">Claim #</th>
                    <th className="py-3.5 px-4">Claim Date</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-right">Claim Amount</th>
                    <th className="py-3.5 px-4 text-right">Reimbursed</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-medium">{claim.claim_number}</td>
                      <td className="py-3.5 px-4 text-slate-400">{claim.claim_date}</td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{claim.description}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-100">
                        {formatCurrency(claim.total_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-purple-400">
                        {formatCurrency(claim.reimbursed_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(claim.status)}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {['DRAFT', 'RETURNED'].includes(claim.status) && (
                          <button
                            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/${claim.id}/edit`)}
                            className="inline-flex items-center text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded transition font-medium"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/${claim.id}`)}
                          className="inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1 rounded transition font-medium"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Details
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

export default MyExpensesPage;
