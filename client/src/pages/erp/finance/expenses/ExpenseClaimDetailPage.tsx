import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  XCircle,
  RotateCcw,
  CreditCard,
  ArrowLeft,
  Paperclip,
  Clock,
  Building2,
  IndianRupee,
  AlertTriangle,
  BookOpen,
  UserCheck,
  Eye,
  X,
  PlusCircle,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../../components/erp/LoadingState';
import { ErrorState } from '../../../../components/erp/ErrorState';
import { expenseService, ExpenseClaim, Reimbursement } from '../../../../services/expense.service';
import { ERP_BASE_PATH } from '../../../../constants/navigation';

export const ExpenseClaimDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [claim, setClaim] = useState<ExpenseClaim | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [budgetWarning, setBudgetWarning] = useState<string | null>(null);

  // Modals state
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showReturnModal, setShowReturnModal] = useState<boolean>(false);
  const [returnReason, setReturnReason] = useState<string>('');

  // Reimbursement modal state
  const [showReimbModal, setShowReimbModal] = useState<boolean>(false);
  const [reimbAmount, setReimbAmount] = useState<number>(0);
  const [reimbMethod, setReimbMethod] = useState<'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'OTHER'>('BANK_TRANSFER');
  const [reimbRef, setReimbRef] = useState<string>('');
  const [reimbNotes, setReimbNotes] = useState<string>('');
  const [reimbSubmitting, setReimbSubmitting] = useState<boolean>(false);

  const fetchClaimDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await expenseService.getClaimById(id);
      setClaim(data);
      setReimbAmount(data.outstanding_amount || 0);
    } catch (err: any) {
      console.error('Error loading claim details:', err);
      setError(err?.response?.data?.message || 'Failed to fetch claim details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  const handleApprove = async () => {
    if (!id || !claim) return;
    try {
      setLoading(true);
      setError(null);
      const res = await expenseService.approveClaim(id);
      setActionMsg(res.message);
      if (res.budget_warning) {
        setBudgetWarning(res.budget_warning);
      }
      await fetchClaimDetails();
    } catch (err: any) {
      console.error('Error approving claim:', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to approve claim.');
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectionReason.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await expenseService.rejectClaim(id, rejectionReason.trim());
      setActionMsg(res.message);
      setShowRejectModal(false);
      await fetchClaimDetails();
    } catch (err: any) {
      console.error('Error rejecting claim:', err);
      setError(err?.response?.data?.error?.message || 'Failed to reject claim.');
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!id || !returnReason.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await expenseService.returnClaim(id, returnReason.trim());
      setActionMsg(res.message);
      setShowReturnModal(false);
      await fetchClaimDetails();
    } catch (err: any) {
      console.error('Error returning claim:', err);
      setError(err?.response?.data?.error?.message || 'Failed to return claim.');
      setLoading(false);
    }
  };

  const handleCreateReimbursement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !claim || reimbAmount <= 0) return;
    try {
      setReimbSubmitting(true);
      setError(null);
      const res = await expenseService.createReimbursement({
        claim_id: id,
        amount: reimbAmount,
        payment_method: reimbMethod,
        reference_number: reimbRef,
        notes: reimbNotes,
      });
      setActionMsg(res.message);
      setShowReimbModal(false);
      await fetchClaimDetails();
    } catch (err: any) {
      console.error('Error creating reimbursement:', err);
      setError(err?.response?.data?.error?.message || 'Failed to record reimbursement.');
    } finally {
      setReimbSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ERPLayout activeTab="finance">
        <LoadingState message="Loading Expense Claim details..." />
      </ERPLayout>
    );
  }

  if (error || !claim) {
    return (
      <ERPLayout activeTab="finance">
        <ErrorState message={error || 'Expense claim not found.'} onRetry={fetchClaimDetails} />
      </ERPLayout>
    );
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-700 border-slate-200/80',
      SUBMITTED: 'bg-amber-50 text-amber-800 border-amber-200/80',
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80',
      RETURNED: 'bg-orange-50 text-orange-800 border-orange-200/80',
      PARTIALLY_REIMBURSED: 'bg-blue-50 text-blue-700 border-blue-200/80',
      REIMBURSED: 'bg-purple-50 text-purple-700 border-purple-200/80',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${colors[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <ERPLayout activeTab="finance">
      <div className="space-y-6">
        <ERPPageHeader
          title={`Claim ${claim.claim_number}`}
          subtitle={`Submitted by ${claim.employee ? `${claim.employee.first_name} ${claim.employee.last_name}` : 'Employee'} on ${claim.claim_date}`}
          actions={
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-3.5 py-2 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Back
              </button>

              {['DRAFT', 'RETURNED'].includes(claim.status) && (
                <button
                  onClick={() => navigate(`${ERP_BASE_PATH}/finance/expenses/claims/${claim.id}/edit`)}
                  className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Edit Claim
                </button>
              )}

              {['SUBMITTED', 'MANAGER_REVIEW', 'FINANCE_REVIEW'].includes(claim.status) && (
                <>
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="inline-flex items-center px-3.5 py-2 border border-amber-200/80 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Return for Edit
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="inline-flex items-center px-3.5 py-2 border border-rose-200/80 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Approve Claim
                  </button>
                </>
              )}

              {['APPROVED', 'REIMBURSEMENT_PENDING', 'PARTIALLY_REIMBURSED'].includes(claim.status) && claim.outstanding_amount > 0 && (
                <button
                  onClick={() => setShowReimbModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                  Record Reimbursement
                </button>
              )}
            </div>
          }
        />

        {actionMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center shadow-xs">
            <CheckCircle className="w-4 h-4 mr-2.5 shrink-0 text-emerald-600" />
            {actionMsg}
          </div>
        )}

        {budgetWarning && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs font-semibold flex items-center shadow-xs">
            <AlertTriangle className="w-4 h-4 mr-2.5 shrink-0 text-amber-600" />
            {budgetWarning}
          </div>
        )}

        {/* Claim Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Status</span>
            <div>{getStatusBadge(claim.status)}</div>
            {claim.rejection_reason && (
              <p className="mt-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200/80 font-medium">
                Reason: {claim.rejection_reason}
              </p>
            )}
            {claim.return_reason && (
              <p className="mt-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 font-medium">
                Returned: {claim.return_reason}
              </p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Claim Amount</span>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(claim.total_amount)}</div>
            <div className="text-xs font-medium text-slate-500 mt-1">{claim.items?.length || 0} line items</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Approved Amount</span>
            <div className="text-2xl font-bold text-emerald-700 tracking-tight">{formatCurrency(claim.approved_amount)}</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Verified claim total</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">Outstanding Reimbursement</span>
            <div className="text-2xl font-bold text-purple-700 tracking-tight">{formatCurrency(claim.outstanding_amount)}</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Reimbursed: {formatCurrency(claim.reimbursed_amount)}</div>
          </div>
        </div>

        {/* Claim Details Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
            <span className="flex items-center">
              <UserCheck className="w-4 h-4 mr-2 text-emerald-600" />
              Employee & Cost Center Mapping
            </span>
            {claim.journal_entry && (
              <span className="text-xs text-slate-500 flex items-center font-medium">
                <BookOpen className="w-4 h-4 mr-1 text-teal-600" />
                Journal Entry:{' '}
                <span className="font-mono font-bold text-teal-700 ml-1">{claim.journal_entry.entry_number}</span>
              </span>
            )}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Employee Name</span>
              <span className="text-slate-900 font-semibold">{claim.employee ? `${claim.employee.first_name} ${claim.employee.last_name}` : 'N/A'}</span>
              <span className="text-xs text-slate-500 font-medium block mt-0.5">{claim.employee?.department || 'Department N/A'}</span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Cost Center</span>
              <span className="text-slate-900 font-semibold">{claim.cost_center ? `${claim.cost_center.code} - ${claim.cost_center.name}` : 'General / Unallocated'}</span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Claim Date</span>
              <span className="text-slate-900 font-semibold">{claim.claim_date}</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Purpose / Description</span>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-medium">{claim.description}</p>
          </div>
        </div>

        {/* Expense Items Breakdown Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
            <IndianRupee className="w-4 h-4 mr-2 text-emerald-600" />
            Expense Line Items & Receipts ({claim.items?.length || 0})
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Claim Amount</th>
                  <th className="py-3.5 px-4 text-right">Approved Amt</th>
                  <th className="py-3.5 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claim.items?.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 font-bold">{index + 1}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{item.expense_date}</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-semibold">{item.category?.name || 'Category'}</td>
                    <td className="py-3.5 px-4 text-slate-900 font-medium">{item.description}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {formatCurrency(item.approved_amount || item.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.receipt_url ? (
                        <button
                          type="button"
                          onClick={() => setPreviewReceiptUrl(item.receipt_url || null)}
                          className="inline-flex items-center text-xs text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer"
                        >
                          <Paperclip className="w-3.5 h-3.5 mr-1" /> View Receipt
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No Receipt</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reimbursement History Table */}
        {claim.reimbursements && claim.reimbursements.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-purple-600" />
              Reimbursement Payment Settlements ({claim.reimbursements.length})
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Reimbursement #</th>
                    <th className="py-3.5 px-4">Payment Date</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Reference #</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claim.reimbursements.map((reimb) => (
                    <tr key={reimb.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-purple-700 font-bold">{reimb.reimbursement_number}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">{reimb.reimbursement_date}</td>
                      <td className="py-3.5 px-4 text-slate-900 font-semibold">{reimb.payment_method}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 font-medium">{reimb.reference_number || '-'}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-purple-700">
                        {formatCurrency(reimb.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {reimb.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Log History Timeline */}
        {claim.audit_logs && claim.audit_logs.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-indigo-600" />
              Audit Log & State Transition History
            </h3>
            <div className="space-y-3">
              {claim.audit_logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="p-1.5 rounded-full bg-white text-indigo-600 border border-indigo-100 shadow-xs mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.action.replace('_', ' ')}</span>
                      <span className="text-slate-400 font-medium">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    {log.details && (
                      <div className="text-slate-600 mt-1 font-mono text-[11px] truncate">
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Receipt Image Preview Modal */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-5 relative shadow-xl">
            <button
              onClick={() => setPreviewReceiptUrl(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
              <Paperclip className="w-4 h-4 mr-2 text-emerald-600" /> Receipt Attachment Preview
            </h3>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-xl p-2 border border-slate-200">
              <img src={previewReceiptUrl} alt="Receipt Attachment" className="max-w-full h-auto object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <XCircle className="w-5 h-5 mr-2 text-rose-600" /> Reject Expense Claim
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Please specify the rejection reason for record keeping and employee notification.
            </p>
            <textarea
              rows={3}
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl text-xs font-medium focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
            />
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <RotateCcw className="w-5 h-5 mr-2 text-amber-600" /> Return Claim for Correction
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Specify what corrections or missing receipt attachments the employee must fix before resubmitting.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Please attach missing hotel receipt tax invoice..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturn}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Return Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Reimbursement Modal */}
      {showReimbModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateReimbursement} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-purple-600" /> Record Reimbursement Payment
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Record cash/bank settlement for approved claim <span className="font-mono font-bold text-emerald-700">{claim.claim_number}</span>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reimbursement Amount (Max ₹{claim.outstanding_amount.toLocaleString()})
              </label>
              <input
                type="number"
                max={claim.outstanding_amount}
                min={1}
                step="any"
                required
                value={reimbAmount}
                onChange={(e) => setReimbAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 text-purple-700 font-bold px-3 py-2 rounded-xl text-base focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <select
                  value={reimbMethod}
                  onChange={(e) => setReimbMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                  <option value="CASH">Petty Cash Payout</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="OTHER">Other Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reference / UTR Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR1029384756"
                  value={reimbRef}
                  onChange={(e) => setReimbRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Remittance Notes
              </label>
              <input
                type="text"
                placeholder="Optional notes..."
                value={reimbNotes}
                onChange={(e) => setReimbNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowReimbModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reimbSubmitting}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                {reimbSubmitting ? 'Posting...' : 'Post Reimbursement Entry'}
              </button>
            </div>
          </form>
        </div>
      )}
    </ERPLayout>
  );
};

export default ExpenseClaimDetailPage;
