import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ClipboardList,
  ArrowLeft,
  Edit,
  CheckCircle2,
  XCircle,
  Ban,
  FileCheck,
  Building2,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Package,
  FileText,
  History,
  ShoppingCart,
  Send,
} from 'lucide-react';
import { ProcurementService } from '../../../services/procurement.service';
import { PurchaseRequisition, ProcurementActivity } from '../../../types/procurement';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const PurchaseRequisitionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [requisition, setRequisition] = useState<PurchaseRequisition | null>(null);
  const [activities, setActivities] = useState<ProcurementActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const prData = await ProcurementService.getRequisitionById(id);
      setRequisition(prData);

      const actData = await ProcurementService.getRequisitionActivities(id);
      setActivities(actData || []);
    } catch (err: any) {
      console.error('Error fetching requisition details:', err);
      setError(err.message || 'Failed to load purchase requisition details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      setActionLoading(true);
      setError(null);
      await ProcurementService.updateRequisitionStatus(id, status);
      await fetchDetails();
    } catch (err: any) {
      console.error('Failed status change:', err);
      setError(err.message || 'Failed to update requisition status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      setError(null);
      await ProcurementService.approveRequisition(id);
      await fetchDetails();
    } catch (err: any) {
      console.error('Failed approval:', err);
      setError(err.message || 'Failed to approve requisition.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setActionLoading(true);
      setError(null);
      await ProcurementService.rejectRequisition(id, rejectReason);
      setShowRejectModal(false);
      await fetchDetails();
    } catch (err: any) {
      console.error('Failed rejection:', err);
      setError(err.message || 'Failed to reject requisition.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToPO = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      setError(null);
      const res = await ProcurementService.convertRequisitionToPO(id);
      if (res.success && res.data) {
        navigate(`${ERP_BASE_PATH}/purchase-orders/${res.data.id}`);
      }
    } catch (err: any) {
      console.error('Failed conversion:', err);
      setError(err.response?.data?.message || err.message || 'Failed to convert requisition to Purchase Order.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            DRAFT REQUISITION
          </span>
        );
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Send className="w-3.5 h-3.5 animate-pulse" />
            {s === 'UNDER_REVIEW' ? 'UNDER REVIEW' : 'SUBMITTED FOR APPROVAL'}
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            APPROVED FOR PO CREATION
          </span>
        );
      case 'CONVERTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <FileCheck className="w-3.5 h-3.5" />
            CONVERTED TO PURCHASE ORDER
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            REJECTED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
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
      <div className="py-20 text-center text-slate-400">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-900" />
        Loading Requisition Details...
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-rose-900">Requisition Not Found</h3>
        <p className="text-xs text-slate-600">The requested purchase requisition does not exist or has been removed.</p>
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/purchase-requisitions`)}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Back to List
        </button>
      </div>
    );
  }

  const isApproved = requisition.status.toUpperCase() === 'APPROVED';
  const isConverted = requisition.status.toUpperCase() === 'CONVERTED';
  const isDraft = requisition.status.toUpperCase() === 'DRAFT';
  const isSubmitted = requisition.status.toUpperCase() === 'SUBMITTED' || requisition.status.toUpperCase() === 'UNDER_REVIEW';

  return (
    <div className="space-y-6">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/purchase-requisitions`)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{requisition.requisition_number}</h1>
              {renderStatusBadge(requisition.status)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Created on {new Date(requisition.created_at).toLocaleDateString()} by{' '}
              <span className="font-semibold text-slate-700">{requisition.requester_user?.full_name || 'Staff'}</span>
            </p>
          </div>
        </div>

        {/* WORKFLOW ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          {isDraft && (
            <>
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/purchase-requisitions/${id}/edit`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>

              <button
                onClick={() => handleStatusChange('SUBMITTED')}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Submit for Approval
              </button>
            </>
          )}

          {isSubmitted && (
            <>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve Requisition
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            </>
          )}

          {isApproved && !isConverted && (
            <button
              onClick={handleConvertToPO}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              {actionLoading ? 'Creating Purchase Order...' : 'Convert to Purchase Order'}
            </button>
          )}

          {isConverted && requisition.linked_po && (
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/purchase-orders/${requisition.linked_po?.id}`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              View Purchase Order ({requisition.linked_po.po_number})
            </button>
          )}
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* HEADER DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Building2 className="w-4 h-4 text-slate-500" />
            {requisition.department}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority</span>
          <div className="text-sm font-bold text-slate-800">{requisition.priority}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Request Date</span>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Calendar className="w-4 h-4 text-slate-400" />
            {requisition.request_date ? new Date(requisition.request_date).toLocaleDateString() : 'N/A'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required Date</span>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Calendar className="w-4 h-4 text-slate-400" />
            {requisition.required_date ? new Date(requisition.required_date).toLocaleDateString() : 'As Needed'}
          </div>
        </div>
      </div>

      {/* REASON & NOTES */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Reason / Purpose</h2>
        <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium">
          {requisition.reason}
        </p>

        {requisition.notes && (
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-700 mb-1">Additional Notes</h3>
            <p className="text-xs text-slate-600 bg-slate-50/60 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
              {requisition.notes}
            </p>
          </div>
        )}
      </div>

      {/* LINE ITEMS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-600" />
            Requested Line Items ({(requisition.items || []).length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Item & Specification</th>
                <th className="py-3.5 px-4 text-right">Quantity</th>
                <th className="py-3.5 px-4 text-center">Unit</th>
                <th className="py-3.5 px-4 text-right">Est. Unit Cost</th>
                <th className="py-3.5 px-4 text-right">Est. Line Total</th>
                <th className="py-3.5 px-4 text-center">Required Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {(requisition.items || []).map((item, index) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.estimated_unit_cost) || 0);
                return (
                  <tr key={item.id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.description}
                      {item.product_master && (
                        <div className="text-[10px] font-normal text-slate-400">
                          Master Code: {item.product_master.product_code}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600">{item.unit}</td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      ₹{Number(item.estimated_unit_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ₹{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-500">
                      {item.required_date ? new Date(item.required_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTIVITIES TIMELINE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-slate-600" />
          Audit & Workflow Activity Log
        </h2>

        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="p-1.5 bg-slate-200 text-slate-700 rounded-lg shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{act.action}</span>
                    <span className="text-[10px] text-slate-400">{new Date(act.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 font-medium">{act.details?.message || JSON.stringify(act.details)}</p>
                  <span className="text-[10px] text-slate-400">By: {act.details?.actor_name || 'Staff User'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REJECTION MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form onSubmit={handleRejectSubmit} className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              Reject Purchase Requisition
            </h3>
            <p className="text-xs text-slate-500">Provide reason or feedback for rejecting this requisition request.</p>

            <textarea
              rows={3}
              placeholder="Rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              required
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
