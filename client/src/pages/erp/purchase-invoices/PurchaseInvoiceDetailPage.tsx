import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ShieldAlert, AlertTriangle, FileText, Printer, Lock, Ban } from 'lucide-react';
import { purchaseInvoiceService } from '../../../services/purchase_invoice.service';
import { PurchaseInvoice, MatchStatus } from '../../../types/purchase_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';

export const PurchaseInvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<PurchaseInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchInvoice = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseInvoiceService.getInvoiceById(id);
      setInvoice(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load purchase invoice.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleApproveVariance = async () => {
    if (!id) return;
    try {
      setProcessing(true);
      setActionMessage(null);
      await purchaseInvoiceService.approveInvoice(id, 'Variance approved by Finance Manager.');
      setActionMessage('Variance exception approved successfully!');
      fetchInvoice();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to approve variance.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePostInvoice = async () => {
    if (!id) return;
    try {
      setProcessing(true);
      setActionMessage(null);
      await purchaseInvoiceService.postInvoice(id);
      setActionMessage('Invoice posted to Accounts Payable & General Ledger!');
      fetchInvoice();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to post invoice.');
    } finally {
      setProcessing(false);
    }
  };

  const handleVoidInvoice = async () => {
    if (!id) return;
    const reason = prompt('Enter reason for voiding this invoice:');
    if (!reason) return;

    try {
      setProcessing(true);
      setActionMessage(null);
      await purchaseInvoiceService.voidInvoice(id, reason);
      setActionMessage('Invoice voided successfully.');
      fetchInvoice();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to void invoice.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingState message="Loading purchase invoice details..." />;
  if (error || !invoice) return <ErrorState message={error || 'Invoice not found.'} onRetry={fetchInvoice} />;

  const getMatchBadge = (match: MatchStatus) => {
    switch (match) {
      case 'MATCHED':
        return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800">3-Way Matched</span>;
      case 'QUANTITY_VARIANCE':
        return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800">Quantity Variance</span>;
      case 'PRICE_VARIANCE':
        return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-100 text-orange-800">Price Variance</span>;
      case 'BOTH_VARIANCE':
        return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-800">Qty & Price Variance</span>;
      case 'APPROVED_EXCEPTION':
        return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">Approved Exception</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">{match}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* NAVIGATION & ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(`${ERP_BASE_PATH}/purchases/invoices`)}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices Registry
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / PDF
          </button>

          {invoice.status === 'PENDING_REVIEW' && (
            <button
              onClick={handleApproveVariance}
              disabled={processing}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> Approve Variance Exception
            </button>
          )}

          {(invoice.status === 'DRAFT' || invoice.status === 'APPROVED') && (
            <button
              onClick={handlePostInvoice}
              disabled={processing}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> Post to Accounts Payable
            </button>
          )}

          {invoice.status !== 'VOIDED' && invoice.paid_amount === 0 && (
            <button
              onClick={handleVoidInvoice}
              disabled={processing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Ban className="w-4 h-4" /> Void Invoice
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
          {actionMessage}
        </div>
      )}

      {/* HEADER BILL CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 font-mono">{invoice.internal_invoice_number}</h1>
              <StatusBadge status={invoice.status} />
              {getMatchBadge(invoice.match_status)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Supplier Invoice Number: <span className="font-mono font-bold text-slate-700">{invoice.supplier_invoice_number}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Outstanding</div>
            <div className="text-2xl font-bold text-rose-600">
              ₹{invoice.outstanding_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase">Supplier</span>
            <span className="font-bold text-slate-900">{invoice.supplier?.supplier_name}</span>
            <span className="block text-xs text-slate-500">{invoice.supplier?.supplier_code}</span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase">Invoice Date</span>
            <span className="font-medium text-slate-800">{invoice.invoice_date}</span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase">Due Date</span>
            <span className="font-bold text-rose-600">{invoice.due_date}</span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase">Accounting Journal</span>
            {invoice.journal_entry ? (
              <span className="font-mono text-indigo-600 font-semibold">{invoice.journal_entry.entry_number}</span>
            ) : (
              <span className="text-slate-400 text-xs italic">Unposted</span>
            )}
          </div>
        </div>

        {/* THREE-WAY MATCHING STATUS BAR */}
        {invoice.match_status !== 'MATCHED' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">3-Way Match Discrepancy Detail</h4>
              <p className="text-xs text-amber-700 mt-1">
                {invoice.variance_reason || 'Invoiced quantities or prices do not match the originating Purchase Order / GRN.'}
              </p>
            </div>
          </div>
        )}

        {/* LINE ITEMS */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Line Item Breakdown</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Invoiced Qty</th>
                  <th className="py-3 px-4 text-center">Expected (GRN/PO)</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">PO Price</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.lines?.map((line) => (
                  <tr key={line.id}>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {line.description}
                      {line.product && <span className="block text-[11px] text-slate-400">SKU: {line.product.sku}</span>}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {line.quantity} {line.unit}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {line.received_quantity || line.ordered_quantity || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      ₹{line.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      ₹{line.po_unit_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{line.line_total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOTALS SUMMARY */}
        <div className="flex justify-end border-t border-slate-200 pt-4">
          <div className="w-72 space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Taxes:</span>
              <span className="font-semibold text-slate-900">₹{invoice.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>Total Bill:</span>
              <span className="text-indigo-600">₹{invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-emerald-700">
              <span>Paid Amount:</span>
              <span>₹{invoice.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-rose-600 pt-1 border-t border-slate-200">
              <span>Outstanding Payable:</span>
              <span>₹{invoice.outstanding_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
