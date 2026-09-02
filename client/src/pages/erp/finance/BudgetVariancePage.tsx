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
    return (
      <ERPLayout activeTab="finance">
        <LoadingState message="Calculating Budget vs Actual accounting variance..." />
      </ERPLayout>
    );
  }

  if (error || !report) {
    return (
      <ERPLayout activeTab="finance">
        <ErrorState message={error || 'Variance report unavailable.'} onRetry={fetchVarianceReport} />
      </ERPLayout>
    );
  }

  const { budget, summary, lines } = report;

  return (
    <ERPLayout activeTab="finance">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${budget.id}`)}
            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Budget Detail
          </button>
        </div>

        <ERPPageHeader
          title={`Budget vs Actual Variance — ${budget.budget_code}`}
          subtitle={`${budget.budget_name} | Period: ${budget.period?.period_name || 'N/A'}`}
          actions={
            <button
              onClick={fetchVarianceReport}
              className="inline-flex items-center px-3.5 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Recalculate GL Actuals
            </button>
          }
        />

        {/* Variance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Approved Budget</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{formatCurrency(summary.total_budget)}</div>
            <div className="text-xs text-slate-400 mt-1">Target expenditure baseline</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Actual Spend (GL)</div>
            <div className="text-2xl font-bold font-mono text-amber-300">{formatCurrency(summary.total_actual)}</div>
            <div className="text-xs text-slate-400 mt-1">From posted accounting journal entries</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Net Variance</div>
            <div
              className={`text-2xl font-bold font-mono ${
                summary.total_variance >= 0 ? 'text-teal-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(summary.total_variance)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {summary.total_variance >= 0 ? 'Favorable underspend' : 'Unfavorable overspend'}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Utilization Rate</div>
            <div className="text-2xl font-bold text-slate-100">{summary.total_utilization_percent.toFixed(1)}%</div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-100">Account-Wise Variance Telemetry</h3>
              <p className="text-xs text-slate-400">Comparing target allocations against posted General Ledger actuals</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Account Code</th>
                  <th className="py-3 px-4">GL Account Name</th>
                  <th className="py-3 px-4">Cost Center</th>
                  <th className="py-3 px-4 text-right">Budget</th>
                  <th className="py-3 px-4 text-right">Actual (GL)</th>
                  <th className="py-3 px-4 text-right">Variance</th>
                  <th className="py-3 px-4 text-right">Utilization</th>
                  <th className="py-3 px-4 text-center">Status Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {lines.map((line) => (
                  <tr key={line.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-emerald-400 font-medium">{line.account_code}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {line.account_name}{' '}
                      <span className="text-xs text-slate-500 font-normal">({line.account_type})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {line.cost_center ? `${line.cost_center.code} - ${line.cost_center.name}` : 'General Overhead'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-100">{formatCurrency(line.budget_amount)}</td>
                    <td className="py-3 px-4 text-right font-mono text-amber-300">{formatCurrency(line.actual_amount)}</td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-semibold ${
                        line.variance_amount >= 0 ? 'text-teal-400' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(line.variance_amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {typeof line.utilization_percent === 'number' ? `${line.utilization_percent.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          line.is_favorable
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {line.status_label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-700 bg-slate-800/50 font-semibold text-slate-100">
                <tr>
                  <td colSpan={3} className="py-3.5 px-4 uppercase text-xs text-slate-400">
                    Grand Total
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400">{formatCurrency(summary.total_budget)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-300">{formatCurrency(summary.total_actual)}</td>
                  <td
                    className={`py-3.5 px-4 text-right font-mono ${
                      summary.total_variance >= 0 ? 'text-teal-400' : 'text-rose-400'
                    }`}
                  >
                    {formatCurrency(summary.total_variance)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                    {summary.total_utilization_percent.toFixed(1)}%
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </ERPLayout>
  );
};
