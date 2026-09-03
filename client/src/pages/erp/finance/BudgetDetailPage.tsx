import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Send,
  Lock,
  Archive,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  UserCheck,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { ERPLayout } from '../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { budgetingService } from '../../../services/budgeting.service';
import { Budget } from '../../../types/budgeting';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const BudgetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [versions, setVersions] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);

  const fetchBudgetDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [budgetRes, versionsRes] = await Promise.all([
        budgetingService.getBudgetById(id),
        budgetingService.getBudgetVersions(id),
      ]);

      if (budgetRes.success) setBudget(budgetRes.data);
      if (versionsRes.success) setVersions(versionsRes.data);
    } catch (err: any) {
      console.error('Error fetching budget detail:', err);
      setError(err?.response?.data?.message || 'Failed to load budget details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetDetail();
  }, [id]);

  const handleAction = async (actionFn: () => Promise<any>, successMsg: string) => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await actionFn();
      if (res.success) {
        setShowRejectModal(false);
        fetchBudgetDetail();
      }
    } catch (err: any) {
      console.error('Action failed:', err);
      setError(err?.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return <LoadingState message="Fetching budget specification & line items..." />;
  }

  if (error || !budget) {
    return <ErrorState message={error || 'Budget record not found.'} onRetry={fetchBudgetDetail} />;
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
    SUBMITTED: 'bg-amber-50 text-amber-700 border-amber-200/80',
    UNDER_REVIEW: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80',
    LOCKED: 'bg-slate-200 text-slate-800 border-slate-300',
    ARCHIVED: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <div className="space-y-5">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/list`)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Budget Register
        </button>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              <span className="font-mono text-emerald-600 mr-2">{budget.budget_code}</span> — {budget.budget_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Version {budget.version} | Period: {budget.period?.period_name || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${budget.id}/variance`)}
            className="inline-flex items-center px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> View Variance Report
          </button>

          {budget.status === 'DRAFT' && (
            <button
              disabled={actionLoading}
              onClick={() => handleAction(() => budgetingService.submitBudget(budget.id), 'Submitted for approval')}
              className="inline-flex items-center px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> Submit for Approval
            </button>
          )}

          {(budget.status === 'SUBMITTED' || budget.status === 'UNDER_REVIEW') && (
            <>
              <button
                disabled={actionLoading}
                onClick={() => handleAction(() => budgetingService.approveBudget(budget.id), 'Approved')}
                className="inline-flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve Budget
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                className="inline-flex items-center px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
              </button>
            </>
          )}

          {budget.status === 'APPROVED' && (
            <>
              <button
                disabled={actionLoading}
                onClick={() => handleAction(() => budgetingService.lockBudget(budget.id), 'Locked')}
                className="inline-flex items-center px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" /> Lock Budget
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleAction(() => budgetingService.createBudgetVersion(budget.id), 'Version Created')}
                className="inline-flex items-center px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Create New Version
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rejection Alert Banner if status === REJECTED */}
      {budget.status === 'REJECTED' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-800">Budget Proposal Rejected</h4>
            <p className="mt-0.5 text-xs text-rose-700">{budget.rejection_reason || 'No reason provided.'}</p>
          </div>
        </div>
      )}

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">Status</div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                statusColors[budget.status]
              }`}
            >
              {budget.status}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">Financial Period</div>
          <div className="text-base font-bold text-slate-900">{budget.period?.period_name || 'N/A'}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-mono">
            {budget.period?.start_date} to {budget.period?.end_date}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">Owner / Manager</div>
          <div className="text-base font-bold text-slate-900">
            {budget.owner ? `${budget.owner.first_name} ${budget.owner.last_name}` : 'Unassigned'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {typeof budget.owner?.department === 'object' ? (budget.owner?.department as any)?.name : (budget.owner?.department || 'Finance Planning')}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">Total Budget Amount</div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {formatCurrency(budget.total_budget_amount)}
          </div>
        </div>
      </div>

      {/* Budget Version History Strip */}
      {versions.length > 1 && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center space-x-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Version History:</span>
          <div className="flex items-center space-x-2 overflow-x-auto">
            {versions.map((v) => (
              <button
                key={v.id}
                onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${v.id}`)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  v.id === budget.id
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                v{v.version} ({v.status})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Budget Lines Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
          Budget Allocations Breakdown ({budget.lines?.length || 0} lines)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Account Code</th>
                <th className="py-3.5 px-4">GL Account Name</th>
                <th className="py-3.5 px-4">Cost Center</th>
                <th className="py-3.5 px-4 text-right">Budget Amount</th>
                <th className="py-3.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(budget.lines || []).map((line) => (
                <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">
                    {line.account?.account_code || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {line.account?.account_name || 'N/A'}{' '}
                    <span className="text-[11px] text-slate-400 font-normal">({line.account?.account_type})</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {line.cost_center ? `${line.cost_center.code} - ${line.cost_center.name}` : 'General Overhead'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">
                    {formatCurrency(line.budget_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">{line.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200/80 bg-slate-50/80 font-bold text-slate-900">
              <tr>
                <td colSpan={3} className="py-3.5 px-4 uppercase text-[11px] text-slate-500">
                  Total Budget Allocation
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-700 text-sm">
                  {formatCurrency(budget.total_budget_amount)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Audit Trail Details */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs text-xs text-slate-500 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <span className="font-bold text-slate-700">Created:</span> {new Date(budget.created_at).toLocaleString()}
        </div>
        {budget.submitted_at && (
          <div>
            <span className="font-bold text-slate-700">Submitted:</span>{' '}
            {new Date(budget.submitted_at).toLocaleString()}
          </div>
        )}
        {budget.approved_at && (
          <div>
            <span className="font-bold text-slate-700">Approved:</span>{' '}
            {new Date(budget.approved_at).toLocaleString()}
          </div>
        )}
        {budget.locked_at && (
          <div>
            <span className="font-bold text-slate-700">Locked:</span> {new Date(budget.locked_at).toLocaleString()}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Reject Budget Proposal</h3>
            <p className="text-xs text-slate-500">Please state the reason why this budget proposal is being rejected.</p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Total proposed expenditure exceeds Q3 departmental ceilings..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading || !rejectionReason.trim()}
                onClick={() =>
                  handleAction(
                    () => budgetingService.rejectBudget(budget.id, rejectionReason.trim()),
                    'Rejected'
                  )
                }
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
