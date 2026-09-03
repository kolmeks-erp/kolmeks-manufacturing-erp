import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, RefreshCw, AlertTriangle, CheckCircle, PieChart, IndianRupee } from 'lucide-react';
import { ERPLayout } from '../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { budgetingService } from '../../../services/budgeting.service';
import { BudgetVarianceReport } from '../../../types/budgeting';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const BudgetVariancePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<BudgetVarianceReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVarianceReport = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await budgetingService.getBudgetVariance(id);
      if (res.success) setReport(res.data);
    } catch (err: any) {
      console.error('Error fetching budget variance report:', err);
      setError(err?.response?.data?.message || 'Failed to calculate budget vs actual variance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVarianceReport();
  }, [id]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return <LoadingState message="Calculating Budget vs Actual accounting variance..." />;
  }

  if (error || !report) {
    return <ErrorState message={error || 'Variance report unavailable.'} onRetry={fetchVarianceReport} />;
  }

  const { budget, summary, lines } = report;

  return (
    <div className="space-y-5">
      {/* Back Button & Header Banner */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${budget.id}`)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Budget Detail
        </button>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg border border-teal-100">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Budget vs Actual Variance — <span className="font-mono text-emerald-600">{budget.budget_code}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {budget.budget_name} | Period: {budget.period?.period_name || 'N/A'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchVarianceReport}
          className="inline-flex items-center px-3.5 py-2 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Recalculate GL Actuals
        </button>
      </div>

      {/* Variance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">Approved Budget</div>
          <div className="text-2xl font-bold font-mono text-slate-900">{formatCurrency(summary.total_budget)}</div>
          <div className="text-xs text-slate-500 mt-1">Target expenditure baseline</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">Actual Spend (GL)</div>
          <div className="text-2xl font-bold font-mono text-amber-600">{formatCurrency(summary.total_actual)}</div>
          <div className="text-xs text-slate-500 mt-1">From posted accounting journal entries</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">Net Variance</div>
          <div
            className={`text-2xl font-bold font-mono ${
              summary.total_variance >= 0 ? 'text-teal-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(summary.total_variance)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {summary.total_variance >= 0 ? 'Favorable underspend' : 'Unfavorable overspend'}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">Utilization Rate</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{summary.total_utilization_percent.toFixed(1)}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${
                summary.total_utilization_percent > 100
                  ? 'bg-rose-500'
                  : summary.total_utilization_percent > 85
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, summary.total_utilization_percent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Variance Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Account-Wise Variance Telemetry</h3>
            <p className="text-xs text-slate-500">Comparing target allocations against posted General Ledger actuals</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Account Code</th>
                <th className="py-3.5 px-4">GL Account Name</th>
                <th className="py-3.5 px-4">Cost Center</th>
                <th className="py-3.5 px-4 text-right">Budget</th>
                <th className="py-3.5 px-4 text-right">Actual (GL)</th>
                <th className="py-3.5 px-4 text-right">Variance</th>
                <th className="py-3.5 px-4 text-right">Utilization</th>
                <th className="py-3.5 px-4 text-center">Status Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">{line.account_code}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {line.account_name}{' '}
                    <span className="text-[11px] text-slate-400 font-normal">({line.account_type})</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {line.cost_center ? `${line.cost_center.code} - ${line.cost_center.name}` : 'General Overhead'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-bold">{formatCurrency(line.budget_amount)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-700 font-semibold">{formatCurrency(line.actual_amount)}</td>
                  <td
                    className={`py-3.5 px-4 text-right font-mono font-bold ${
                      line.variance_amount >= 0 ? 'text-teal-700' : 'text-rose-700'
                    }`}
                  >
                    {formatCurrency(line.variance_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    {typeof line.utilization_percent === 'number' ? `${line.utilization_percent.toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        line.is_favorable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                          : 'bg-rose-50 text-rose-700 border-rose-200/80'
                      }`}
                    >
                      {line.status_label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200/80 bg-slate-50/80 font-bold text-slate-900">
              <tr>
                <td colSpan={3} className="py-3.5 px-4 uppercase text-[11px] text-slate-500">
                  Grand Total
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-700">{formatCurrency(summary.total_budget)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-700">{formatCurrency(summary.total_actual)}</td>
                <td
                  className={`py-3.5 px-4 text-right font-mono ${
                    summary.total_variance >= 0 ? 'text-teal-700' : 'text-rose-700'
                  }`}
                >
                  {formatCurrency(summary.total_variance)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                  {summary.total_utilization_percent.toFixed(1)}%
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
