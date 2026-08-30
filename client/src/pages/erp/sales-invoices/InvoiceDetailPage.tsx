import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck,
  Ban,
  DollarSign,
  Printer,
  Calendar,
  Building2,
  BookOpen,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { salesInvoiceService } from '../../../services/sales_invoice.service';
import { SalesInvoice } from '../../../types/sales_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { ConfirmDialog } from '../../../components/erp/ConfirmDialog';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<SalesInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showIssueConfirm, setShowIssueConfirm] = useState(false);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  const fetchInvoice = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await salesInvoiceService.getInvoiceById(id);
      setInvoice(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to fetch invoice details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleIssueInvoice = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await salesInvoiceService.issueInvoice(id);
      setShowIssueConfirm(false);
      fetchInvoice();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to issue invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVoidInvoice = async () => {
    if (!id || !voidReason.trim()) return;
    try {
      setActionLoading(true);
      await salesInvoiceService.voidInvoice(id, voidReason);
      setShowVoidConfirm(false);
      fetchInvoice();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to void invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading sales invoice details..." />;
  if (error || !invoice) return <ErrorState message={error || 'Invoice not found.'} onRetry={fetchInvoice} />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* NAVIGATION & ACTION TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(`${ERP_BASE_PATH}/sales/invoices`)}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>

          {invoice.status === 'DRAFT' && (
            <button
              onClick={() => setShowIssueConfirm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
            >
              <FileCheck className="w-4 h-4" /> Issue & Post Invoice
            </button>
          )}

          {(invoice.status === 'ISSUED' || invoice.status === 'PARTIALLY_PAID' || invoice.status === 'OVERDUE') && (
            <Link
              to={`${ERP_BASE_PATH}/finance/payments/new?customer_id=${invoice.customer_id}&invoice_id=${invoice.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
            >
              <CreditCard className="w-4 h-4" /> Record Payment
            </Link>
          )}

          {invoice.status !== 'VOIDED' && invoice.paid_amount === 0 && (
            <button
              onClick={() => setShowVoidConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium text-xs rounded-lg transition-colors"
            >
              <Ban className="w-4 h-4" /> Void Invoice
            </button>
          )}
        </div>
      </div>

      {/* INVOICE CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* BRANDING HEADER */}
        <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-tight">KOLMEKS MANUFACTURING</span>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">High-Precision CNC Machining & Electric Motors ERP</p>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-2xl font-mono font-bold text-emerald-400">{invoice.invoice_number}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Created: {invoice.invoice_date}</p>
          </div>
        </div>

        {/* METADATA SUMMARY */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 border-b border-slate-200 bg-slate-50/50">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Billed To</span>
            <p className="font-bold text-slate-900 text-sm mt-1">{invoice.customer?.company_name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{invoice.billing_address || 'No billing address specified'}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Dates & Terms</span>
            <p className="text-xs text-slate-700 mt-1">Invoice Date: <span className="font-medium">{invoice.invoice_date}</span></p>
            <p className="text-xs text-slate-700 mt-0.5">Due Date: <span className="font-bold text-rose-600">{invoice.due_date}</span></p>
            <p className="text-xs text-slate-500 mt-0.5">Terms: {invoice.payment_terms || 'Net 30'}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">References</span>
            <p className="text-xs text-slate-700 mt-1">
              Sales Order: <span className="font-mono">{invoice.sales_order?.order_number || 'Direct'}</span>
            </p>
            {invoice.journal_entry && (
              <p className="text-xs text-indigo-600 font-mono mt-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Journal: {invoice.journal_entry.entry_number}
              </p>
            )}
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Outstanding Balance</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              ₹{invoice.outstanding_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Paid: ₹{invoice.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* LINE ITEMS BREAKDOWN */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Invoice Line Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-center">Tax %</th>
                  <th className="py-3 px-4 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {(invoice.lines || []).map((line, idx) => (
                  <tr key={line.id || idx}>
                    <td className="py-3 px-4 text-xs font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{line.product?.name || line.description}</p>
                      {line.product?.sku && <p className="text-xs font-mono text-slate-400">SKU: {line.product.sku}</p>}
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {line.quantity} {line.unit}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₹{line.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-slate-500">{line.tax_rate}%</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      ₹{line.line_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FINANCIAL SUMMARY TOTALS */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <div className="w-80 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">
                ₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span>-₹{invoice.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Taxes:</span>
              <span className="font-semibold text-slate-900">
                ₹{invoice.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>Total Invoice Amount:</span>
              <span className="text-indigo-600">
                ₹{invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pt-1">
              <span>Amount Paid:</span>
              <span className="font-semibold text-emerald-600">
                ₹{invoice.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-amber-600 pt-1">
              <span>Balance Due:</span>
              <span>₹{invoice.outstanding_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* PAYMENT ALLOCATIONS HISTORY */}
        {invoice.allocations && invoice.allocations.length > 0 && (
          <div className="p-6 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Payment Allocations</h3>
            <div className="space-y-2">
              {invoice.allocations.map((alloc) => (
                <div
                  key={alloc.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                >
                  <div>
                    <span className="font-bold text-indigo-600 font-mono">
                      {alloc.payment?.payment_number || 'Payment'}
                    </span>
                    <span className="text-slate-500 ml-2">
                      ({alloc.payment?.payment_method}) - Date: {alloc.payment?.payment_date}
                    </span>
                  </div>
                  <div className="font-bold text-emerald-600">
                    +₹{alloc.allocated_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CONFIRM DIALOGS */}
      {showIssueConfirm && (
        <ConfirmDialog
          isOpen={showIssueConfirm}
          title="Issue Sales Invoice"
          message="Are you sure you want to issue this invoice? This will lock the invoice lines and post the atomic accounting journal entry to Accounts Receivable."
          confirmLabel="Issue & Post Invoice"
          onConfirm={handleIssueInvoice}
          onCancel={() => setShowIssueConfirm(false)}
          isLoading={actionLoading}
        />
      )}

      {showVoidConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Void Sales Invoice</h3>
            <p className="text-sm text-slate-600">
              Please enter the reason for voiding this invoice. This will reverse associated accounting entries.
            </p>
            <textarea
              rows={3}
              placeholder="Reason for voiding..."
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowVoidConfirm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVoidInvoice}
                disabled={!voidReason.trim() || actionLoading}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? 'Voiding...' : 'Confirm Void'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
