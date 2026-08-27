import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Search,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Package,
} from 'lucide-react';
import { salesOrderService } from '../../../services/sales_order.service';
import { CustomerService } from '../../../services/customer.service';
import { QuotationService } from '../../../services/quotation.service';
import { ProductService } from '../../../services/product.service';
import { SalesOrderItemLine, SalesOrderFormPayload } from '../../../types/sales_order';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const SalesOrderFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const quotationIdQuery = searchParams.get('quotation_id');
  const isEditMode = Boolean(id);

  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Master Data Options
  const [customers, setCustomers] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Form State
  const [customerId, setCustomerId] = useState<string>('');
  const [quotationId, setQuotationId] = useState<string>(quotationIdQuery || '');
  const [rfqId, setRfqId] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState<string>('');
  const [priority, setPriority] = useState<string>('NORMAL');
  const [currency, setCurrency] = useState<string>('EUR');
  const [customerReference, setCustomerReference] = useState<string>('');
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30 Days');
  const [deliveryTerms, setDeliveryTerms] = useState<string>('FOB Factory');
  const [notes, setNotes] = useState<string>('');

  const [items, setItems] = useState<SalesOrderItemLine[]>([
    {
      description: '',
      quantity: 1,
      unit: 'pcs',
      unit_price: 0,
      discount_type: 'amount',
      discount: 0,
      tax_rate: 0,
    },
  ]);

  // Load Master Data
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [custRes, prodRes, quotRes] = await Promise.all([
          CustomerService.getCustomers({ limit: 100 }),
          ProductService.getProducts({ limit: 100 }),
          QuotationService.getQuotations({ limit: 100, status: 'ACCEPTED' }),
        ]);

        if (custRes.data) setCustomers(custRes.data || []);
        if (prodRes.data) setProducts(prodRes.data || []);
        if (quotRes.data) setQuotations(quotRes.data || []);
      } catch (err) {
        console.warn('Error loading master data:', err);
      }
    };

    fetchMasterData();
  }, []);

  // Load existing Sales Order if Edit Mode
  useEffect(() => {
    if (!isEditMode || !id) return;

    const loadSalesOrder = async () => {
      try {
        setLoading(true);
        const res = await salesOrderService.getSalesOrderById(id);
        if (res.success && res.data) {
          const so = res.data;
          setCustomerId(so.customer_id || '');
          setQuotationId(so.quotation_id || '');
          setRfqId(so.rfq_id || '');
          setOrderDate(so.order_date ? so.order_date.split('T')[0] : new Date().toISOString().split('T')[0]);
          setRequestedDeliveryDate(so.requested_delivery_date ? so.requested_delivery_date.split('T')[0] : '');
          setPriority(so.priority || 'NORMAL');
          setCurrency(so.currency || 'EUR');
          setCustomerReference(so.customer_reference || '');
          setPaymentTerms(so.payment_terms || 'Net 30 Days');
          setDeliveryTerms(so.delivery_terms || 'FOB Factory');
          setNotes(so.notes || '');

          if (so.items && so.items.length > 0) {
            setItems(
              so.items.map((li) => ({
                id: li.id,
                product_id: li.product_id || '',
                description: li.description,
                quantity: Number(li.quantity),
                unit: li.unit || 'pcs',
                unit_price: Number(li.unit_price),
                discount_type: li.discount_type || 'amount',
                discount: Number(li.discount || 0),
                tax_rate: Number(li.tax_rate || 0),
              }))
            );
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load Sales Order for editing.');
      } finally {
        setLoading(false);
      }
    };

    loadSalesOrder();
  }, [id, isEditMode]);

  // Handle Quotation Selection Inheritance
  const handleSelectQuotation = async (selectedQuotId: string) => {
    setQuotationId(selectedQuotId);
    if (!selectedQuotId) return;

    try {
      const qRes = await QuotationService.getQuotationById(selectedQuotId);
      if (qRes.success && qRes.data) {
        const q = qRes.data;
        if (q.customer_id) setCustomerId(q.customer_id);
        if (q.rfq_id) setRfqId(q.rfq_id);
        if (q.currency) setCurrency(q.currency);
        if (q.payment_terms || q.terms) setPaymentTerms(q.payment_terms || q.terms || '');
        if (q.delivery_terms || q.delivery_time) setDeliveryTerms(q.delivery_terms || q.delivery_time || '');
        if (q.notes) setNotes(`Inherited from Quotation ${q.quotation_number}: ${q.notes}`);

        if (q.items && q.items.length > 0) {
          setItems(
            q.items.map((qi: any) => ({
              product_id: qi.product_id || '',
              description: qi.description,
              quantity: Number(qi.quantity),
              unit: qi.unit || 'pcs',
              unit_price: Number(qi.unit_price),
              discount_type: qi.discount_type || 'amount',
              discount: Number(qi.discount || 0),
              tax_rate: Number(qi.tax_rate || 0),
            }))
          );
        }
      }
    } catch (err) {
      console.warn('Failed to load quotation details:', err);
    }
  };

  // Line Item Handlers
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: '',
        quantity: 1,
        unit: 'pcs',
        unit_price: 0,
        discount_type: 'amount',
        discount: 0,
        tax_rate: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof SalesOrderItemLine, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-populate description and price when product is selected
      if (field === 'product_id' && value) {
        const prod = products.find((p) => p.id === value);
        if (prod) {
          updated[index].description = `${prod.name} (${prod.product_code})`;
          if (prod.base_price) {
            updated[index].unit_price = Number(prod.base_price);
          }
        }
      }

      return updated;
    });
  };

  // Live Financial Calculation Summary
  const financialTotals = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    items.forEach((item) => {
      const qty = Math.max(0, Number(item.quantity) || 0);
      const price = Math.max(0, Number(item.unit_price) || 0);
      const lSub = qty * price;

      const discVal = Math.max(0, Number(item.discount) || 0);
      let lDisc = 0;
      if (item.discount_type === 'percentage') {
        lDisc = (lSub * discVal) / 100;
      } else {
        lDisc = Math.min(lSub, discVal);
      }

      const taxable = Math.max(0, lSub - lDisc);
      const taxRate = Math.max(0, Number(item.tax_rate) || 0);
      const lTax = (taxable * taxRate) / 100;

      subtotal += lSub;
      discountTotal += lDisc;
      taxTotal += lTax;
    });

    const grandTotal = subtotal - discountTotal + taxTotal;

    return {
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal: Math.max(0, grandTotal),
    };
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId) {
      setError('Please select a Customer.');
      return;
    }

    if (items.some((it) => !it.description.trim())) {
      setError('All order line items must have a description.');
      return;
    }

    try {
      setSaving(true);

      const payload: SalesOrderFormPayload = {
        customer_id: customerId,
        quotation_id: quotationId || null,
        rfq_id: rfqId || null,
        order_date: orderDate,
        requested_delivery_date: requestedDeliveryDate || null,
        priority,
        currency,
        customer_reference: customerReference,
        payment_terms: paymentTerms,
        delivery_terms: deliveryTerms,
        notes,
        items,
      };

      if (isEditMode && id) {
        const res = await salesOrderService.updateSalesOrder(id, payload);
        if (res.success && res.data) {
          navigate(`${ERP_BASE_PATH}/sales-orders/${id}`);
        } else {
          setError(res.message || 'Failed to update Sales Order.');
        }
      } else {
        const res = await salesOrderService.createSalesOrder(payload);
        if (res.success && res.data) {
          navigate(`${ERP_BASE_PATH}/sales-orders/${res.data.id}`);
        } else {
          setError(res.message || 'Failed to create Sales Order.');
        }
      }
    } catch (err: any) {
      console.error('Error saving sales order:', err);
      setError(err.message || 'Error occurred while saving Sales Order.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-900 mb-3" />
        <p className="text-sm font-semibold">Loading Sales Order Builder Workspace...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/sales-orders`)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditMode ? 'Edit Sales Order' : 'Create Sales Order'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm commercial terms, pricing, and prepare lines for production.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/sales-orders`)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEditMode ? 'Update Sales Order' : 'Save Sales Order'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1: CUSTOMER & SOURCE REFERENCE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 className="w-4 h-4 text-slate-500" />
          Customer & Source Documents
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CUSTOMER SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Customer <span className="text-rose-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="">-- Select Customer Master --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} ({c.customer_code || 'No Code'})
                </option>
              ))}
            </select>
          </div>

          {/* QUOTATION SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Source Quotation (Optional)
            </label>
            <select
              value={quotationId}
              onChange={(e) => handleSelectQuotation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="">-- Independent Sales Order --</option>
              {quotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.quotation_number} ({q.currency} {Number(q.total).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* CUSTOMER REFERENCE (PO #) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Customer Reference / PO #
            </label>
            <input
              type="text"
              placeholder="e.g. PO-987452"
              value={customerReference}
              onChange={(e) => setCustomerReference(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: ORDER DETAILS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-4 h-4 text-slate-500" />
          Order Specifications & Currency
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* ORDER DATE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Order Date</label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* REQUESTED DELIVERY DATE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Req. Delivery Date</label>
            <input
              type="date"
              value={requestedDeliveryDate}
              onChange={(e) => setRequestedDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* PRIORITY */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Order Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* CURRENCY */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Order Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: LINE ITEMS BUILDER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-500" />
            Order Line Items & Pricing
          </h2>

          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Line Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 w-10">#</th>
                <th className="py-3 px-3">Product / Description</th>
                <th className="py-3 px-3 w-28 text-center">Qty</th>
                <th className="py-3 px-3 w-20">Unit</th>
                <th className="py-3 px-3 w-32 text-right">Unit Price ({currency})</th>
                <th className="py-3 px-3 w-32 text-right">Discount</th>
                <th className="py-3 px-3 w-24 text-right">Tax (%)</th>
                <th className="py-3 px-3 w-36 text-right">Line Total</th>
                <th className="py-3 px-3 w-12 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {items.map((item, index) => {
                const qty = Math.max(0, Number(item.quantity) || 0);
                const price = Math.max(0, Number(item.unit_price) || 0);
                const sub = qty * price;

                let discVal = Math.max(0, Number(item.discount) || 0);
                let discAmt = item.discount_type === 'percentage' ? (sub * discVal) / 100 : Math.min(sub, discVal);
                let taxable = Math.max(0, sub - discAmt);
                let taxRate = Math.max(0, Number(item.tax_rate) || 0);
                let taxAmt = (taxable * taxRate) / 100;
                let lineTotal = taxable + taxAmt;

                return (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-semibold text-slate-400 align-top pt-4">{index + 1}</td>

                    {/* PRODUCT / DESCRIPTION */}
                    <td className="py-3 px-3 space-y-2">
                      <select
                        value={item.product_id || ''}
                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                      >
                        <option value="">-- Custom Component / Non-Catalog Item --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.product_code} — {p.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Detailed specification / drawing description..."
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900"
                      />
                    </td>

                    {/* QUANTITY */}
                    <td className="py-3 px-3 align-top pt-4">
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        required
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center text-slate-900"
                      />
                    </td>

                    {/* UNIT */}
                    <td className="py-3 px-3 align-top pt-4">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-center text-slate-700"
                      />
                    </td>

                    {/* UNIT PRICE */}
                    <td className="py-3 px-3 align-top pt-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        required
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-right text-slate-900"
                      />
                    </td>

                    {/* DISCOUNT */}
                    <td className="py-3 px-3 align-top pt-4 space-y-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-right"
                        />
                        <select
                          value={item.discount_type}
                          onChange={(e) => handleItemChange(index, 'discount_type', e.target.value)}
                          className="px-1.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold"
                        >
                          <option value="amount">{currency}</option>
                          <option value="percentage">%</option>
                        </select>
                      </div>
                    </td>

                    {/* TAX RATE */}
                    <td className="py-3 px-3 align-top pt-4">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.tax_rate}
                        onChange={(e) => handleItemChange(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-right text-slate-800"
                      />
                    </td>

                    {/* LINE TOTAL */}
                    <td className="py-3 px-3 font-bold text-right text-slate-900 align-top pt-5">
                      {currency} {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* ACTION */}
                    <td className="py-3 px-3 text-center align-top pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length <= 1}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg disabled:opacity-30 transition-colors"
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

      {/* SECTION 4: TERMS & FINANCIAL SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COMMERCIAL TERMS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Commercial Terms & Internal Notes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Terms</label>
              <input
                type="text"
                placeholder="e.g. Net 30 Days after dispatch"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Delivery Terms</label>
              <input
                type="text"
                placeholder="e.g. Incoterms 2020 DAP Kolmeks Facility"
                value={deliveryTerms}
                onChange={(e) => setDeliveryTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Internal Notes & Special Instructions</label>
            <textarea
              rows={3}
              placeholder="Special manufacturing requirements, packaging details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium resize-none"
            />
          </div>
        </div>

        {/* TOTALS SUMMARY CARD */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold border-b border-slate-800 pb-3">Order Financial Summary</h3>

            <div className="space-y-2.5 pt-4 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-200">
                  {currency} {financialTotals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Total Discount:</span>
                <span className="font-semibold text-amber-400">
                  - {currency} {financialTotals.discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Estimated Tax:</span>
                <span className="font-semibold text-slate-200">
                  + {currency} {financialTotals.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Grand Total:</span>
                <span className="text-xl font-black text-emerald-400">
                  {currency} {financialTotals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            {saving ? 'Processing...' : isEditMode ? 'Update Sales Order' : 'Save & Build Sales Order'}
          </button>
        </div>
      </div>
    </form>
  );
};
