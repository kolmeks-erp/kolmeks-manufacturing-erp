import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { purchaseInvoiceService } from '../../../services/purchase_invoice.service';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../types/supplier';
import { PurchaseInvoice } from '../../../types/purchase_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const SupplierPaymentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedSupplierId = searchParams.get('supplier_id') || '';
  const preselectedInvoiceId = searchParams.get('invoice_id') || '';

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openInvoices, setOpenInvoices] = useState<PurchaseInvoice[]>([]);

  // Form Header State
  const [supplierId, setSupplierId] = useState(preselectedSupplierId);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Allocation Map: invoice_id -> allocated_amount
  const [allocations, setAllocations] = useState<{ [invoiceId: string]: number }>({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Suppliers
  useEffect(() => {
    SupplierService.getSuppliers({ status: 'active' }).then((res) => setSuppliers(res.data || [])).catch(console.error);
  }, []);

  // Fetch Open Purchase Invoices when Supplier changes
  useEffect(() => {
    if (!supplierId) {
      setOpenInvoices([]);
      setAllocations({});
      return;
    }

    purchaseInvoiceService
      .getInvoices({ supplier_id: supplierId })
      .then((invs) => {
        const openList = invs.filter((i) => i.outstanding_amount > 0 && i.status !== 'VOIDED');
        setOpenInvoices(openList);

        // Pre-allocate if preselected invoice exists
        if (preselectedInvoiceId) {
          const target = openList.find((i) => i.id === preselectedInvoiceId);
          if (target) {
            setAmount(target.outstanding_amount);
            setAllocations({ [target.id]: target.outstanding_amount });
          }
        }
      })
      .catch(console.error);
  }, [supplierId]);

  const handleAllocationChange = (invId: string, val: string, maxOut: number) => {
    const num = parseFloat(val) || 0;
    const bounded = Math.min(Math.max(0, num), maxOut);
    setAllocations((prev) => ({
      ...prev,
      [invId]: bounded,
    }));
  };

  // Calculations
  const numAmount = parseFloat(amount as any) || 0;
  const totalAllocated = Object.values(allocations).reduce((acc, curr) => acc + curr, 0);
  const unallocatedAmount = Math.max(0, numAmount - totalAllocated);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      setError('Please select a supplier.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid positive payment amount.');
      return;
    }
    if (totalAllocated > numAmount) {
      setError(`Allocated total (₹${totalAllocated}) cannot exceed payment amount (₹${numAmount}).`);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const allocationList = Object.entries(allocations)
        .filter(([_, allocAmt]) => allocAmt > 0)
        .map(([invId, allocAmt]) => ({
          purchase_invoice_id: invId,
          amount: allocAmt,
        }));

      const created = await purchaseInvoiceService.recordPayment({
        supplier_id: supplierId,
        payment_date: paymentDate,
        amount: numAmount,
        payment_method: paymentMethod,
        reference_number: referenceNumber,
        notes,
        allocations: allocationList,
      });

      navigate(`${ERP_BASE_PATH}/finance/supplier-payments/${created.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to record supplier payment.');
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
          <CreditCard className="w-6 h-6 text-indigo-600" />
          Record Supplier Payment Remittance
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* HEADER INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Supplier <span className="text-rose-500">*</span>
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.supplier_name} ({s.supplier_code})
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
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
              onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="BANK_TRANSFER">Bank Wire / NEFT / RTGS</option>
              <option value="CHEQUE">Cheque / Demand Draft</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other Disbursement Method</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Bank Transaction / Cheque / Ref Number
            </label>
            <input
              type="text"
              placeholder="e.g. UTR-90812371, CHQ-001298"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* INVOICE ALLOCATION SECTION */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Allocate to Open Purchase Invoices</h3>
              <p className="text-xs text-slate-500">Apply payment towards specific outstanding supplier bills</p>
            </div>
            <div className="text-right text-xs">
              <span className="text-slate-500">Unallocated: </span>
              <span className={`font-bold ${unallocatedAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                ₹{unallocatedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {!supplierId ? (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs italic">
              Select a supplier above to view open purchase invoices available for payment allocation.
            </div>
          ) : openInvoices.length === 0 ? (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs">
              No open purchase invoices found for this supplier. The full payment will remain as an unallocated credit on account.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 font-semibold text-slate-500 uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">PINV #</th>
                    <th className="py-2.5 px-3">Bill #</th>
                    <th className="py-2.5 px-3">Invoice Date</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Outstanding</th>
                    <th className="py-2.5 px-3 text-right w-36">Allocate Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {openInvoices.map((inv) => {
                    const currentAlloc = allocations[inv.id] || 0;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-mono font-semibold text-indigo-600">{inv.internal_invoice_number}</td>
                        <td className="py-2 px-3 font-mono text-slate-700">{inv.supplier_invoice_number}</td>
                        <td className="py-2 px-3 text-slate-600">{inv.invoice_date}</td>
                        <td className="py-2 px-3 font-medium text-rose-600">{inv.due_date}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          ₹{inv.outstanding_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            max={inv.outstanding_amount}
                            step="any"
                            placeholder="0.00"
                            value={currentAlloc || ''}
                            onChange={(e) => handleAllocationChange(inv.id, e.target.value, inv.outstanding_amount)}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs text-right font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* NOTES & SUBMIT */}
        <div className="border-t border-slate-200 pt-4 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Payment Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal remittance notes..."
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
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Processing...' : 'Post Supplier Payment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
