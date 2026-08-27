import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PackageCheck,
  ArrowLeft,
  Edit,
  CheckCircle2,
  Ban,
  Building2,
  Calendar,
  FileText,
  Clock,
  AlertCircle,
  RefreshCw,
  ShoppingCart,
  User,
  Info,
  History,
  Layers,
} from 'lucide-react';
import { GrnService } from '../../../services/grn.service';
import { GoodsReceipt } from '../../../types/grn';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const GoodsReceiptDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [grn, setGrn] = useState<GoodsReceipt | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');

  const fetchGRNDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await GrnService.getGoodsReceiptById(id);
      setGrn(data);
    } catch (err: any) {
      console.error('Error fetching GRN details:', err);
      setError(err.message || 'Failed to load Goods Receipt details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGRNDetails();
  }, [fetchGRNDetails]);

  const handleMarkComplete = async () => {
    if (!id || !grn) return;
    const confirmMsg = `Are you sure you want to mark Goods Receipt ${grn.grn_number} as COMPLETED?\n\nThis will update Purchase Order line received quantities and automatically transition PO status.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      setError(null);
      const res = await GrnService.completeGoodsReceipt(id);
      setActionSuccess(res.message || 'Goods Receipt marked as COMPLETED.');
      await fetchGRNDetails();
    } catch (err: any) {
      console.error('Error completing GRN:', err);
      setError(err.response?.data?.message || err.message || 'Failed to complete Goods Receipt.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelGRN = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      setError(null);
      const res = await GrnService.cancelGoodsReceipt(id, cancelReason);
      setActionSuccess(res.message || 'Goods Receipt cancelled.');
      setShowCancelModal(false);
      await fetchGRNDetails();
    } catch (err: any) {
      console.error('Error cancelling GRN:', err);
      setError(err.response?.data?.message || err.message || 'Failed to cancel Goods Receipt.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusBadge = (status?: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            DRAFT
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            IN PROGRESS
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            COMPLETED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            REJECTED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Ban className="w-3.5 h-3.5" />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {s}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-900" />
        <p className="text-sm font-semibold">Loading Goods Receipt Details...</p>
      </div>
    );
  }

  if (error || !grn) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/goods-receipts`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Goods Receipts
        </button>
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0 text-rose-600" />
          <div>
            <h3 className="font-bold text-sm">Goods Receipt Not Found</h3>
            <p className="mt-0.5">{error || 'The requested Goods Receipt record could not be loaded.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/goods-receipts`)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-2.5 bg-slate-900 text-white rounded-xl">
            <PackageCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{grn.grn_number}</h1>
              {renderStatusBadge(grn.status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged on {grn.created_at ? new Date(grn.created_at).toLocaleDateString() : 'N/A'} by{' '}
              <span className="font-semibold text-slate-700">{grn.creator_user?.full_name || 'Staff'}</span>
            </p>
          </div>
        </div>

        {/* WORKFLOW ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {['DRAFT', 'IN_PROGRESS'].includes(grn.status.toUpperCase()) && (
            <>
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/goods-receipts/${grn.id}/edit`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold rounded-xl transition-colors"
              >
                <Edit className="w-4 h-4" /> Edit Receipt
              </button>

              <button
                onClick={handleMarkComplete}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {actionLoading ? 'Completing...' : 'Mark as Completed'}
              </button>

              <button
                onClick={() => setShowCancelModal(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                <Ban className="w-4 h-4" /> Cancel Receipt
              </button>
            </>
          )}
        </div>
      </div>

      {/* ACTION SUCCESS BANNER */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* METADATA CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SUPPLIER CARD */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Supplier Vendor
            </span>
            {grn.supplier_id && (
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/${grn.supplier_id}`)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                View Supplier
              </button>
            )}
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">{grn.supplier?.name || 'Direct Supplier'}</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">Code: {grn.supplier?.supplier_code || 'N/A'}</div>
          </div>
          <div className="text-xs text-slate-600 space-y-1 pt-1">
            <div>Email: {grn.supplier?.email || 'N/A'}</div>
            <div>Phone: {grn.supplier?.phone || 'N/A'}</div>
          </div>
        </div>

        {/* PURCHASE ORDER CARD */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-slate-400" /> Source Purchase Order
            </span>
            {grn.purchase_order_id && (
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/purchase-orders/${grn.purchase_order_id}`)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                View PO
              </button>
            )}
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">{grn.purchase_order?.po_number || 'PO Reference'}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              PO Status: <span className="font-bold text-slate-800">{grn.purchase_order?.status || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* RECEIPT DETAILS CARD */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Receipt Information
            </span>
          </div>
          <div className="text-xs text-slate-700 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt Date:</span>
              <span className="font-semibold text-slate-900">
                {grn.receipt_date ? new Date(grn.receipt_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Reference:</span>
              <span className="font-mono font-semibold text-slate-900">
                {grn.delivery_reference || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Received By Staff:</span>
              <span className="font-semibold text-slate-900">
                {grn.receiver_user?.full_name || 'Staff User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS BREAKDOWN TABLE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            Received Items Breakdown
          </h2>
          <span className="text-xs text-slate-500 font-medium font-mono">
            Total Items: {(grn.items || []).length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Line Item Description</th>
                <th className="py-3.5 px-4 text-center">Ordered</th>
                <th className="py-3.5 px-4 text-center">Prev Rec</th>
                <th className="py-3.5 px-4 text-center">Current Rec</th>
                <th className="py-3.5 px-4 text-center">Rejected</th>
                <th className="py-3.5 px-4 text-center">Accepted</th>
                <th className="py-3.5 px-4">Rejection Reason / Remarks</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {(grn.items || []).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{item.description}</div>
                    <div className="text-[10px] text-slate-400">Unit: {item.unit}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                    {item.ordered_quantity}
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-500">
                    {item.previously_received_quantity}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-blue-700">
                    {item.received_quantity}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-rose-600">
                    {item.rejected_quantity}
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-emerald-700">
                    <span className="inline-block px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
                      {item.accepted_quantity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.rejection_reason ? (
                      <span className="text-rose-700 font-medium bg-rose-50 px-2 py-1 rounded border border-rose-200 inline-block">
                        {item.rejection_reason}
                      </span>
                    ) : item.notes ? (
                      <span className="text-slate-600 italic">{item.notes}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS SUMMARY CARD */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-300">Goods Receipt Summary Totals:</span>
          </div>

          <div className="flex items-center gap-6 font-mono">
            <div>
              <span className="text-slate-400">Ordered:</span>{' '}
              <span className="font-bold">{grn.totals?.total_ordered || 0}</span>
            </div>
            <div>
              <span className="text-slate-400">Prev Rec:</span>{' '}
              <span className="font-bold">{grn.totals?.total_previously_received || 0}</span>
            </div>
            <div>
              <span className="text-slate-400">Current Rec:</span>{' '}
              <span className="font-bold text-blue-400">{grn.totals?.total_received || 0}</span>
            </div>
            <div>
              <span className="text-slate-400">Rejected:</span>{' '}
              <span className="font-bold text-rose-400">{grn.totals?.total_rejected || 0}</span>
            </div>
            <div>
              <span className="text-slate-400">Accepted:</span>{' '}
              <span className="font-bold text-emerald-400">{grn.totals?.total_accepted || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FUTURE INVENTORY HANDOFF NOTICE BANNER */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xs border border-indigo-900/40 flex items-start gap-4">
        <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0 mt-0.5">
          <Layers className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="font-bold text-sm text-indigo-200">Inventory Ledger Integration Readiness</h3>
          <p className="text-indigo-100/80 leading-relaxed">
            This Goods Receipt (GRN) acts as the verified source event for physical stock delivery. Upon future deployment of the Inventory & Warehouse Management module, completed GRNs will seamlessly increment stock balances and record bin movements without requiring duplicate data entry.
          </p>
        </div>
      </div>

      {/* AUDIT LOG TIMELINE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-4 h-4 text-emerald-600" />
          Audit & Activity History
        </h2>

        {(grn.activities || []).length === 0 ? (
          <p className="text-xs text-slate-400 italic">No activity log records recorded yet.</p>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {grn.activities?.map((act) => (
              <div key={act.id} className="relative text-xs">
                <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-white" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{act.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">
                  {act.details?.actor_name && <span className="font-semibold text-slate-700">{act.details.actor_name}: </span>}
                  {act.details?.message || JSON.stringify(act.details)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-600" />
              Cancel Goods Receipt
            </h3>
            <p className="text-xs text-slate-600">
              Please specify a reason for cancelling Goods Receipt <span className="font-bold">{grn.grn_number}</span>.
            </p>
            <textarea
              rows={3}
              placeholder="Cancellation reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCancelGRN}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
