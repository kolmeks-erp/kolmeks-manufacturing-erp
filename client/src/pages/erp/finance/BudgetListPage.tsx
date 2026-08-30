import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Filter, RefreshCw, Eye, TrendingUp, Lock } from 'lucide-react';
import { ERPLayout } from '../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { budgetingService } from '../../../services/budgeting.service';
import { financeService } from '../../../services/finance.service';
import { Budget, BudgetStatus } from '../../../types/budgeting';
import { FinancialPeriod } from '../../../types/finance';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const BudgetListPage: React.FC = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [periods, setPeriods] = useState<FinancialPeriod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const [budgetsRes, periodsRes] = await Promise.all([
        budgetingService.getBudgets({
          status: selectedStatus || undefined,
          period_id: selectedPeriod || undefined,
          search: search || undefined,
        }),
        financeService.getFinancialPeriods(),
      ]);

      if (budgetsRes.success) setBudgets(budgetsRes.data);
      if (periodsRes.success) setPeriods(periodsRes.data);
    } catch (err: any) {
      console.error('Error fetching budgets list:', err);
      setError(err?.response?.data?.message || 'Failed to load budgets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedStatus, selectedPeriod]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBudgets();
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <ERPLayout activeTab="finance">
      <div className="space-y-6">
        <ERPPageHeader
          title="Budgets Master Register"
          subtitle="Comprehensive management of organizational operating budgets, multi-version forecasts, and approval statuses."
          actions={
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchBudgets}
                className="inline-flex items-center px-3 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
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

        {/* Search & Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Budget Code or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="LOCKED">LOCKED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Periods</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.period_name} ({p.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Budget Table */}
        {loading ? (
          <LoadingState message="Fetching budget records..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchBudgets} />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">Budget Code</th>
                    <th className="py-3.5 px-4">Budget Name</th>
                    <th className="py-3.5 px-4">Period</th>
                    <th className="py-3.5 px-4">Version</th>
                    <th className="py-3.5 px-4">Owner</th>
                    <th className="py-3.5 px-4 text-right">Total Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {budgets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No budgets match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    budgets.map((b) => {
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
                        <tr key={b.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-mono text-emerald-400 font-medium">{b.budget_code}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-200">{b.budget_name}</td>
                          <td className="py-3.5 px-4 text-slate-400">{b.period?.period_name || 'N/A'}</td>
                          <td className="py-3.5 px-4 text-slate-400">v{b.version}</td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {b.owner ? `${b.owner.first_name} ${b.owner.last_name}` : 'Unassigned'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-slate-100">
                            {formatCurrency(b.total_budget_amount)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                statusColors[b.status] || 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${b.id}`)}
                              className="inline-flex items-center text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </button>
                            <button
                              onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${b.id}/variance`)}
                              className="inline-flex items-center text-xs text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1 rounded transition font-medium"
                            >
                              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Variance
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ERPLayout>
  );
};
