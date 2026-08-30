import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, FileText, Calculator } from 'lucide-react';
import { salesInvoiceService } from '../../../services/sales_invoice.service';
import { CustomerService } from '../../../services/customer.service';
import { productService } from '../../../services/product.service';
import { salesOrderService } from '../../../services/sales_order.service';
import { Customer } from '../../../types/customer';
import { Product } from '../../../types/product';
import { SalesOrder } from '../../../types/sales_order';
import { ERP_BASE_PATH } from '../../../constants/navigation';

interface LineItem {
  product_id: string;
  sales_order_item_id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_type: 'amount' | 'percentage';
  discount: number;
  tax_rate: number;
}

export const InvoiceFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const soId = searchParams.get('so_id');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);

  const [customerId, setCustomerId] = useState<string>('');
  const [salesOrderId, setSalesOrderId] = useState<string>(soId || '');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30');
  const [billingAddress, setBillingAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [lines, setLines] = useState<LineItem[]>([
    {
      product_id: '',
      description: '',
      quantity: 1,
      unit: 'Pcs',
      unit_price: 0,
      discount_type: 'amount',
      discount: 0,
      tax_rate: 0,
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [custRes, prodRes, soRes] = await Promise.all([
          CustomerService.getCustomers({ status: 'active' }),
          productService.getProducts({ status: 'active' }),
          salesOrderService.getSalesOrders({ status: 'CONFIRMED' }),
        ]);

        const prodList = prodRes.data || [];
        const soList = soRes.data || [];

        setCustomers(custRes.data || []);
        setProducts(prodList);
        setSalesOrders(soList);

        // Pre-fill from Sales Order if provided
        if (soId) {
          const targetSo = soList.find((so: SalesOrder) => so.id === soId);
          if (targetSo) {
            setCustomerId(targetSo.customer_id);
            setBillingAddress(targetSo.delivery_terms || targetSo.notes || '');
            if (targetSo.items && targetSo.items.length > 0) {
              const prefLines: LineItem[] = targetSo.items.map((item: any) => ({
                product_id: item.product_id || '',
                sales_order_item_id: item.id,
                description: item.description || item.product_master?.name || 'Line Item',
                quantity: item.quantity,
                unit: item.unit || 'Pcs',
                unit_price: item.unit_price,
                discount_type: item.discount_type || 'amount',
                discount: item.discount || 0,
                tax_rate: item.tax_rate || 0,
              }));
              setLines(prefLines);
            }
          }
        }
      } catch (err: any) {
        setError('Failed to initialize invoice form master data.');
      }
    };

    loadMasters();

    // Default due date = 30 days from today
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDueDate(d.toISOString().split('T')[0]);
  }, [soId]);

  // Customer selection change
  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const selectedCust = customers.find((c) => c.id === id);
    if (selectedCust) {
      setBillingAddress(selectedCust.billing_address || '');
      setPaymentTerms(selectedCust.payment_terms || 'Net 30');
    }
  };

  // Product line change
  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    const updated = [...lines];
    updated[index].product_id = prodId;
    if (prod) {
      updated[index].description = prod.name;
      updated[index].unit_price = prod.unit_price || 0;
      updated[index].unit = prod.unit_of_measure || 'Pcs';
    }
    setLines(updated);
  };

  const updateLine = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        product_id: '',
        description: '',
        quantity: 1,
        unit: 'Pcs',
        unit_price: 0,
        discount_type: 'amount',
        discount: 0,
        tax_rate: 0,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  // Calculation helpers
  const calculateLineTotal = (line: LineItem) => {
    const qty = parseFloat(line.quantity as any) || 0;
    const price = parseFloat(line.unit_price as any) || 0;
    const disc = parseFloat(line.discount as any) || 0;
    const taxRate = parseFloat(line.tax_rate as any) || 0;

    let discVal = line.discount_type === 'percentage' ? (qty * price * disc) / 100 : disc;
    const sub = qty * price - discVal;
    const tax = (sub * taxRate) / 100;
    return sub + tax;
  };

  const subtotal = lines.reduce((acc, l) => acc + (l.quantity * l.unit_price), 0);
  const totalTax = lines.reduce((acc, l) => {
    const sub = l.quantity * l.unit_price - (l.discount_type === 'percentage' ? (l.quantity * l.unit_price * l.discount) / 100 : l.discount);
    return acc + (sub * (l.tax_rate || 0)) / 100;
  }, 0);
  const grandTotal = lines.reduce((acc, l) => acc + calculateLineTotal(l), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('Please select a customer.');
      return;
    }
    if (!dueDate) {
      setError('Please set a valid payment due date.');
      return;
    }
    if (lines.some((l) => !l.description.trim() || l.quantity <= 0)) {
      setError('All lines must have a valid description and positive quantity.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const invoiceData = {
        customer_id: customerId,
        sales_order_id: salesOrderId || undefined,
        invoice_date: invoiceDate,
        due_date: dueDate,
        payment_terms: paymentTerms,
        billing_address: billingAddress,
        notes,
        lines: lines.map((l) => {
          const qty = l.quantity || 0;
          const price = l.unit_price || 0;
          const disc = l.discount_type === 'percentage' ? (qty * price * l.discount) / 100 : l.discount;
          const line_subtotal = qty * price - disc;
          const tax_amount = (line_subtotal * (l.tax_rate || 0)) / 100;
          const line_total = line_subtotal + tax_amount;
          return {
            ...l,
            tax_amount,
            line_subtotal,
            line_total,
          };
        }),
      };

      const created = await salesInvoiceService.createInvoice(invoiceData);
      navigate(`${ERP_BASE_PATH}/sales/invoices/${created.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to create sales invoice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </button>
        <h1 className="text-xl font-bold text-slate-900">Create New Sales Invoice</h1>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* HEADER INFORMATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Customer <span className="text-rose-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
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
              Sales Order Ref (Optional)
            </label>
            <select
              value={salesOrderId}
              onChange={(e) => setSalesOrderId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Direct Invoice (No Sales Order)</option>
              {salesOrders.map((so) => (
                <option key={so.id} value={so.id}>
                  {so.order_number} ({so.customer_master?.company_name || 'Customer'})
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
              Payment Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Payment Terms
            </label>
            <input
              type="text"
              placeholder="e.g. Net 30, Due on Receipt"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Billing Address
            </label>
            <input
              type="text"
              placeholder="Customer billing address"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* INVOICE LINE ITEMS TABLE */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              Invoice Line Items
            </h2>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-2.5 px-3 w-1/4">Product</th>
                  <th className="py-2.5 px-3 w-1/4">Description</th>
                  <th className="py-2.5 px-3 w-20">Qty</th>
                  <th className="py-2.5 px-3 w-28">Unit Price</th>
                  <th className="py-2.5 px-3 w-20">Tax %</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                  <th className="py-2.5 px-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3">
                      <select
                        value={line.product_id}
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      >
                        <option value="">Custom / Service</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.product_code || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => updateLine(idx, 'description', e.target.value)}
                        placeholder="Description..."
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={line.quantity}
                        onChange={(e) => updateLine(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-center"
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={line.unit_price}
                        onChange={(e) => updateLine(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-right"
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={line.tax_rate}
                        onChange={(e) => updateLine(idx, 'tax_rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-center"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 text-xs">
                      ₹{calculateLineTotal(line).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        disabled={lines.length === 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY TOTALS */}
        <div className="flex flex-col md:flex-row justify-between items-start pt-4 border-t border-slate-200 gap-6">
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Invoice Notes / Special Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Internal notes or terms to print on invoice..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="w-full md:w-80 bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">
                ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Tax Total:</span>
              <span className="font-semibold text-slate-900">
                ₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>Total Amount:</span>
              <span className="text-indigo-600">
                ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
            {saving ? 'Saving Draft...' : 'Save Draft Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};
