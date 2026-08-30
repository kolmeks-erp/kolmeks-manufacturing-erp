import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, CreditCard, CheckSquare, Square } from 'lucide-react';
import { salesInvoiceService } from '../../../services/sales_invoice.service';
import { customerService } from '../../../services/customer.service';
import { Customer } from '../../../types/customer';
import { SalesInvoice, PaymentMethod } from '../../../types/sales_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const PaymentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCustId = searchParams.get('customer_id') || '';
  const initialInvId = searchParams.get('invoice_id') || '';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [openInvoices, setOpenInvoices] = useState<SalesInvoice[]>([]);

  const [customerId, setCustomerId] = useState<string>(initialCustId);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Map of invoice_id -> allocated amount
  const [allocations, setAllocations] = useState<{ [invoiceId: string]: number }>({});

  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    customerService.getCustomers({ status: 'active' }).then(setCustomers).catch(console.error);
  }, []);

  // Fetch open invoices when customerId changes
  useEffect(() => {
    if (!customerId) {
      setOpenInvoices([]);
      setAllocations({});
      return;
    }

    const fetchCustomerInvoices = async () => {
      try {
        setLoadingInvoices(true);
        const allInvoices = await salesInvoiceService.getInvoices({
          customer_id: customerId,
        });

        const open = allInvoices.filter(
          (inv) => inv.outstanding_amount > 0 && (inv.status === 'ISSUED' || inv.status === 'PARTIALLY_PAID' || inv.status === 'OVERDUE')
        );

        setOpenInvoices(open);

        // Pre-allocate to target invoice if specified in URL query
        if (initialInvId) {
          const targetInv = open.find((i) => i.id === initialInvId);
          if (targetInv) {
            setAmount(targetInv.outstanding_amount.toString());
            setAllocations({ [targetInv.id]: targetInv.outstanding_amount });
          }
        }
      } catch (err: any) {
        console.error('Error fetching customer invoices:', err);
      } finally {
        setLoadingInvoices(false);
      }
    };

    fetchCustomerInvoices();
  }, [customerId, initialInvId]);

  const handleAllocationChange = (invoiceId: string, val: string, maxOut: number) => {
    const num = Math.min(maxOut, Math.max(0, parseFloat(val) || 0));
    setAllocations((prev) => ({
      ...prev,
      [invoiceId]: num,
    }));
  };

  const totalAllocated = Object.values(allocations).reduce((acc, v) => acc + (v || 0), 0);
  const totalPaymentAmt = parseFloat(amount) || 0;
  const unallocatedAmt = Math.max(0, totalPaymentAmt - totalAllocated);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('Please select a customer.');
      return;
    }
    if (!totalPaymentAmt || totalPaymentAmt <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }
    if (totalAllocated > totalPaymentAmt) {
      setError(`Allocated amount (₹${totalAllocated}) cannot exceed payment amount (₹${totalPaymentAmt}).`);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const allocList = Object.entries(allocations)
        .filter(([_, amt]) => amt > 0)
        .map(([invId, amt]) => ({ invoice_id: invId, amount: amt }));

      const created = await salesInvoiceService.recordPayment({
        customer_id: customerId,
        payment_date: paymentDate,
        amount: totalPaymentAmt,
        payment_method: paymentMethod,
        reference_number: referenceNumber,
        notes,
        allocations: allocList,
      });

      navigate(`${ERP_BASE_PATH}/finance/payments/${created.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to record customer payment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </button>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-emerald-600" />
          Record Customer Payment
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Customer <span className="text-rose-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
              required
            >
              <option value="">Select Customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} ({c.customer_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Payment Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Payment Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/Wire)</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other Manual Method</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Bank / Reference Number (Transaction ID or Cheque No.)
            </label>
            <input
              type="text"
              placeholder="e.g. UTR-987654321, CHQ-10023"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* INVOICE ALLOCATION SECTION */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900">Allocate Payment to Open Invoices</h2>
            <div className="text-xs text-slate-500">
              Allocated: <span className="font-bold text-emerald-600">₹{totalAllocated.toLocaleString()}</span> | Unallocated:{' '}
              <span className="font-bold text-amber-600">₹{unallocatedAmt.toLocaleString()}</span>
            </div>
          </div>

          {!customerId ? (
            <p className="text-xs text-slate-400 italic">Select a customer above to load open invoices.</p>
          ) : loadingInvoices ? (
            <p className="text-xs text-slate-500">Loading open invoices...</p>
          ) : openInvoices.length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
              No open unpaid invoices found for this customer. Payment will remain fully unallocated.
            </p>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 font-semibold text-slate-600 uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Total Invoice</th>
                    <th className="py-2.5 px-3 text-right">Outstanding</th>
                    <th className="py-2.5 px-3 text-right w-44">Allocate Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {openInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2.5 px-3 font-mono font-semibold text-indigo-600">{inv.invoice_number}</td>
                      <td className="py-2.5 px-3 text-rose-600">{inv.due_date}</td>
                      <td className="py-2.5 px-3 text-right">
                        ₹{inv.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{inv.outstanding_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          max={inv.outstanding_amount}
                          step="any"
                          value={allocations[inv.id] || ''}
                          onChange={(e) =>
                            handleAllocationChange(inv.id, e.target.value, inv.outstanding_amount)
                          }
                          placeholder="0.00"
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-right font-bold text-emerald-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* NOTES & ACTIONS */}
        <div className="border-t border-slate-200 pt-4 flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Payment Notes
            </label>
            <textarea
              rows={2}
              placeholder="Internal remittance notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Posting Payment...' : 'Record & Post Payment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
