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
      const [budgetsRes, periodsData] = await Promise.all([
        budgetingService.getBudgets({
          status: selectedStatus || undefined,
          period_id: selectedPeriod || undefined,
          search: search || undefined,
        }),
        financeService.getFinancialPeriods(),
      ]);

      if (budgetsRes.success) setBudgets(budgetsRes.data);
      const pList = Array.isArray(periodsData) ? periodsData : (periodsData as any)?.data || [];
      setPeriods(pList);
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
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Budgets Master Register
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comprehensive management of organizational operating budgets, multi-version forecasts, and approval statuses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBudgets}
            className="inline-flex items-center px-3 py-2 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
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

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Budget Code or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
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
              <tbody className="divide-y divide-slate-100">
                {budgets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No budgets match the selected filters.
                    </td>
                  </tr>
                ) : (
                  budgets.map((b) => {
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
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">{b.budget_code}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{b.budget_name}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">{b.period?.period_name || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-500">v{b.version}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">
                          {b.owner ? `${b.owner.first_name} ${b.owner.last_name}` : 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(b.total_budget_amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              statusColors[b.status] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${b.id}`)}
                            className="inline-flex items-center text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </button>
                          <button
                            onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${b.id}/variance`)}
                            className="inline-flex items-center text-xs text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer"
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
  );
};
