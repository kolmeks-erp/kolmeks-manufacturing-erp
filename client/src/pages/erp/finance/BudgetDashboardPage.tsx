import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
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
    return (
      <ERPLayout activeTab="finance">
        <LoadingState message="Loading Budgeting & Cost Management dashboard..." />
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

  return (
    <ERPLayout activeTab="finance">
      <div className="space-y-6">
        <ERPPageHeader
          title="Budgeting & Cost Management"
          subtitle="Corporate financial planning, cost center utilization tracking, approval controls, and actual vs budget variance telemetry."
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
                onClick={() => navigate(`${ERP_BASE_PATH}/finance/cost-centers`)}
                className="inline-flex items-center px-3 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Cost Centers
              </button>
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/new`)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 shadow-md transition"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create New Budget
              </button>
            </div>
          }
        />

        {/* Telemetry Metric Cards */}
        {telemetry && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Approved Budget</span>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100">{formatCurrency(telemetry.totalApprovedBudget)}</div>
              <div className="mt-2 text-xs text-slate-400">
                {telemetry.statusCounts.approved + telemetry.statusCounts.locked} active approved budgets
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Actual Spend (GL)</span>
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-300">{formatCurrency(telemetry.totalActualSpend)}</div>
              <div className="mt-2 text-xs text-slate-400">From posted accounting journal entries</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Remaining Cushion</span>
                <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400">
                  <PieChart className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-teal-300">{formatCurrency(telemetry.remainingBudget)}</div>
              <div className="mt-2 text-xs text-slate-400">Available unspent allocation balance</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Overall Utilization</span>
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100">{telemetry.overallUtilization.toFixed(1)}%</div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
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
            className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20 transition">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Budget Register</h4>
                <p className="text-xs text-slate-400">View all draft & active budgets</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/approvals`)}
            className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500/20 transition">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Budget Approvals</h4>
                <p className="text-xs text-amber-400 font-medium">
                  {telemetry?.statusCounts.submitted || 0} pending review
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/cost-centers`)}
            className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500/20 transition">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Cost Centers</h4>
                <p className="text-xs text-slate-400">Departmental cost tracking</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
          </div>

          <div
            onClick={() => {
              if (recentBudgets.length > 0) {
                navigate(`${ERP_BASE_PATH}/finance/budgets/${recentBudgets[0].id}/variance`);
              } else {
                navigate(`${ERP_BASE_PATH}/finance/budgets/list`);
              }
            }}
            className="bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 p-4 rounded-xl cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg group-hover:bg-teal-500/20 transition">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Budget vs Actual</h4>
                <p className="text-xs text-slate-400">Real-time variance analysis</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition" />
          </div>
        </div>

        {/* Recent Budgets Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-slate-100">Recent Financial Budgets</h3>
              <p className="text-xs text-slate-400">Overview of latest planned budget versions</p>
            </div>
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/list`)}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center"
            >
              View All Budgets <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {recentBudgets.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No budgets found. Click "Create New Budget" above to start financial planning.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Budget Code</th>
                    <th className="py-3 px-4">Budget Name</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4 text-right">Total Budget</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentBudgets.map((budget) => {
                    const statusColors: Record<string, string> = {
                      DRAFT: 'bg-slate-800 text-slate-300 border-slate-700',
                      SUBMITTED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      UNDER_REVIEW: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
                      APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                      REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                      LOCKED: 'bg-slate-700 text-slate-200 border-slate-600',
                      ARCHIVED: 'bg-slate-800/50 text-slate-500 border-slate-800',
                    };

                    return (
                      <tr key={budget.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono text-emerald-400 font-medium">{budget.budget_code}</td>
                        <td className="py-3 px-4 font-medium text-slate-200">{budget.budget_name}</td>
                        <td className="py-3 px-4 text-slate-400">{budget.period?.period_name || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-400">v{budget.version}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-100">
                          {formatCurrency(budget.total_budget_amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              statusColors[budget.status] || 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {budget.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${budget.id}`)}
                            className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${budget.id}/variance`)}
                            className="text-xs text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1 rounded transition font-medium"
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
    </ERPLayout>
  );
};
