import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Building2,
  Calendar,
  FileSpreadsheet,
  Link2,
  Boxes,
  CheckCircle2,
  XCircle,
  Send,
  Ban,
  Download,
  Mail,
  History,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Quotation } from '../../../types/quotation';
import { QuotationService } from '../../../services/quotation.service';
import { salesOrderService } from '../../../services/sales_order.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const QuotationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchQuotationDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await QuotationService.getQuotationById(id);
      if (res.success && res.data) {
        setQuotation(res.data);
      } else {
        setError('Quotation record not found.');
      }
    } catch (err: any) {
      console.error('Error fetching quotation details:', err);
      setError(err.response?.data?.message || 'Unable to load quotation profile.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuotationDetails();
  }, [fetchQuotationDetails]);

  const handleStatusTransition = async (targetStatus: string) => {
    if (!id || !quotation) return;
    if (targetStatus === 'CANCELLED') {
      if (!window.confirm('Are you sure you want to cancel this commercial quotation?')) return;
    }

    setIsUpdatingStatus(true);
    setStatusMessage(null);
    try {
      const res = await QuotationService.updateStatus(id, targetStatus);
      if (res.success) {
        setStatusMessage(res.message);
        setQuotation((prev) => (prev ? { ...prev, status: targetStatus } : null));
        fetchQuotationDetails();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update quotation status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCreateSalesOrder = async () => {
    if (!id || !quotation) return;
    try {
      setIsUpdatingStatus(true);
      const res = await salesOrderService.createSalesOrderFromQuotation(id);
      if (res.success && res.data) {
        navigate(`${ERP_BASE_PATH}/sales-orders/${res.data.id}`);
      } else if (res.existingSalesOrderId) {
        if (window.confirm(`A Sales Order (${res.existingOrderNumber}) already exists for this quotation. Would you like to view it now?`)) {
          navigate(`${ERP_BASE_PATH}/sales-orders/${res.existingSalesOrderId}`);
        }
      } else {
        alert(res.message || 'Failed to generate Sales Order from quotation.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to create Sales Order.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading commercial quotation workspace...</p>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Unable to Load Quotation</h3>
        <p className="text-xs text-slate-500 mb-4">{error || 'Quotation record not found.'}</p>
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/quotations`)}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
        >
          Return to Quotations List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/quotations`)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Quotations List
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {quotation.quotation_number}
            </h1>
            <StatusBadge status={quotation.status} />
          </div>
        </div>

        {/* STATUS ACTIONS BAR */}
        <div className="flex flex-wrap items-center gap-2">
          {['DRAFT', 'UNDER_REVIEW'].includes(quotation.status.toUpperCase()) && (
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/quotations/${quotation.id}/edit`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
          )}

          {quotation.status.toUpperCase() === 'DRAFT' && (
            <button
              onClick={() => handleStatusTransition('UNDER_REVIEW')}
              disabled={isUpdatingStatus}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Submit for Review
            </button>
          )}

          {quotation.status.toUpperCase() === 'UNDER_REVIEW' && (
            <button
              onClick={() => handleStatusTransition('APPROVED')}
              disabled={isUpdatingStatus}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Approve Quotation
            </button>
          )}

          {quotation.status.toUpperCase() === 'APPROVED' && (
            <button
              onClick={() => handleStatusTransition('SENT')}
              disabled={isUpdatingStatus}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5" />
              Mark as Sent
            </button>
          )}

          {['ACCEPTED', 'APPROVED'].includes(quotation.status.toUpperCase()) && (
            <button
              onClick={handleCreateSalesOrder}
              disabled={isUpdatingStatus}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Generate Sales Order
            </button>
          )}

          {quotation.status.toUpperCase() === 'SENT' && (
            <>
              <button
                onClick={() => handleStatusTransition('ACCEPTED')}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Accepted
              </button>
              <button
                onClick={() => handleStatusTransition('REJECTED')}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Mark Rejected
              </button>
            </>
          )}

          {!['CANCELLED', 'ACCEPTED'].includes(quotation.status.toUpperCase()) && (
            <button
              onClick={() => handleStatusTransition('CANCELLED')}
              disabled={isUpdatingStatus}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
              Cancel Offer
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS */}
        <div className="lg:col-span-2 space-y-6">
          {/* CUSTOMER & MASTER INFO CARD */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Customer & Profile Summary</h2>
              </div>
              {quotation.customer_master && (
                <Link
                  to={`${ERP_BASE_PATH}/customers/${quotation.customer_master.id}`}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View Customer Profile →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium mb-1">Company Name</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {quotation.customer_master?.company_name || 'N/A'}
                </span>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {quotation.customer_master?.customer_code}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-medium mb-1">Quotation Date</span>
                <span className="font-medium text-slate-800">
                  {new Date(quotation.quotation_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium mb-1">Valid Until</span>
                <span className="font-medium text-slate-800">
                  {quotation.valid_until
                    ? new Date(quotation.valid_until).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'No Expiry'}
                </span>
              </div>
            </div>

            {/* LINKED RFQ CARD IF AVAILABLE */}
            <div className="pt-2 border-t border-slate-100">
              {quotation.rfq_master ? (
                <div className="flex items-center justify-between bg-blue-50/60 p-3 rounded-lg border border-blue-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold text-slate-900">Linked to RFQ: </span>
                      <span className="font-mono font-semibold text-blue-700">{quotation.rfq_master.rfq_number}</span>
                      <span className="text-slate-500 ml-2">({quotation.rfq_master.component_name})</span>
                    </div>
                  </div>
                  <Link
                    to={`${ERP_BASE_PATH}/rfqs/${quotation.rfq_master.id}`}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Open RFQ →
                  </Link>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No RFQ linked (Direct commercial quotation).</span>
              )}
            </div>
          </div>

          {/* QUOTATION LINE ITEMS TABLE */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Line Items & Commercial Pricing Breakdown
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Product / Description</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2">Unit</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Discount</th>
                    <th className="px-3 py-2 text-right">Tax</th>
                    <th className="px-3 py-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!quotation.items || quotation.items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-slate-400 italic">
                        No line items recorded.
                      </td>
                    </tr>
                  ) : (
                    quotation.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="px-3 py-2.5 font-mono text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-slate-800">{item.description}</div>
                          {item.product_master && (
                            <div className="text-[10px] text-purple-600 font-mono mt-0.5">
                              Linked Product: {item.product_master.name} ({item.product_master.product_code})
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-900">
                          {Number(item.quantity).toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">{item.unit}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-800">
                          {quotation.currency} {Number(item.unit_price).toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-amber-600">
                          {Number(item.discount) > 0
                            ? item.discount_type === 'percentage'
                              ? `${item.discount}%`
                              : `${quotation.currency} ${Number(item.discount).toFixed(2)}`
                            : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                          {Number(item.tax_rate) > 0 ? `${item.tax_rate}%` : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                          {quotation.currency} {Number(item.line_total).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* FINANCIAL TOTALS SUMMARY */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl">
              <div className="text-xs text-slate-500">
                <div>Created by: <span className="font-semibold text-slate-700">{quotation.creator_user?.full_name || 'System Staff'}</span></div>
                {quotation.approver_user && (
                  <div>Approved by: <span className="font-semibold text-emerald-700">{quotation.approver_user.full_name}</span></div>
                )}
              </div>

              <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {quotation.currency} {Number(quotation.subtotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Total Discount:</span>
                  <span className="font-mono font-medium text-amber-600">
                    - {quotation.currency} {Number(quotation.discount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Total Tax:</span>
                  <span className="font-mono font-medium text-slate-800">
                    + {quotation.currency} {Number(quotation.tax).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-700">
                    {quotation.currency} {Number(quotation.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COMMERCIAL TERMS & FUTURE ACTIONS */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Commercial Terms & Notes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium mb-1">Payment Terms</span>
                <span className="font-semibold text-slate-800">{quotation.payment_terms || 'Standard terms apply.'}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium mb-1">Delivery Terms</span>
                <span className="font-semibold text-slate-800">{quotation.delivery_terms || 'Standard delivery terms.'}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium mb-1">Estimated Lead Time</span>
                <span className="font-medium text-slate-800">{quotation.delivery_time || 'Specified upon order.'}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 block font-medium mb-1">Additional Notes</span>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 whitespace-pre-line font-normal">
                  {quotation.notes || 'No extra notes provided.'}
                </div>
              </div>
            </div>

            {/* FUTURE WORKFLOW PLACEHOLDERS */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 italic">Future document dispatch options:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => alert('PDF generation workflow coming soon in future release.')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF Export (Soon)
                </button>
                <button
                  type="button"
                  onClick={() => alert('Email delivery service coming soon in future release.')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Customer (Soon)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUDIT ACTIVITY TIMELINE */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-700" />
              Audit Activity Timeline
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {!quotation.activities || quotation.activities.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-2">No activity events recorded.</p>
              ) : (
                quotation.activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-800">{act.description}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {act.actor_name} •{' '}
                        {new Date(act.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
