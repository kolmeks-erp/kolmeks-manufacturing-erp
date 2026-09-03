import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  PieChart,
  CheckCircle,
  Clock,
  PlusCircle,
  Building2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { ERPLayout } from '../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { budgetingService } from '../../../services/budgeting.service';
import { BudgetTelemetry, Budget } from '../../../types/budgeting';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const BudgetDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState<BudgetTelemetry | null>(null);
  const [recentBudgets, setRecentBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [telemetryRes, budgetsRes] = await Promise.all([
        budgetingService.getBudgetSummaryKPIs(),
        budgetingService.getBudgets(),
      ]);

      if (telemetryRes.success) setTelemetry(telemetryRes.data);
      if (budgetsRes.success) setRecentBudgets(budgetsRes.data.slice(0, 5));
    } catch (err: any) {
      console.error('Failed to load budget dashboard data:', err);
      setError(err?.response?.data?.message || 'Failed to load budgeting analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading Budgeting & Cost Management dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <PieChart className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Budgeting & Cost Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Corporate financial planning, cost center utilization tracking, approval controls, and actual vs budget variance telemetry
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center px-3 py-2 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/cost-centers`)}
            className="inline-flex items-center px-3 py-2 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            Cost Centers
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/new`)}
            className="inline-flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Create New Budget
          </button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      {telemetry && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved Budget</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{formatCurrency(telemetry.totalApprovedBudget)}</div>
            <div className="mt-2 text-xs text-slate-500">
              {telemetry.statusCounts.approved + telemetry.statusCounts.locked} active approved budgets
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actual Spend (GL)</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600 font-mono tracking-tight">{formatCurrency(telemetry.totalActualSpend)}</div>
            <div className="mt-2 text-xs text-slate-500">From posted accounting journal entries</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Remaining Cushion</span>
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                <PieChart className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-teal-600 font-mono tracking-tight">{formatCurrency(telemetry.remainingBudget)}</div>
            <div className="mt-2 text-xs text-slate-500">Available unspent allocation balance</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Utilization</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{telemetry.overallUtilization.toFixed(1)}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${
                  telemetry.overallUtilization > 100
                    ? 'bg-rose-500'
                    : telemetry.overallUtilization > 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, telemetry.overallUtilization)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/list`)}
          className="bg-white border border-slate-200/80 hover:border-emerald-500 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Budget Register</h4>
              <p className="text-xs text-slate-500">View all draft & active budgets</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/approvals`)}
          className="bg-white border border-slate-200/80 hover:border-amber-500 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg group-hover:bg-amber-100 transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Budget Approvals</h4>
              <p className="text-xs text-amber-700 font-semibold">
                {telemetry?.statusCounts.submitted || 0} pending review
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => navigate(`${ERP_BASE_PATH}/finance/cost-centers`)}
          className="bg-white border border-slate-200/80 hover:border-indigo-500 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Cost Centers</h4>
              <p className="text-xs text-slate-500">Departmental cost tracking</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => {
            if (recentBudgets.length > 0) {
              navigate(`${ERP_BASE_PATH}/finance/budgets/${recentBudgets[0].id}/variance`);
            } else {
              navigate(`${ERP_BASE_PATH}/finance/budgets/list`);
            }
          }}
          className="bg-white border border-slate-200/80 hover:border-teal-500 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-50 text-teal-600 border border-teal-100 rounded-lg group-hover:bg-teal-100 transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Budget vs Actual</h4>
              <p className="text-xs text-slate-500">Real-time variance analysis</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Recent Budgets Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Financial Budgets</h3>
            <p className="text-xs text-slate-500">Overview of latest planned budget versions</p>
          </div>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/list`)}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-all flex items-center gap-1 cursor-pointer"
          >
            View All Budgets <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentBudgets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No budgets found. Click "Create New Budget" above to start financial planning.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Budget Code</th>
                  <th className="py-3.5 px-4">Budget Name</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4 text-right">Total Budget</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBudgets.map((budget) => {
                  const statusColors: Record<string, string> = {
                    DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
                    SUBMITTED: 'bg-amber-50 text-amber-700 border-amber-200/80',
                    UNDER_REVIEW: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
                    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
                    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80',
                    LOCKED: 'bg-slate-200 text-slate-800 border-slate-300',
                    ARCHIVED: 'bg-slate-100 text-slate-400 border-slate-200',
                  };

                  return (
                    <tr key={budget.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">{budget.budget_code}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{budget.budget_name}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{budget.period?.period_name || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-500">v{budget.version}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(budget.total_budget_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            statusColors[budget.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {budget.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${budget.id}`)}
                          className="text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${budget.id}/variance`)}
                          className="text-xs text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer"
                        >
                          Variance
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
