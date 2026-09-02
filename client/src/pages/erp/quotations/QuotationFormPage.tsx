import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Building2,
  Calendar,
  IndianRupee,
  Boxes,
  FileSpreadsheet,
  Save,
  Send,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { QuotationFormPayload, QuotationItemLine } from '../../../types/quotation';
import { QuotationService } from '../../../services/quotation.service';
import { CustomerService } from '../../../services/customer.service';
import { ProductService } from '../../../services/product.service';
import { RFQService } from '../../../services/rfq.service';
import { Customer } from '../../../types/customer';
import { Product } from '../../../types/product';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Modal } from '../../../components/erp/Modal';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const QuotationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);
  const rfqIdFromQuery = searchParams.get('rfq_id');
  const customerIdFromQuery = searchParams.get('customer_id');

  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Core State
  const [customerId, setCustomerId] = useState<string>(customerIdFromQuery || '');
  const [rfqId, setRfqId] = useState<string | null>(rfqIdFromQuery || null);
  const [quotationDate, setQuotationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [currency, setCurrency] = useState<string>('INR');
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30 Days from Invoice');
  const [deliveryTerms, setDeliveryTerms] = useState<string>('Ex-Works Järvenpää, Finland');
  const [deliveryTime, setDeliveryTime] = useState<string>('4-6 Weeks from Order Confirmation');
  const [terms, setTerms] = useState<string>('Prices valid according to specified validity date.');
  const [notes, setNotes] = useState<string>('');

  // Line Items State
  const [lineItems, setLineItems] = useState<
    Array<{
      product_id: string | null;
      product_name?: string;
      description: string;
      quantity: number;
      unit: string;
      unit_price: number;
      discount_type: 'amount' | 'percentage';
      discount: number;
      tax_rate: number;
    }>
  >([
    {
      product_id: null,
      description: 'Precision Machined Component',
      quantity: 100,
      unit: 'Pcs',
      unit_price: 45.0,
      discount_type: 'amount',
      discount: 0,
      tax_rate: 0,
    },
  ]);

  // Lookup Masters State
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [activeItemIndexForProduct, setActiveItemIndexForProduct] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState<string>('');

  // Load Customers & Products Dropdowns
  useEffect(() => {
    CustomerService.getCustomers({ limit: 100 })
      .then((res) => {
        if (res.success) setCustomersList(res.data);
      })
      .catch((err) => console.warn('Error loading customers:', err));

    ProductService.getProducts({ limit: 100 })
      .then((res) => {
        if (res.success) setProductsList(res.data);
      })
      .catch((err) => console.warn('Error loading products:', err));
  }, []);

  // Pre-populate if launched from RFQ detail page
  useEffect(() => {
    if (!isEditMode && rfqIdFromQuery) {
      RFQService.getRFQById(rfqIdFromQuery)
        .then((res) => {
          if (res.success && res.data) {
            const rfqData = res.data;
            if (rfqData.customer_id) setCustomerId(rfqData.customer_id);
            setRfqId(rfqData.id);

            setLineItems([
              {
                product_id: rfqData.product_id || null,
                description: `${rfqData.component_name} — ${rfqData.description || 'Custom RFQ Manufacturing Requirement'}`,
                quantity: rfqData.quantity || 1,
                unit: rfqData.unit || 'Pcs',
                unit_price: 0,
                discount_type: 'amount',
                discount: 0,
                tax_rate: 0,
              },
            ]);
          }
        })
        .catch((err) => console.warn('Failed pre-populating RFQ details:', err));
    }
  }, [isEditMode, rfqIdFromQuery]);

  // Load existing Quotation for Edit Mode
  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      QuotationService.getQuotationById(id)
        .then((res) => {
          if (res.success && res.data) {
            const q = res.data;
            setCustomerId(q.customer_id);
            setRfqId(q.rfq_id || null);
            setQuotationDate(q.quotation_date);
            setValidUntil(q.valid_until || '');
            setCurrency(q.currency);
            setPaymentTerms(q.payment_terms || '');
            setDeliveryTerms(q.delivery_terms || '');
            setDeliveryTime(q.delivery_time || '');
            setTerms(q.terms || '');
            setNotes(q.notes || '');

            if (q.items && q.items.length > 0) {
              setLineItems(
                q.items.map((item) => ({
                  product_id: item.product_id || null,
                  product_name: item.product_master?.name,
                  description: item.description,
                  quantity: item.quantity,
                  unit: item.unit,
                  unit_price: item.unit_price,
                  discount_type: item.discount_type || 'amount',
                  discount: item.discount,
                  tax_rate: item.tax_rate || 0,
                }))
              );
            }
          }
        })
        .catch((err) => {
          console.error('Error loading quotation for edit:', err);
          setError('Failed to load quotation details.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isEditMode, id]);

  // Interactive Line Items Helper Actions
  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        product_id: null,
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

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) {
      alert('Quotation must contain at least one line item.');
      return;
    }
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSelectProductForLine = (product: Product) => {
    if (activeItemIndexForProduct === null) return;
    setLineItems((prev) => {
      const updated = [...prev];
      updated[activeItemIndexForProduct] = {
        ...updated[activeItemIndexForProduct],
        product_id: product.id,
        product_name: product.name,
        description: `${product.name} (${product.product_code}) - ${product.description || ''}`.trim(),
        unit: product.unit || 'Pcs',
      };
      return updated;
    });
    setIsProductModalOpen(false);
    setActiveItemIndexForProduct(null);
  };

  // Compute Live Totals Summary (Client-side feedback)
  const totalsSummary = React.useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    let tax = 0;

    lineItems.forEach((item) => {
      const qty = Math.max(0, Number(item.quantity) || 0);
      const price = Math.max(0, Number(item.unit_price) || 0);
      const itemSubtotal = qty * price;

      const discVal = Math.max(0, Number(item.discount) || 0);
      let lineDisc = 0;
      if (item.discount_type === 'percentage') {
        lineDisc = (itemSubtotal * discVal) / 100;
      } else {
        lineDisc = Math.min(itemSubtotal, discVal);
      }

      const taxable = Math.max(0, itemSubtotal - lineDisc);
      const taxRate = Math.max(0, Number(item.tax_rate) || 0);
      const lineTax = (taxable * taxRate) / 100;

      subtotal += itemSubtotal;
      discount += lineDisc;
      tax += lineTax;
    });

    const total = Math.max(0, subtotal - discount + tax);

    return {
      subtotal,
      discount,
      tax,
      total,
    };
  }, [lineItems]);

  // Handle Form Submission
  const handleSubmitForm = async (targetStatus: 'DRAFT' | 'UNDER_REVIEW') => {
    if (!customerId) {
      alert('Please select a Customer.');
      return;
    }

    if (lineItems.some((li) => !li.description.trim())) {
      alert('Every line item must have a valid description.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload: QuotationFormPayload = {
      customer_id: customerId,
      rfq_id: rfqId || null,
      quotation_date: quotationDate,
      valid_until: validUntil,
      currency,
      payment_terms: paymentTerms,
      delivery_terms: deliveryTerms,
      delivery_time: deliveryTime,
      terms,
      notes,
      items: lineItems.map((li) => ({
        product_id: li.product_id || null,
        description: li.description.trim(),
        quantity: Number(li.quantity),
        unit: li.unit || 'Pcs',
        unit_price: Number(li.unit_price),
        discount_type: li.discount_type,
        discount: Number(li.discount),
        tax_rate: Number(li.tax_rate),
      })),
    };

    try {
      let res;
      if (isEditMode && id) {
        res = await QuotationService.updateQuotation(id, payload);
        if (targetStatus === 'UNDER_REVIEW') {
          await QuotationService.updateStatus(id, 'UNDER_REVIEW');
        }
      } else {
        res = await QuotationService.createQuotation(payload);
        if (res.success && res.data && targetStatus === 'UNDER_REVIEW') {
          await QuotationService.updateStatus(res.data.id, 'UNDER_REVIEW');
        }
      }

      if (res.success && res.data) {
        navigate(`${ERP_BASE_PATH}/quotations/${res.data.id}`);
      } else {
        setError('Failed to save quotation.');
      }
    } catch (err: any) {
      console.error('Error saving quotation:', err);
      setError(err.response?.data?.message || 'Failed to save quotation record.');
    } fontally: () => {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading quotation builder workspace...</p>
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Commercial Quotation' : 'Create Commercial Quotation'}
          </h1>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSubmitForm('DRAFT')}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSubmitForm('UNDER_REVIEW')}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Submit for Review
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: MASTER SPECS & LINE ITEMS */}
        <div className="lg:col-span-2 space-y-6">
          {/* CUSTOMER & GENERAL INFORMATION */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Customer & Commercial Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* CUSTOMER SELECTOR */}
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">
                  Customer Company <span className="text-red-500">*</span>
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                >
                  <option value="">-- Select Customer Master --</option>
                  {customersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.customer_code}) — {c.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* QUOTATION DATE */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Quotation Date</label>
                <input
                  type="date"
                  value={quotationDate}
                  onChange={(e) => setQuotationDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* VALID UNTIL */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Valid Until (Expiry)</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* CURRENCY SELECTOR */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900"
                >
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              {/* RFQ REF */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">RFQ Reference (Optional)</label>
                <input
                  type="text"
                  value={rfqId || ''}
                  onChange={(e) => setRfqId(e.target.value || null)}
                  placeholder="Linked RFQ UUID or leave blank"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC LINE ITEMS TABLE EDITOR */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Quotation Line Items ({lineItems.length})
              </h2>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Line Item
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, idx) => {
                const qty = Math.max(0, Number(item.quantity) || 0);
                const price = Math.max(0, Number(item.unit_price) || 0);
                const sub = qty * price;
                const discVal = Math.max(0, Number(item.discount) || 0);
                const disc = item.discount_type === 'percentage' ? (sub * discVal) / 100 : Math.min(sub, discVal);
                const taxable = Math.max(0, sub - disc);
                const taxRate = Math.max(0, Number(item.tax_rate) || 0);
                const tax = (taxable * taxRate) / 100;
                const lineTotal = taxable + tax;

                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-700 font-mono">
                        Line #{idx + 1}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveItemIndexForProduct(idx);
                            setIsProductModalOpen(true);
                          }}
                          className="text-[11px] font-medium text-purple-600 hover:text-purple-800 bg-purple-50 px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <Boxes className="w-3 h-3" />
                          {item.product_name ? `Linked: ${item.product_name}` : 'Select Product Master'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                          title="Remove Line Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* DESCRIPTION TEXT AREA */}
                    <div>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Enter item description or custom manufacturing specification..."
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>

                    {/* INPUTS ROW */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-slate-500 font-medium mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 font-medium mb-1">Unit</label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 font-medium mb-1">Unit Price ({currency})</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 font-medium mb-1">Discount</label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.discount}
                            onChange={(e) => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                          />
                          <select
                            value={item.discount_type}
                            onChange={(e) => handleItemChange(idx, 'discount_type', e.target.value)}
                            className="p-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                          >
                            <option value="amount">{currency}</option>
                            <option value="percentage">%</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 font-medium mb-1">Tax Rate (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={item.tax_rate}
                          onChange={(e) => handleItemChange(idx, 'tax_rate', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="text-right text-xs pt-1 border-t border-slate-200/60 flex justify-between items-center text-slate-500">
                      <span>Subtotal: {currency} {sub.toFixed(2)}</span>
                      <span className="font-mono font-bold text-slate-900">
                        Line Total: {currency} {lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TERMS & TOTALS SUMMARY */}
        <div className="space-y-6">
          {/* COMMERCIAL TERMS CARD */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Commercial Terms & Notes
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Delivery Terms</label>
                <input
                  type="text"
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Estimated Lead Time</label>
                <input
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Additional Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions, warranty terms, or notes..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* TOTALS SUMMARY CARD */}
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md space-y-4">
            <h2 className="text-sm font-bold tracking-tight text-slate-100 border-b border-slate-800 pb-3">
              Financial Summary ({currency})
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">
                  {currency} {totalsSummary.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Total Discount</span>
                <span className="font-mono text-amber-400">
                  - {currency} {totalsSummary.discount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Total Tax</span>
                <span className="font-mono text-slate-200">
                  + {currency} {totalsSummary.tax.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="font-bold text-sm text-white">Grand Total</span>
                <span className="font-mono font-extrabold text-lg text-emerald-400">
                  {currency} {totalsSummary.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSubmitForm('UNDER_REVIEW')}
                disabled={isSaving}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
              >
                Submit for Internal Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT SELECTION MODAL */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setActiveItemIndexForProduct(null);
        }}
        title="Select Product Master"
      >
        <div className="space-y-4 text-xs">
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products by code or name..."
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {productsList
              .filter(
                (p) =>
                  p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                  p.product_code.toLowerCase().includes(productSearch.toLowerCase())
              )
              .map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleSelectProductForLine(prod)}
                  className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-800">{prod.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{prod.product_code}</div>
                  </div>
                  <span className="text-purple-600 font-medium">Select</span>
                </div>
              ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
