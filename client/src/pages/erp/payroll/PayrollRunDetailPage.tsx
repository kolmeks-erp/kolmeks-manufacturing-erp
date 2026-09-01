import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '../../../services/payroll.service';
import {
  PlayCircle,
  RefreshCw,
  CheckCircle,
  Landmark,
  ArrowLeft,
  Users,
  DollarSign,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const PayrollRunDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actionMessage, setActionMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { data: runData, isLoading } = useQuery({
    queryKey: ['payrollRunDetail', id],
    queryFn: () => payrollService.getRunById(id!),
    enabled: !!id,
  });

  const calculateMutation = useMutation({
    mutationFn: () => payrollService.calculateRun(id!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payrollRunDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      setActionMessage(`Calculated payroll for ${data.entries?.length || 0} active employees.`);
      setErrorMessage('');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to calculate payroll.');
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => payrollService.approveRun(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollRunDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      setActionMessage('Payroll run approved by HR/Management.');
      setErrorMessage('');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to approve payroll run.');
    },
  });

  const postGLMutation = useMutation({
    mutationFn: () => payrollService.postRunToGL(id!),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['payrollRunDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      setActionMessage(`Posted successfully to General Ledger (${res.journalEntry?.journal_number || 'Journal Entry'}).`);
      setErrorMessage('');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to post payroll to General Ledger.');
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Loading payroll run details...
      </div>
    );
  }

  const run = runData?.run;
  const entries = runData?.entries || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/secure-kolmeks-x0y0/payroll/runs')}
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Payroll Runs
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {run?.run_number}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${
                run?.status === 'POSTED'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : run?.status === 'APPROVED'
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}
            >
              {run?.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Period: {run?.payroll_period?.name} ({run?.payroll_period?.start_date} to {run?.payroll_period?.end_date})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {['DRAFT', 'PROCESSING', 'PENDING_APPROVAL'].includes(run?.status || '') && (
            <button
              onClick={() => calculateMutation.mutate()}
              disabled={calculateMutation.isPending}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${calculateMutation.isPending ? 'animate-spin' : ''}`} />
              {calculateMutation.isPending ? 'Calculating...' : 'Run Calculation Engine'}
            </button>
          )}

          {['PROCESSING', 'DRAFT'].includes(run?.status || '') && entries.length > 0 && (
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {approveMutation.isPending ? 'Approving...' : 'Approve Payroll'}
            </button>
          )}

          {run?.status === 'APPROVED' && (
            <button
              onClick={() => postGLMutation.mutate()}
              disabled={postGLMutation.isPending}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm gap-2"
            >
              <Landmark className="w-4 h-4" />
              {postGLMutation.isPending ? 'Posting...' : 'Post to General Ledger'}
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          {actionMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          {errorMessage}
        </div>
      )}

      {/* Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Headcount</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{run?.total_employees || 0} Employees</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Gross Payroll</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{run?.gross_payroll ? run.gross_payroll.toLocaleString('en-IN') : '0.00'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Deductions</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{run?.total_deductions ? run.total_deductions.toLocaleString('en-IN') : '0.00'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Payroll</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{run?.net_payroll ? run.net_payroll.toLocaleString('en-IN') : '0.00'}
          </p>
        </div>
      </div>

      {/* Calculated Employee Entries */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
          Itemized Employee Payslips & Calculation Breakdown
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4">Payslip #</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Basic Salary</th>
                <th className="p-4">Allowances</th>
                <th className="p-4">Overtime Pay</th>
                <th className="p-4">Gross Pay</th>
                <th className="p-4">Unpaid Leave Ded.</th>
                <th className="p-4">Total Ded.</th>
                <th className="p-4 font-bold text-emerald-600 dark:text-emerald-400">Net Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No calculations run yet. Click "Run Calculation Engine" above.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      {entry.payslip_number}
                    </td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {entry.employee?.first_name} {entry.employee?.last_name}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {entry.department?.name || 'General'}
                    </td>
                    <td className="p-4 text-slate-900 dark:text-white">₹{entry.basic_salary?.toFixed(2)}</td>
                    <td className="p-4 text-slate-900 dark:text-white">₹{entry.allowances?.toFixed(2)}</td>
                    <td className="p-4 text-indigo-600 dark:text-indigo-400 font-medium">
                      ₹{entry.overtime_pay?.toFixed(2)}
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">₹{entry.gross_pay?.toFixed(2)}</td>
                    <td className="p-4 text-rose-600 dark:text-rose-400">₹{entry.unpaid_leave_deductions?.toFixed(2)}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">₹{entry.total_deductions?.toFixed(2)}</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{entry.net_pay?.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
