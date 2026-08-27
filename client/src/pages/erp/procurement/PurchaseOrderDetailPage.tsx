import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingCart,
  ArrowLeft,
  Edit,
  CheckCircle2,
  Ban,
  Building2,
  Calendar,
  Clock,
  AlertCircle,
  Package,
  FileText,
  History,
  Send,
  PackageCheck,
  Truck,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { ProcurementService } from '../../../services/procurement.service';
import { PurchaseOrder, ProcurementActivity } from '../../../types/procurement';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const PurchaseOrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [activities, setActivities] = useState<ProcurementActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const poData = await ProcurementService.getPurchaseOrderById(id);
      setOrder(poData);

      const actData = await ProcurementService.getPOActivities(id);
      setActivities(actData || []);
    } catch (err: any) {
      console.error('Error fetching PO details:', err);
      setError(err.message || 'Failed to load purchase order details.');
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
      await ProcurementService.updatePOStatus(id, status);
      await fetchDetails();
    } catch (err: any) {
      console.error('Failed status change:', err);
      setError(err.message || 'Failed to update Purchase Order status.');
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
            DRAFT PO
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            PENDING APPROVAL
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            APPROVED
          </span>
        );
      case 'SENT':
      case 'ACKNOWLEDGED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Send className="w-3.5 h-3.5" />
            {s === 'ACKNOWLEDGED' ? 'ACKNOWLEDGED BY VENDOR' : 'SENT TO VENDOR'}
          </span>
        );
      case 'PARTIALLY_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Truck className="w-3.5 h-3.5" />
            PARTIALLY RECEIVED
          </span>
        );
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <PackageCheck className="w-3.5 h-3.5" />
            FULLY RECEIVED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
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
        Loading Purchase Order Details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-rose-900">Purchase Order Not Found</h3>
        <p className="text-xs text-slate-600">The requested purchase order record does not exist.</p>
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/purchase-orders`)}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Back to List
        </button>
      </div>
    );
  }

  const s = order.status.toUpperCase();

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/purchase-orders`)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{order.po_number}</h1>
              {renderStatusBadge(order.status)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Issued on {new Date(order.order_date).toLocaleDateString()} to{' '}
              <span className="font-semibold text-slate-800">{order.supplier_master?.company_name || 'Vendor'}</span>
            </p>
          </div>
        </div>

        {/* WORKFLOW ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          {['DRAFT', 'PENDING_APPROVAL'].includes(s) && (
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/purchase-orders/${id}/edit`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Order
            </button>
          )}

          {s === 'DRAFT' && (
            <button
              onClick={() => handleStatusChange('APPROVED')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve PO
            </button>
          )}

          {s === 'APPROVED' && (
            <button
              onClick={() => handleStatusChange('SENT')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Send to Vendor
            </button>
          )}

          {s === 'SENT' && (
            <button
              onClick={() => handleStatusChange('ACKNOWLEDGED')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Acknowledged
            </button>
          )}

          {['SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED'].includes(s) && (
            <button
              onClick={() => handleStatusChange('RECEIVED')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              Mark Fully Received
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

      {/* GOODS RECEIPT INTEGRATION BANNER */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950">Goods Receipt & Inspection Module Ready</h4>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              This Purchase Order is prepped for incoming material verification, GRN generation, and inventory posting.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
          Ready for Receiving
        </span>
      </div>

      {/* HEADER DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* SUPPLIER CARD */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 col-span-1 md:col-span-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vendor / Supplier</span>
          {order.supplier_master ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{order.supplier_master.company_name}</h3>
                <p className="text-xs text-slate-500 font-mono">Code: {order.supplier_master.supplier_code}</p>
              </div>
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/${order.supplier_id}`)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Vendor Profile
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-700">Direct Vendor</div>
          )}
        </div>

        {/* REQUISITION REF */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requisition Ref</span>
          {order.requisition_master ? (
            <div>
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/purchase-requisitions/${order.requisition_id}`)}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                {order.requisition_master.requisition_number}
              </button>
              <p className="text-[10px] text-slate-500">{order.requisition_master.department}</p>
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-400">—</div>
          )}
        </div>

        {/* EXPECTED DELIVERY */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expected Delivery</span>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-slate-400" />
            {order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : 'Unscheduled'}
          </div>
        </div>
      </div>

      {/* COMMERCIAL LINE ITEMS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-600" />
            Purchase Order Commercial Items ({(order.items || []).length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Item Description</th>
                <th className="py-3.5 px-4 text-right">Qty</th>
                <th className="py-3.5 px-4 text-center">Unit</th>
                <th className="py-3.5 px-4 text-right">Unit Price</th>
                <th className="py-3.5 px-4 text-right">Discount</th>
                <th className="py-3.5 px-4 text-right">Tax</th>
                <th className="py-3.5 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {(order.items || []).map((item, index) => (
                <tr key={item.id || index} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {item.description}
                    {item.product_master && (
                      <div className="text-[10px] font-normal text-slate-400">
                        Code: {item.product_master.product_code}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-800">{item.quantity}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">{item.unit}</td>
                  <td className="py-3.5 px-4 text-right text-slate-700 font-mono">
                    {order.currency} {Number(item.unit_price || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-amber-600 font-mono">
                    {Number(item.discount || 0) > 0 ? `- ${order.currency} ${Number(item.discount).toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right text-cyan-700 font-mono">
                    {Number(item.line_tax || 0) > 0 ? `+ ${order.currency} ${Number(item.line_tax).toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                    {order.currency} {Number(item.line_total || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FINANCIAL TOTALS & TERMS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Commercial Terms & Instructions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Terms</span>
              <p className="font-semibold text-slate-800">{order.payment_terms || 'Net 30 Days'}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Delivery Terms</span>
              <p className="font-semibold text-slate-800">{order.delivery_terms || 'FOB Factory'}</p>
            </div>
          </div>

          {order.notes && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-700 mb-1">Order Notes</h3>
              <p className="text-xs text-slate-600 bg-slate-50/60 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* FINANCIAL SUMMARY CARD */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-900 shadow-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3">
            Financial Total Summary
          </h2>

          <div className="space-y-2 text-xs font-medium text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-white font-mono">
                {order.currency} {Number(order.subtotal || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Discount Amount:</span>
              <span className="font-mono">
                - {order.currency} {Number(order.discount_amount || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-cyan-400">
              <span>Tax Amount:</span>
              <span className="font-mono">
                + {order.currency} {Number(order.tax_amount || 0).toFixed(2)}
              </span>
            </div>
            <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-bold text-emerald-400">
              <span>Grand Total:</span>
              <span className="font-mono">
                {order.currency} {Number(order.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
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
    </div>
  );
};
