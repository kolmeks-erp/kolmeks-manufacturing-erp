import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, ShieldAlert, CheckCircle } from 'lucide-react';
import { purchaseInvoiceService } from '../../../services/purchase_invoice.service';
import { SupplierService } from '../../../services/supplier.service';
import { ProcurementService } from '../../../services/procurement.service';
import { GrnService } from '../../../services/grn.service';
import { Supplier } from '../../../types/supplier';
import { PurchaseOrder } from '../../../types/procurement';
import { GoodsReceipt } from '../../../types/grn';
import { PurchaseInvoiceLine } from '../../../types/purchase_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const PurchaseInvoiceFormPage: React.FC = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [grns, setGrns] = useState<GoodsReceipt[]>([]);

  // Form Header State
  const [supplierId, setSupplierId] = useState('');
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [grnId, setGrnId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [notes, setNotes] = useState('');

  // Form Lines State
  const [lines, setLines] = useState<Partial<PurchaseInvoiceLine>[]>([
    {
      description: '',
      ordered_quantity: 0,
      received_quantity: 0,
      quantity: 1,
      unit: 'Pcs',
      po_unit_price: 0,
      unit_price: 0,
      discount: 0,
      tax_rate: 0,
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Suppliers
  useEffect(() => {
    SupplierService.getSuppliers({ status: 'active' })
      .then((res) => setSuppliers(res.data || []))
      .catch(console.error);
  }, []);

  // Fetch POs & GRNs when Supplier is selected
  useEffect(() => {
    if (!supplierId) {
      setPurchaseOrders([]);
      setGrns([]);
      return;
    }

    // Default payment terms from supplier
    const selectedSupp = suppliers.find((s) => s.id === supplierId);
    if (selectedSupp?.payment_terms) {
      setPaymentTerms(selectedSupp.payment_terms);
    }

    // Auto-calculate Due Date based on payment terms
    const d = new Date(invoiceDate);
    d.setDate(d.getDate() + 30);
    setDueDate(d.toISOString().split('T')[0]);

    ProcurementService.getPurchaseOrders()
      .then((res) => {
        const pos = res.data || [];
        setPurchaseOrders(pos.filter((p: any) => p.supplier_id === supplierId && p.status !== 'CANCELLED'));
      })
      .catch(console.error);

    GrnService.getGoodsReceipts()
      .then((res) => {
        const gList = res.data || [];
        setGrns(gList.filter((g: any) => g.supplier_id === supplierId));
      })
      .catch(console.error);
  }, [supplierId, invoiceDate]);

  // Load PO Items into lines when PO is selected
  const handleSelectPO = async (poId: string) => {
    setPurchaseOrderId(poId);
    if (!poId) return;
    try {
      const po = await ProcurementService.getPurchaseOrderById(poId);
      if (po && po.items) {
        const autoLines = po.items.map((item: any) => ({
          purchase_order_item_id: item.id,
          product_id: item.product_id,
          description: item.description || item.product?.name || 'Item',
          ordered_quantity: item.ordered_quantity,
          received_quantity: item.received_quantity || item.ordered_quantity,
          quantity: item.received_quantity || item.ordered_quantity,
          unit: item.unit || 'Pcs',
          po_unit_price: item.unit_price,
          unit_price: item.unit_price,
          discount: 0,
          tax_rate: 0,
        }));
        setLines(autoLines);
      }
    } catch (err) {
      console.error('Error fetching PO details:', err);
    }
  };

  const handleLineChange = (index: number, field: keyof PurchaseInvoiceLine, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        description: '',
        ordered_quantity: 0,
        received_quantity: 0,
        quantity: 1,
        unit: 'Pcs',
        po_unit_price: 0,
        unit_price: 0,
        discount: 0,
        tax_rate: 0,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedSubtotal = lines.reduce((acc, l) => {
    const qty = parseFloat(l.quantity as any) || 0;
    const price = parseFloat(l.unit_price as any) || 0;
    const disc = parseFloat(l.discount as any) || 0;
    return acc + (qty * price - disc);
  }, 0);

  const calculatedTax = lines.reduce((acc, l) => {
    const qty = parseFloat(l.quantity as any) || 0;
    const price = parseFloat(l.unit_price as any) || 0;
    const disc = parseFloat(l.discount as any) || 0;
    const taxRate = parseFloat(l.tax_rate as any) || 0;
    const sub = qty * price - disc;
    return acc + (sub * taxRate) / 100;
  }, 0);

  const calculatedTotal = calculatedSubtotal + calculatedTax;

  // Check 3-way match preview
  const hasVariance = lines.some((l) => {
    const qty = parseFloat(l.quantity as any) || 0;
    const recQty = parseFloat(l.received_quantity as any) || parseFloat(l.ordered_quantity as any) || qty;
    const price = parseFloat(l.unit_price as any) || 0;
    const poPrice = parseFloat(l.po_unit_price as any) || price;
    return Math.abs(qty - recQty) > 0.001 || Math.abs(price - poPrice) > 0.001;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      setError('Please select a supplier.');
      return;
    }
    if (!supplierInvoiceNumber.trim()) {
      setError('Please enter the Supplier Invoice / Bill Number.');
      return;
    }
    if (!dueDate) {
      setError('Please specify the Invoice Due Date.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const created = await purchaseInvoiceService.createInvoice({
        supplier_id: supplierId,
        supplier_invoice_number: supplierInvoiceNumber.trim(),
        purchase_order_id: purchaseOrderId || undefined,
        grn_id: grnId || undefined,
        invoice_date: invoiceDate,
        due_date: dueDate,
        payment_terms: paymentTerms,
        notes,
        lines: lines as any,
      });

      navigate(`${ERP_BASE_PATH}/purchases/invoices/${created.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to record supplier purchase invoice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </button>
        <h1 className="text-xl font-bold text-slate-900">Record Supplier Purchase Invoice</h1>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* 3-WAY MATCH PREVIEW WARNING */}
      {hasVariance && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">3-Way Match Variance Detected</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              The invoiced quantities or prices differ from PO/GRN expectations. This invoice will be submitted with status{' '}
              <span className="font-bold">PENDING_REVIEW</span> for finance manager review before posting.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* HEADER INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              Supplier Bill / Invoice # <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. INV-90023, BILL-781"
              value={supplierInvoiceNumber}
              onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-mono font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Link Purchase Order (PO)
            </label>
            <select
              value={purchaseOrderId}
              onChange={(e) => handleSelectPO(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
              disabled={!supplierId}
            >
              <option value="">-- Direct Invoice / No PO --</option>
              {purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.po_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Link Goods Receipt (GRN)
            </label>
            <select
              value={grnId}
              onChange={(e) => setGrnId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
              disabled={!supplierId}
            >
              <option value="">-- Select GRN --</option>
              {grns.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.grn_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Invoice Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-semibold text-rose-600"
              required
            />
          </div>
        </div>

        {/* LINE ITEMS TABLE */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Line Items (3-Way Match Validation)</h3>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="w-4 h-4" /> Add Line
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 font-semibold text-slate-600 uppercase border-b border-slate-200">
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-center w-24">Invoiced Qty</th>
                  <th className="py-2.5 px-3 text-center w-24">GRN Qty</th>
                  <th className="py-2.5 px-3 text-right w-28">Invoiced Price (₹)</th>
                  <th className="py-2.5 px-3 text-right w-28">PO Price (₹)</th>
                  <th className="py-2.5 px-3 text-center w-20">Tax %</th>
                  <th className="py-2.5 px-3 text-right w-32">Total (₹)</th>
                  <th className="py-2.5 px-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lines.map((line, idx) => {
                  const qty = parseFloat(line.quantity as any) || 0;
                  const price = parseFloat(line.unit_price as any) || 0;
                  const taxRate = parseFloat(line.tax_rate as any) || 0;
                  const lineTot = (qty * price) * (1 + taxRate / 100);

                  const isQtyVar = Math.abs(qty - (line.received_quantity || line.ordered_quantity || qty)) > 0.001;
                  const isPriceVar = Math.abs(price - (line.po_unit_price || price)) > 0.001;

                  return (
                    <tr key={idx} className={isQtyVar || isPriceVar ? 'bg-amber-50/50' : ''}>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={line.description || ''}
                          onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                          placeholder="Item description..."
                          className="w-full p-1.5 border border-slate-300 rounded text-xs"
                          required
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0.0001"
                          step="any"
                          value={line.quantity || ''}
                          onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                          className={`w-full p-1.5 border rounded text-xs text-center font-semibold ${
                            isQtyVar ? 'border-amber-500 text-amber-900 bg-amber-100' : 'border-slate-300'
                          }`}
                          required
                        />
                      </td>
                      <td className="py-2 px-3 text-center font-medium text-slate-500">
                        {line.received_quantity || line.ordered_quantity || '-'}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={line.unit_price || ''}
                          onChange={(e) => handleLineChange(idx, 'unit_price', e.target.value)}
                          className={`w-full p-1.5 border rounded text-xs text-right font-semibold ${
                            isPriceVar ? 'border-amber-500 text-amber-900 bg-amber-100' : 'border-slate-300'
                          }`}
                          required
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-500">
                        ₹{line.po_unit_price?.toLocaleString() || '-'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={line.tax_rate || 0}
                          onChange={(e) => handleLineChange(idx, 'tax_rate', e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs text-center"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{lineTot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY & ACTIONS */}
        <div className="border-t border-slate-200 pt-4 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Invoice Notes & Internal References
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal supplier notes..."
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="w-full md:w-72 space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">₹{calculatedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Taxes:</span>
              <span className="font-semibold text-slate-900">₹{calculatedTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>Total Bill Amount:</span>
              <span className="text-indigo-600">₹{calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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
            {saving ? 'Recording...' : 'Record Purchase Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};
