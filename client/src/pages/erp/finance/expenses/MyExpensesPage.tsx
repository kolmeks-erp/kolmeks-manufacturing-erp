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
                Submit New Expense
              </button>
            </div>
          }
        />

        {/* Summary Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Claims Submitted</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(totalClaimed)}</div>
            <div className="mt-1 text-xs font-medium text-slate-500">{claims.length} total requests</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Review</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-700 tracking-tight">{pendingCount}</div>
            <div className="mt-1 text-xs font-medium text-slate-500">Under manager / finance review</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Approved Amount</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-700 tracking-tight">{formatCurrency(totalApproved)}</div>
            <div className="mt-1 text-xs font-medium text-slate-500">Total verified claims</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Total Reimbursed</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-700 tracking-tight">{formatCurrency(totalReimbursed)}</div>
            <div className="mt-1 text-xs font-medium text-slate-500">Settled to your bank account</div>
          </div>
        </div>

        {/* Claims Table */}
        {loading ? (
          <LoadingState message="Loading your expense claims..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchMyClaims} />
        ) : claims.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 shadow-xs">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No Personal Expense Claims</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">You have not submitted any expense claims yet.</p>
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/new`)}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Submit Your First Claim
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-xs tracking-tight bg-slate-50/50">
              My Personal Expense Claims Register
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Claim #</th>
                    <th className="py-3.5 px-5">Claim Date</th>
                    <th className="py-3.5 px-5">Description</th>
                    <th className="py-3.5 px-5 text-right">Claim Amount</th>
                    <th className="py-3.5 px-5 text-right">Reimbursed</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-emerald-700 font-bold">{claim.claim_number}</td>
                      <td className="py-3.5 px-5 text-slate-500 font-medium">{claim.claim_date}</td>
                      <td className="py-3.5 px-5 text-slate-900 font-semibold max-w-xs truncate">{claim.description}</td>
                      <td className="py-3.5 px-5 text-right font-bold text-slate-900">
                        {formatCurrency(claim.total_amount)}
                      </td>
                      <td className="py-3.5 px-5 text-right font-bold text-purple-700">
                        {formatCurrency(claim.reimbursed_amount)}
                      </td>
                      <td className="py-3.5 px-5 text-center">{getStatusBadge(claim.status)}</td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        {['DRAFT', 'RETURNED'].includes(claim.status) && (
                          <button
                            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/${claim.id}/edit`)}
                            className="inline-flex items-center text-xs text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/${claim.id}`)}
                          className="inline-flex items-center text-xs text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1 rounded-lg transition-all font-semibold cursor-pointer"
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
