import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { ERPLayout } from '../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { budgetingService } from '../../../services/budgeting.service';
import { Budget } from '../../../types/budgeting';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const BudgetApprovalsPage: React.FC = () => {
  const navigate = useNavigate();

  const [pendingBudgets, setPendingBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reject Modal
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const fetchApprovalsQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await budgetingService.getBudgetApprovalsQueue();
      if (res.success) setPendingBudgets(res.data);
    } catch (err: any) {
      console.error('Error fetching budget approvals queue:', err);
      setError(err?.response?.data?.message || 'Failed to load pending budget approvals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalsQueue();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await budgetingService.approveBudget(id);
      if (res.success) fetchApprovalsQueue();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBudgetId || !rejectionReason.trim()) return;
    try {
      setActionLoading(true);
      setError(null);
      const res = await budgetingService.rejectBudget(selectedBudgetId, rejectionReason.trim());
      if (res.success) {
        setSelectedBudgetId(null);
        setRejectionReason('');
        fetchApprovalsQueue();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return <LoadingState message="Loading pending budget approvals queue..." />;
  }

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Budget Approvals Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review, approve, or reject proposed operational and departmental budgets submitted by budget owners
            </p>
          </div>
        </div>

        <button
          onClick={fetchApprovalsQueue}
          className="inline-flex items-center px-3.5 py-2 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Queue
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Pending Submissions ({pendingBudgets.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Budget Code</th>
                <th className="py-3.5 px-4">Budget Name</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4">Owner</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-right">Review Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingBudgets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No pending budget approvals. All submitted budgets have been reviewed.
                  </td>
                </tr>
              ) : (
                pendingBudgets.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">{b.budget_code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{b.budget_name}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{b.period?.period_name || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">
                      {b.owner ? `${b.owner.first_name} ${b.owner.last_name}` : 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {b.submitted_at ? new Date(b.submitted_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(b.total_budget_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${b.id}`)}
                        className="inline-flex items-center text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleApprove(b.id)}
                        className="inline-flex items-center text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-all font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => setSelectedBudgetId(b.id)}
                        className="inline-flex items-center text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-all border border-rose-200/80 font-semibold cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {selectedBudgetId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Reject Budget Proposal</h3>
            <p className="text-xs text-slate-500">Specify why this budget proposal is being returned for revision.</p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Budget exceeds Q3 departmental limit..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                onClick={() => {
                  setSelectedBudgetId(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading || !rejectionReason.trim()}
                onClick={handleReject}
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
