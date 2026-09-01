import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '../../../services/payroll.service';
import { PayrollRun, PayrollPeriod } from '../../../types/payroll';
import { Link } from 'react-router-dom';
import { PlayCircle, Plus, CheckCircle, FileText, ArrowRight, RefreshCw, Landmark } from 'lucide-react';

export const PayrollRunsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');

  const { data: runs, isLoading } = useQuery({
    queryKey: ['payrollRuns'],
    queryFn: payrollService.getRuns,
  });

  const { data: periods } = useQuery({
    queryKey: ['payrollPeriods'],
    queryFn: payrollService.getPeriods,
  });

  const openPeriods = (periods || []).filter(p => ['OPEN', 'DRAFT', 'PROCESSING'].includes(p.status));

  const createRunMutation = useMutation({
    mutationFn: (periodId: string) => payrollService.createRun(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      setIsModalOpen(false);
    },
  });

  const handleCreateRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriodId) return;
    createRunMutation.mutate(selectedPeriodId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PlayCircle className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Payroll Runs & Calculation Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Initiate, calculate, approve, and post salary disbursements to the General Ledger.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm gap-2"
        >
          <Plus className="w-4 h-4" /> Start New Payroll Run
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4">Run #</th>
                <th className="p-4">Period</th>
                <th className="p-4">Run Date</th>
                <th className="p-4">Headcount</th>
                <th className="p-4">Gross Payroll</th>
                <th className="p-4">Deductions</th>
                <th className="p-4">Net Payable</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Loading payroll runs...
                  </td>
                </tr>
              ) : !runs || runs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No payroll runs recorded yet.
                  </td>
                </tr>
              ) : (
                runs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      {r.run_number}
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {r.payroll_period?.name || r.payroll_period_id}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{r.run_date}</td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{r.total_employees} staff</td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      ₹{r.gross_payroll ? r.gross_payroll.toLocaleString('en-IN') : '0.00'}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      ₹{r.total_deductions ? r.total_deductions.toLocaleString('en-IN') : '0.00'}
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{r.net_payroll ? r.net_payroll.toLocaleString('en-IN') : '0.00'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          r.status === 'POSTED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : r.status === 'APPROVED'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/secure-kolmeks-x0y0/payroll/runs/${r.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-medium text-xs transition-colors gap-1"
                      >
                        View & Process <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-indigo-500" /> Start Payroll Run
            </h2>
            <form onSubmit={handleCreateRun} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Select Open Payroll Period
                </label>
                <select
                  value={selectedPeriodId}
                  onChange={(e) => setSelectedPeriodId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Period --</option>
                  {openPeriods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.start_date} to {p.end_date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRunMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  {createRunMutation.isPending ? 'Initializing...' : 'Initialize Run'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
