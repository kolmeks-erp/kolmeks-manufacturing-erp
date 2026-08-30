import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Ban, Printer, CheckCircle } from 'lucide-react';
import { purchaseInvoiceService } from '../../../services/purchase_invoice.service';
import { SupplierPayment } from '../../../types/purchase_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';

export const SupplierPaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<SupplierPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchPayment = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseInvoiceService.getPaymentById(id);
      setPayment(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to fetch payment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const handleVoidPayment = async () => {
    if (!id) return;
    const reason = prompt('Enter reason for voiding this payment remittance:');
    if (!reason) return;

    try {
      setProcessing(true);
      setActionMessage(null);
      await purchaseInvoiceService.voidPayment(id, reason);
      setActionMessage('Supplier payment voided and invoice balances restored successfully.');
      fetchPayment();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to void supplier payment.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingState message="Loading payment receipt..." />;
  if (error || !payment) return <ErrorState message={error || 'Payment not found.'} onRetry={fetchPayment} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`${ERP_BASE_PATH}/finance/supplier-payments`)}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments Registry
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Remittance Advice
          </button>

          {payment.status !== 'VOIDED' && (
            <button
              onClick={handleVoidPayment}
              disabled={processing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Ban className="w-4 h-4" /> Void Payment
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
          {actionMessage}
        </div>
      )}

      {/* RECEIPT CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 font-mono">{payment.payment_number}</h1>
              <StatusBadge status={payment.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Payment Date: <span className="font-semibold text-slate-800">{payment.payment_date}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Disbursement</div>
            <div className="text-2xl font-bold text-emerald-600">
              ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase">Supplier</span>
            <span className="font-bold text-slate-900">{payment.supplier?.supplier_name}</span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase">Payment Method</span>
            <span className="font-medium text-slate-800">{payment.payment_method}</span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase">Reference #</span>
            <span className="font-mono text-slate-800 font-semibold">{payment.reference_number || '-'}</span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase">Accounting Journal</span>
            {payment.journal_entry ? (
              <span className="font-mono text-indigo-600 font-semibold">{payment.journal_entry.entry_number}</span>
            ) : (
              <span className="text-slate-400 text-xs italic">Unposted</span>
            )}
          </div>
        </div>

        {/* ALLOCATION BREAKDOWN */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Applied Invoice Settlements</h3>
          {payment.allocations && payment.allocations.length > 0 ? (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 font-semibold text-slate-500 uppercase border-b border-slate-200">
                    <th className="py-2.5 px-4">PINV #</th>
                    <th className="py-2.5 px-4">Supplier Bill #</th>
                    <th className="py-2.5 px-4 text-right">Invoice Total</th>
                    <th className="py-2.5 px-4 text-right">Applied Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payment.allocations.map((alloc) => (
                    <tr key={alloc.id}>
                      <td className="py-2.5 px-4 font-mono font-semibold text-indigo-600">
                        <Link to={`${ERP_BASE_PATH}/purchases/invoices/${alloc.purchase_invoice_id}`}>
                          {alloc.invoice?.internal_invoice_number}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-700">{alloc.invoice?.supplier_invoice_number}</td>
                      <td className="py-2.5 px-4 text-right text-slate-600">
                        ₹{alloc.invoice?.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-600">
                        ₹{alloc.allocated_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-xs italic">
              This payment has no applied invoice allocations and remains as unallocated credit on the supplier's account.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
