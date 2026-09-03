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
                className="inline-flex items-center px-3.5 py-2 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Refresh
              </button>
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/my`)}
                className="inline-flex items-center px-3.5 py-2 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                My Claims
              </button>
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/new`)}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                Submit New Claim
              </button>
            </div>
          }
        />

        {/* Telemetry Metric KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Approved Claims</span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(kpis.total_approved_amount)}</div>
              <div className="mt-2 text-xs font-medium text-slate-500">
                {kpis.approved_count} claims approved to date
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Review</span>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-700 tracking-tight">{kpis.pending_review_count}</div>
              <div className="mt-2 text-xs font-medium text-slate-500">Claims awaiting manager or finance approval</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Total Reimbursed</span>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-700 tracking-tight">{formatCurrency(kpis.total_reimbursed_amount)}</div>
              <div className="mt-2 text-xs font-medium text-slate-500">Successfully paid out to employees</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Outstanding Reimbursement</span>
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-700 tracking-tight">{formatCurrency(kpis.total_outstanding_amount)}</div>
              <div className="mt-2 text-xs font-medium text-slate-500">Approved claims pending remittance</div>
            </div>
          </div>
        )}

        {/* Navigation Quick Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims`)}
            className="bg-white border border-slate-200 hover:border-emerald-500 p-4 rounded-2xl cursor-pointer transition shadow-xs flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Expense Claims</h4>
                <p className="text-[11px] text-slate-500 font-medium">Master register</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/reimbursements`)}
            className="bg-white border border-slate-200 hover:border-purple-500 p-4 rounded-2xl cursor-pointer transition shadow-xs flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Reimbursements</h4>
                <p className="text-[11px] text-slate-500 font-medium">Payment settlements</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/categories`)}
            className="bg-white border border-slate-200 hover:border-blue-500 p-4 rounded-2xl cursor-pointer transition shadow-xs flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Categories</h4>
                <p className="text-[11px] text-slate-500 font-medium">GL Account mappings</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/reports`)}
            className="bg-white border border-slate-200 hover:border-indigo-500 p-4 rounded-2xl cursor-pointer transition shadow-xs flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Analytics</h4>
                <p className="text-[11px] text-slate-500 font-medium">Expense breakdown</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/my`)}
            className="bg-white border border-slate-200 hover:border-teal-500 p-4 rounded-2xl cursor-pointer transition shadow-xs flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-100 transition">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">My Portal</h4>
                <p className="text-[11px] text-slate-500 font-medium">Personal claims</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
          </div>
        </div>

        {/* Recent Expense Claims Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Expense Claims</h3>
              <p className="text-xs text-slate-500 font-medium">Latest employee claims submitted across departments</p>
            </div>
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims`)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition flex items-center cursor-pointer"
            >
              View Register <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {recentClaims.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-medium">
              No expense claims registered yet. Click "Submit New Claim" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Claim #</th>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Cost Center</th>
                    <th className="py-3.5 px-4 text-right">Total Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">{claim.claim_number}</td>
                      <td className="py-3.5 px-4 text-slate-900 font-semibold">
                        {claim.employee ? `${claim.employee.first_name} ${claim.employee.last_name}` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">{claim.claim_date}</td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">{claim.description}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{claim.cost_center?.name || 'General'}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(claim.total_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(claim.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/${claim.id}`)}
                          className="text-xs text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1 rounded-lg transition-all font-semibold cursor-pointer"
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
