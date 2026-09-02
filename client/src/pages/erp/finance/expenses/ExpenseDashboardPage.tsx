import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  IndianRupee,
  Clock,
  CheckCircle,
  PlusCircle,
  FolderTree,
  CreditCard,
  BarChart2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../../components/erp/LoadingState';
import { ErrorState } from '../../../../components/erp/ErrorState';
import { expenseService, ExpenseDashboardKPIs, ExpenseClaim } from '../../../../services/expense.service';
import { ERP_BASE_PATH } from '../../../../constants/navigation';

export const ExpenseDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<ExpenseDashboardKPIs | null>(null);
  const [recentClaims, setRecentClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpiData, claimsData] = await Promise.all([
        expenseService.getDashboardKPIs(),
        expenseService.getClaims(),
      ]);

      setKpis(kpiData);
      setRecentClaims(claimsData.slice(0, 6));
    } catch (err: any) {
      console.error('Failed to load expense dashboard data:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load expense management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <ERPLayout activeTab="finance">
        <LoadingState message="Loading Expense Management & Reimbursement dashboard..." />
      </ERPLayout>
    );
  }

  if (error) {
    return (
      <ERPLayout activeTab="finance">
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </ERPLayout>
    );
  }

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

  return (
    <ERPLayout activeTab="finance">
      <div className="space-y-6">
        <ERPPageHeader
          title="Expense Management & Reimbursements"
          subtitle="Employee expense claims submission, multi-tier approvals, receipt verification, accounting postings, and payment settlement."
          actions={
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center px-3 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/my`)}
                className="inline-flex items-center px-3 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                My Claims
              </button>
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/new`)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 shadow-md transition"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Submit New Claim
              </button>
            </div>
          }
        />

        {/* Telemetry Metric KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Total Approved Claims</span>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100">{formatCurrency(kpis.total_approved_amount)}</div>
              <div className="mt-2 text-xs text-slate-400">
                {kpis.approved_count} claims approved to date
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Review</span>
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-300">{kpis.pending_review_count}</div>
              <div className="mt-2 text-xs text-slate-400">Claims awaiting manager or finance approval</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Total Reimbursed</span>
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-300">{formatCurrency(kpis.total_reimbursed_amount)}</div>
              <div className="mt-2 text-xs text-slate-400">Successfully paid out to employees</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Outstanding Reimbursement</span>
                <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-300">{formatCurrency(kpis.total_outstanding_amount)}</div>
              <div className="mt-2 text-xs text-slate-400">Approved claims pending cash/bank remittance</div>
            </div>
          </div>
        )}

        {/* Navigation Quick Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims`)}
            className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Expense Claims</h4>
                <p className="text-xs text-slate-400">Master register</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/reimbursements`)}
            className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 p-4 rounded-xl cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-500/20 transition">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Reimbursements</h4>
                <p className="text-xs text-slate-400">Payment settlements</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/categories`)}
            className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 p-4 rounded-xl cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500/20 transition">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Categories</h4>
                <p className="text-xs text-slate-400">GL Account mappings</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/reports`)}
            className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500/20 transition">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Analytics</h4>
                <p className="text-xs text-slate-400">Expense breakdown</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/my`)}
            className="bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 p-4 rounded-xl cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg group-hover:bg-teal-500/20 transition">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">My Portal</h4>
                <p className="text-xs text-slate-400">Personal claims</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition" />
          </div>
        </div>

        {/* Recent Expense Claims Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-slate-100">Recent Expense Claims</h3>
              <p className="text-xs text-slate-400">Latest employee claims submitted across departments</p>
            </div>
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims`)}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center"
            >
              View Register <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {recentClaims.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No expense claims registered yet. Click "Submit New Claim" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Claim #</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Cost Center</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-emerald-400 font-medium">{claim.claim_number}</td>
                      <td className="py-3 px-4 text-slate-200">
                        {claim.employee ? `${claim.employee.first_name} ${claim.employee.last_name}` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{claim.claim_date}</td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{claim.description}</td>
                      <td className="py-3 px-4 text-slate-400">{claim.cost_center?.name || 'General'}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-100">
                        {formatCurrency(claim.total_amount)}
                      </td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(claim.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/${claim.id}`)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1 rounded transition font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ERPLayout>
  );
};

export default ExpenseDashboardPage;
