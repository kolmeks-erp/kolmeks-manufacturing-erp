import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  ArrowLeft,
  Edit,
  Building2,
  Calendar,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  User,
  History,
  ShieldCheck,
  PauseCircle,
  Ban,
  Layers,
  Truck,
  DollarSign,
} from 'lucide-react';
import { salesOrderService } from '../../../services/sales_order.service';
import { SalesOrder, SalesOrderActivity } from '../../../types/sales_order';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const SalesOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState<string | null>(null);

  const fetchSalesOrderDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await salesOrderService.getSalesOrderById(id);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError('Sales Order record not found.');
      }
    } catch (err: any) {
      console.error('Error loading sales order details:', err);
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSalesOrderDetails();
  }, [fetchSalesOrderDetails]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order || !id) return;
    if (!window.confirm(`Are you sure you want to transition Sales Order status to '${newStatus}'?`)) return;

    try {
      setIsUpdatingStatus(true);
      setStatusSuccessMsg(null);
      const res = await salesOrderService.updateStatus(id, newStatus);
      if (res.success && res.data) {
        setOrder(res.data);
        setStatusSuccessMsg(`Sales Order status updated to ${newStatus}.`);
        setTimeout(() => setStatusSuccessMsg(null), 4000);
        fetchSalesOrderDetails();
      } else {
        alert(res.message || 'Failed to update Sales Order status.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-4 h-4" />
            DRAFT
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            CONFIRMED
          </span>
        );
      case 'IN_PRODUCTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <RefreshCw className="w-4 h-4 animate-spin" />
            IN PRODUCTION
          </span>
        );
      case 'READY_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Package className="w-4 h-4" />
            READY FOR DELIVERY
          </span>
        );
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-4 h-4" />
            {s}
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <PauseCircle className="w-4 h-4" />
            ON HOLD
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-4 h-4" />
            CANCELLED
          </span>
        );
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{s}</span>;
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-900 mb-3" />
        <p className="text-sm font-semibold">Loading Sales Order profile...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/sales-orders`)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sales Orders
        </button>
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0 text-rose-600" />
          <div>
            <h3 className="font-bold text-sm">{error || 'Sales Order record not found.'}</h3>
            <p className="mt-0.5">Please check the Sales Order ID or return to the directory.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* HEADER ACTION BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#0F2647] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/sales-orders`)}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{order.order_number}</h1>
              {renderStatusBadge(order.status)}
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full">
                Priority: {order.priority}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Created on {new Date(order.order_date || order.created_at).toLocaleDateString()}
              {order.customer_reference && ` • Ref: ${order.customer_reference}`}
            </p>
          </div>
        </div>

        {/* WORKFLOW CONTROLS */}
        <div className="flex items-center gap-3 flex-wrap">
          {order.status === 'DRAFT' && (
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/sales-orders/${order.id}/edit`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Edit className="w-4 h-4" /> Edit Order
            </button>
          )}

          {/* STATUS CHANGE SELECTOR */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#071220] p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-2">Status:</span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              className="px-3 py-1.5 bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:border-blue-600 disabled:opacity-50"
            >
              <option value="DRAFT" className="bg-white dark:bg-[#0F2647]">DRAFT</option>
              <option value="CONFIRMED" className="bg-white dark:bg-[#0F2647]">CONFIRMED</option>
              <option value="IN_PRODUCTION" className="bg-white dark:bg-[#0F2647]">IN PRODUCTION</option>
              <option value="READY_FOR_DELIVERY" className="bg-white dark:bg-[#0F2647]">READY FOR DELIVERY</option>
              <option value="DELIVERED" className="bg-white dark:bg-[#0F2647]">DELIVERED</option>
              <option value="COMPLETED" className="bg-white dark:bg-[#0F2647]">COMPLETED</option>
              <option value="ON_HOLD" className="bg-white dark:bg-[#0F2647]">ON HOLD</option>
              <option value="CANCELLED" className="bg-white dark:bg-[#0F2647]">CANCELLED</option>
            </select>
          </div>
        </div>
      </div>

      {statusSuccessMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{statusSuccessMsg}</span>
        </div>
      )}

      {/* THREE-COLUMN MASTER INFORMATION SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CUSTOMER CARD */}
        <div className="bg-white dark:bg-[#0F2647] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> CUSTOMER MASTER
          </div>
          {order.customer_master ? (
            <div className="space-y-1">
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/customers/${order.customer_id}`)}
                className="font-bold text-sm text-slate-900 dark:text-white hover:underline block text-left"
              >
                {order.customer_master.company_name}
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400">Code: {order.customer_master.customer_code || 'N/A'}</p>
              {order.customer_master.email && <p className="text-xs text-slate-600 dark:text-slate-300">{order.customer_master.email}</p>}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">Direct Customer</p>
          )}
        </div>

        {/* SOURCE QUOTATION & RFQ CARD */}
        <div className="bg-white dark:bg-[#0F2647] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" /> SOURCE REFERENCES
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Source Quotation:</span>{' '}
              {order.quotation_master ? (
                <button
                  onClick={() => navigate(`${ERP_BASE_PATH}/quotations/${order.quotation_id}`)}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline ml-1"
                >
                  {order.quotation_master.quotation_number}
                </button>
              ) : (
                <span className="font-medium text-slate-600 dark:text-slate-300 ml-1">Direct Sales Order</span>
              )}
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400">Source RFQ:</span>{' '}
              {order.rfq_master ? (
                <button
                  onClick={() => navigate(`${ERP_BASE_PATH}/rfqs/${order.rfq_id}`)}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline ml-1"
                >
                  {order.rfq_master.rfq_number}
                </button>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 italic ml-1">None</span>
              )}
            </div>
          </div>
        </div>

        {/* DATES & COMMERCIAL METRICS */}
        <div className="bg-white dark:bg-[#0F2647] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> DATES & TERMS
          </div>
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Order Date:</span>
              <span className="font-semibold">{new Date(order.order_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Req. Delivery Date:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {order.requested_delivery_date ? new Date(order.requested_delivery_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Payment Terms:</span>
              <span className="font-medium">{order.payment_terms || 'Standard'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* LINE ITEMS TABLE */}
      <div className="bg-white dark:bg-[#0F2647] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Confirmed Order Line Items
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{order.items?.length || 0} Line Item(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B1E36] text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-4 text-center">Qty / Unit</th>
                <th className="py-3 px-4 text-right">Agreed Unit Price</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Tax Rate</th>
                <th className="py-3 px-4 text-right">Line Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-[#0F2647]">
              {order.items?.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-slate-50/60 dark:hover:bg-[#163761]/40">
                  <td className="py-4 px-4 font-bold text-slate-400 dark:text-slate-500">{index + 1}</td>

                  <td className="py-4 px-4 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white">{item.description}</div>
                    {item.product_master && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-700 dark:text-slate-300">
                          {item.product_master.product_code}
                        </span>
                        {item.product_master.drawing_number && (
                          <span>Drawing: {item.product_master.drawing_number}</span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4 text-center font-bold text-slate-900 dark:text-white">
                    {Number(item.quantity).toLocaleString()} <span className="text-slate-500 dark:text-slate-400 font-normal">{item.unit}</span>
                  </td>

                  <td className="py-4 px-4 text-right font-semibold">
                    {order.currency} {Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-4 px-4 text-right font-medium text-amber-600 dark:text-amber-400">
                    {Number(item.discount || 0) > 0 ? (
                      item.discount_type === 'percentage' ? (
                        `${item.discount}%`
                      ) : (
                        `${order.currency} ${Number(item.discount).toFixed(2)}`
                      )
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400 font-medium">
                    {item.tax_rate ? `${item.tax_rate}%` : '0%'}
                  </td>

                  <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-white">
                    {order.currency} {Number(item.line_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FINANCIAL TOTALS BREAKDOWN */}
        <div className="p-6 bg-slate-50 dark:bg-[#071220] border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 max-w-md">
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Delivery Terms:</span> {order.delivery_terms || 'N/A'}
            </div>
            {order.notes && (
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300">Internal Notes:</span> {order.notes}
              </div>
            )}
          </div>

          <div className="w-full md:w-80 space-y-2 text-xs bg-white dark:bg-[#0F2647] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {order.currency} {Number(order.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Total Discount:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                - {order.currency} {Number(order.discount_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Tax Amount:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                + {order.currency} {Number(order.tax_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Total Amount:</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {order.currency} {Number(order.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTION & FULFILLMENT HANDOFF BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-[#0B1E36] dark:to-[#071220] text-white p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Manufacturing & Fulfillment Handoff</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              This Sales Order is prepped for future Production Execution & Shipping Schedule modules.
            </p>
          </div>
        </div>

        <button
          disabled
          className="px-4 py-2 bg-slate-800 text-slate-400 text-xs font-semibold rounded-xl border border-slate-700 cursor-not-allowed"
        >
          Production Orders (Coming Soon)
        </button>
      </div>

      {/* AUDIT ACTIVITY TIMELINE */}
      <div className="bg-white dark:bg-[#0F2647] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <History className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Audit Activity Log
        </h2>

        <div className="space-y-4 pt-1">
          {order.activities && order.activities.length > 0 ? (
            order.activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs border-l-2 border-slate-200 dark:border-slate-700 pl-4 py-1">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 dark:text-white">{act.description}</div>
                  <div className="text-slate-400 dark:text-slate-500 text-[10px]">
                    By <span className="font-medium text-slate-600 dark:text-slate-300">{act.actor_name || 'System Staff'}</span> on{' '}
                    {new Date(act.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No activity history recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
