import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Ban, BookOpen, Printer, CheckCircle } from 'lucide-react';
import { salesInvoiceService } from '../../../services/sales_invoice.service';
import { CustomerPayment } from '../../../types/sales_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';

export const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<CustomerPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voiding, setVoiding] = useState(false);

  const fetchPayment = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await salesInvoiceService.getPaymentById(id);
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
    const reason = prompt('Please enter reason for voiding this payment receipt:');
    if (!reason) return;

    try {
      setVoiding(true);
      await salesInvoiceService.voidPayment(id, reason);
      fetchPayment();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to void payment.');
    } finally {
      setVoiding(false);
    }
  };

  if (loading) return <LoadingState message="Loading customer payment details..." />;
  if (error || !payment) return <ErrorState message={error || 'Payment not found.'} onRetry={fetchPayment} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(`${ERP_BASE_PATH}/finance/payments`)}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>

          {payment.status === 'POSTED' && (
            <button
              onClick={handleVoidPayment}
              disabled={voiding}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium text-xs rounded-lg transition-colors"
            >
              <Ban className="w-4 h-4" /> {voiding ? 'Voiding...' : 'Void Payment'}
            </button>
          )}
        </div>
      </div>

      {/* RECEIPT CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-tight">KOLMEKS REMITTANCE RECEIPT</span>
              <StatusBadge status={payment.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Official Customer Payment Acknowledgment</p>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-2xl font-mono font-bold text-emerald-400">{payment.payment_number}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Date: {payment.payment_date}</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-200 bg-slate-50/50">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Customer</span>
            <p className="font-bold text-slate-900 text-sm mt-1">{payment.customer?.company_name}</p>
            <p className="text-xs text-slate-500 mt-0.5">Code: {payment.customer?.customer_code}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Payment Details</span>
            <p className="text-xs text-slate-700 mt-1">Method: <span className="font-semibold uppercase">{payment.payment_method}</span></p>
            <p className="text-xs text-slate-700 mt-0.5">Reference: <span className="font-mono">{payment.reference_number || 'N/A'}</span></p>
            {payment.journal_entry && (
              <p className="text-xs text-indigo-600 font-mono mt-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Journal: {payment.journal_entry.entry_number}
              </p>
            )}
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Amount Received</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Allocated: ₹{payment.allocated_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} | Unallocated: ₹{payment.unallocated_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* ALLOCATION BREAKDOWN */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Invoice Settlements</h3>
          {!payment.allocations || payment.allocations.length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200">
              This payment has not been allocated to any specific sales invoices. It is currently unallocated customer credit.
            </p>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 font-semibold text-slate-500 uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">Invoice Number</th>
                    <th className="py-2.5 px-3">Invoice Date</th>
                    <th className="py-2.5 px-3 text-right">Invoice Total</th>
                    <th className="py-2.5 px-3 text-right">Settled Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {payment.allocations.map((alloc) => (
                    <tr key={alloc.id}>
                      <td className="py-2.5 px-3 font-mono font-semibold text-indigo-600">
                        <Link to={`${ERP_BASE_PATH}/sales/invoices/${alloc.invoice?.id}`}>
                          {alloc.invoice?.invoice_number}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3">{alloc.invoice?.invoice_date}</td>
                      <td className="py-2.5 px-3 text-right">
                        ₹{alloc.invoice?.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                        ₹{alloc.allocated_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
