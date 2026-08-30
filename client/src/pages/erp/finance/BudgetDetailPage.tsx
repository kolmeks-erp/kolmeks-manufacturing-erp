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
    return (
      <ERPLayout activeTab="finance">
        <LoadingState message="Fetching budget specification & line items..." />
      </ERPLayout>
    );
  }

  if (error || !budget) {
    return (
      <ERPLayout activeTab="finance">
        <ErrorState message={error || 'Budget record not found.'} onRetry={fetchBudgetDetail} />
      </ERPLayout>
    );
  }

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
    <ERPLayout activeTab="finance">
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/list`)}
            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Budget Register
          </button>
        </div>

        <ERPPageHeader
          title={`${budget.budget_code} — ${budget.budget_name}`}
          subtitle={`Version ${budget.version} | Period: ${budget.period?.period_name || 'N/A'}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${budget.id}/variance`)}
                className="inline-flex items-center px-3.5 py-2 bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 rounded-lg text-sm font-semibold transition"
              >
                <TrendingUp className="w-4 h-4 mr-2" /> View Variance Report
              </button>

              {budget.status === 'DRAFT' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction(() => budgetingService.submitBudget(budget.id), 'Submitted for approval')}
                  className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" /> Submit for Approval
                </button>
              )}

              {(budget.status === 'SUBMITTED' || budget.status === 'UNDER_REVIEW') && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAction(() => budgetingService.approveBudget(budget.id), 'Approved')}
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve Budget
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="inline-flex items-center px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg text-sm font-semibold transition"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </button>
                </>
              )}

              {budget.status === 'APPROVED' && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAction(() => budgetingService.lockBudget(budget.id), 'Locked')}
                    className="inline-flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4 mr-2" /> Lock Budget
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleAction(() => budgetingService.createBudgetVersion(budget.id), 'Version Created')}
                    className="inline-flex items-center px-3.5 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4 mr-2" /> Create New Version
                  </button>
                </>
              )}
            </div>
          }
        />

        {/* Rejection Alert Banner if status === REJECTED */}
        {budget.status === 'REJECTED' && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-rose-400">Budget Proposal Rejected</h4>
              <p className="mt-1 text-xs">{budget.rejection_reason || 'No reason provided.'}</p>
            </div>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Status</div>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                  statusColors[budget.status]
                }`}
              >
                {budget.status}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Financial Period</div>
            <div className="text-base font-bold text-slate-100">{budget.period?.period_name || 'N/A'}</div>
            <div className="text-xs text-slate-400 mt-1">
              {budget.period?.start_date} to {budget.period?.end_date}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Owner / Manager</div>
            <div className="text-base font-bold text-slate-100">
              {budget.owner ? `${budget.owner.first_name} ${budget.owner.last_name}` : 'Unassigned'}
            </div>
            <div className="text-xs text-slate-400 mt-1">{budget.owner?.department || 'Finance Planning'}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Total Budget Amount</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {formatCurrency(budget.total_budget_amount)}
            </div>
          </div>
        </div>

        {/* Budget Version History Strip */}
        {versions.length > 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">Version History:</span>
            <div className="flex items-center space-x-2 overflow-x-auto">
              {versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${v.id}`)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    v.id === budget.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  v{v.version} ({v.status})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Budget Lines Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-100 border-b border-slate-800 pb-3 mb-4">
            Budget Allocations Breakdown ({budget.lines?.length || 0} lines)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Account Code</th>
                  <th className="py-3 px-4">GL Account Name</th>
                  <th className="py-3 px-4">Cost Center</th>
                  <th className="py-3 px-4 text-right">Budget Amount</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(budget.lines || []).map((line) => (
                  <tr key={line.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-emerald-400 font-medium">
                      {line.account?.account_code || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {line.account?.account_name || 'N/A'}{' '}
                      <span className="text-xs text-slate-500 font-normal">({line.account?.account_type})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {line.cost_center ? `${line.cost_center.code} - ${line.cost_center.name}` : 'General Overhead'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold font-mono text-slate-100">
                      {formatCurrency(line.budget_amount)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">{line.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-700 bg-slate-800/50 font-semibold text-slate-100">
                <tr>
                  <td colSpan={3} className="py-3 px-4 uppercase text-xs text-slate-400">
                    Total Budget Allocation
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 text-base">
                    {formatCurrency(budget.total_budget_amount)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Audit Trail Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm text-xs text-slate-400 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-semibold text-slate-300">Created:</span> {new Date(budget.created_at).toLocaleString()}
          </div>
          {budget.submitted_at && (
            <div>
              <span className="font-semibold text-slate-300">Submitted:</span>{' '}
              {new Date(budget.submitted_at).toLocaleString()}
            </div>
          )}
          {budget.approved_at && (
            <div>
              <span className="font-semibold text-slate-300">Approved:</span>{' '}
              {new Date(budget.approved_at).toLocaleString()}
            </div>
          )}
          {budget.locked_at && (
            <div>
              <span className="font-semibold text-slate-300">Locked:</span> {new Date(budget.locked_at).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-100">Reject Budget Proposal</h3>
            <p className="text-xs text-slate-400">Please state the reason why this budget proposal is being rejected.</p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Total proposed expenditure exceeds Q3 departmental ceilings..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </ERPLayout>
  );
};
