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
    return (
      <ERPLayout activeTab="finance">
        <LoadingState message="Loading pending budget approvals queue..." />
      </ERPLayout>
    );
  }

  return (
    <ERPLayout activeTab="finance">
      <div className="space-y-6">
        <ERPPageHeader
          title="Budget Approvals Queue"
          subtitle="Review, approve, or reject proposed operational and departmental budgets submitted by budget owners."
          actions={
            <button
              onClick={fetchApprovalsQueue}
              className="inline-flex items-center px-3.5 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh Queue
            </button>
          }
        />

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-400 flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Pending Submissions ({pendingBudgets.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
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
              <tbody className="divide-y divide-slate-800">
                {pendingBudgets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No pending budget approvals. All submitted budgets have been reviewed.
                    </td>
                  </tr>
                ) : (
                  pendingBudgets.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-medium">{b.budget_code}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{b.budget_name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{b.period?.period_name || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {b.owner ? `${b.owner.first_name} ${b.owner.last_name}` : 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">
                        {b.submitted_at ? new Date(b.submitted_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold font-mono text-slate-100">
                        {formatCurrency(b.total_budget_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/finance/budgets/${b.id}`)}
                          className="inline-flex items-center text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleApprove(b.id)}
                          className="inline-flex items-center text-xs text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded transition font-semibold disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => setSelectedBudgetId(b.id)}
                          className="inline-flex items-center text-xs text-rose-400 bg-rose-600/20 hover:bg-rose-600/30 px-2.5 py-1 rounded transition border border-rose-500/30 font-semibold"
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
      </div>

      {/* Reject Modal */}
      {selectedBudgetId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-100">Reject Budget Proposal</h3>
            <p className="text-xs text-slate-400">Specify why this budget proposal is being returned for revision.</p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Budget exceeds Q3 departmental limit..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedBudgetId(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading || !rejectionReason.trim()}
                onClick={handleReject}
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
