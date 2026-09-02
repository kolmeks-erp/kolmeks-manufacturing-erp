import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingCart,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Package,
  Calendar,
  Building2,
  FileText,
  Clock,
  Calculator,
  IndianRupee,
} from 'lucide-react';
import { ProcurementService } from '../../../services/procurement.service';
import { SupplierService } from '../../../services/supplier.service';
import { ProductService } from '../../../services/product.service';
import { PurchaseOrderFormPayload, PurchaseRequisition } from '../../../types/procurement';
import { Supplier } from '../../../types/supplier';
import { Product } from '../../../types/product';
import { ERP_BASE_PATH } from '../../../constants/navigation';

interface POItemForm {
  product_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_type: 'amount' | 'percentage';
  discount: number;
  tax_rate: number;
}

export const PurchaseOrderFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Master Data Lists
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [approvedPRs, setApprovedPRs] = useState<PurchaseRequisition[]>([]);

  // Form Header States
  const [supplierId, setSupplierId] = useState<string>('');
  const [requisitionId, setRequisitionId] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expectedDelivery, setExpectedDelivery] = useState<string>('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [currency, setCurrency] = useState<string>('INR');
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30 Days');
  const [deliveryTerms, setDeliveryTerms] = useState<string>('FOB Factory');
  const [supplierReference, setSupplierReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Items
  const [items, setItems] = useState<POItemForm[]>([
    {
      product_id: '',
      description: '',
      quantity: 1,
      unit: 'pcs',
      unit_price: 0,
      discount_type: 'amount',
      discount: 0,
      tax_rate: 0,
    },
  ]);

  // Load suppliers, products, and approved requisitions
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [suppRes, prodRes, prRes] = await Promise.all([
          SupplierService.getSuppliers({ limit: 100, status: 'active' }),
          ProductService.getProducts({ limit: 100, status: 'active' as any }),
          ProcurementService.getRequisitions({ status: 'APPROVED', limit: 100 }),
        ]);

        if (suppRes.success) setSuppliers(suppRes.data || []);
        if (prodRes.success) setProducts(prodRes.data || []);
        if (prRes.success) setApprovedPRs(prRes.data || []);
      } catch (err) {
        console.warn('Failed to load master data for PO form:', err);
      }
    };
    loadMasters();
  }, []);

  // Fetch PO for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadPO = async () => {
        try {
          setLoading(true);
          const po = await ProcurementService.getPurchaseOrderById(id);
          if (po) {
            setSupplierId(po.supplier_id || '');
            setRequisitionId(po.requisition_id || '');
            setOrderDate(po.order_date || new Date().toISOString().split('T')[0]);
            setExpectedDelivery(po.expected_delivery || '');
            setPriority(po.priority || 'NORMAL');
            setCurrency(po.currency || 'INR');
            setPaymentTerms(po.payment_terms || 'Net 30 Days');
            setDeliveryTerms(po.delivery_terms || 'FOB Factory');
            setSupplierReference(po.supplier_reference || '');
            setNotes(po.notes || '');

            if (po.items && po.items.length > 0) {
              setItems(
                po.items.map((it) => ({
                  product_id: it.product_id || '',
                  description: it.description || '',
                  quantity: Number(it.quantity) || 1,
                  unit: it.unit || 'pcs',
                  unit_price: Number(it.unit_price) || 0,
                  discount_type: it.discount_type || 'amount',
                  discount: Number(it.discount) || 0,
                  tax_rate: Number(it.tax_rate) || 0,
                }))
              );
            }
          }
        } catch (err: any) {
          console.error('Error fetching PO for edit:', err);
          setError(err.message || 'Failed to load Purchase Order details.');
        } finally {
          setLoading(false);
        }
      };
      loadPO();
    }
  }, [isEditMode, id]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        product_id: '',
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
    if (items.length <= 1) {
      alert('Purchase Order must contain at least one line item.');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof POItemForm, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };

      if (field === 'product_id' && value) {
        const prod = products.find((p) => p.id === value);
        if (prod) {
          copy[index].description = prod.name;
          copy[index].unit = prod.unit || 'pcs';
        }
      }

      return copy;
    });
  };

  // Financial Calculations Preview
  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    items.forEach((it) => {
      const qty = Math.max(0, Number(it.quantity) || 0);
      const price = Math.max(0, Number(it.unit_price) || 0);
      const lineSub = qty * price;

      let lineDisc = 0;
      if (it.discount_type === 'percentage') {
        lineDisc = (lineSub * (Number(it.discount) || 0)) / 100;
      } else {
        lineDisc = Math.min(lineSub, Number(it.discount) || 0);
      }

      const taxable = Math.max(0, lineSub - lineDisc);
      const lineTax = (taxable * (Number(it.tax_rate) || 0)) / 100;

      subtotal += lineSub;
      discountTotal += lineDisc;
      taxTotal += lineTax;
    });

    const grandTotal = subtotal - discountTotal + taxTotal;

    return {
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      setError('Supplier selection is required.');
      return;
    }

    if (items.some((it) => !it.description.trim())) {
      setError('All PO line items must have a description.');
      return;
    }

    if (items.some((it) => it.quantity <= 0)) {
      setError('Quantity must be greater than 0 for all items.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: PurchaseOrderFormPayload = {
        supplier_id: supplierId,
        requisition_id: requisitionId || null,
        order_date: orderDate,
        expected_delivery: expectedDelivery || null,
        priority,
        currency,
        payment_terms: paymentTerms,
        delivery_terms: deliveryTerms,
        supplier_reference: supplierReference.trim(),
        notes: notes.trim(),
        items: items.map((it) => ({
          product_id: it.product_id || null,
          description: it.description.trim(),
          quantity: Number(it.quantity),
          unit: it.unit.trim(),
          unit_price: Number(it.unit_price) || 0,
          discount_type: it.discount_type,
          discount: Number(it.discount) || 0,
          tax_rate: Number(it.tax_rate) || 0,
        })),
      };

      if (isEditMode && id) {
        const res = await ProcurementService.updatePurchaseOrder(id, payload);
        if (res.success) {
          navigate(`${ERP_BASE_PATH}/purchase-orders/${id}`);
        }
      } else {
        const res = await ProcurementService.createPurchaseOrder(payload);
        if (res.success && res.data) {
          navigate(`${ERP_BASE_PATH}/purchase-orders/${res.data.id}`);
        }
      }
    } catch (err: any) {
      console.error('Error saving PO:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save Purchase Order.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-900" />
        Loading Purchase Order Form...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/purchase-orders`)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditMode ? 'Edit Purchase Order' : 'Create New Purchase Order'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Build vendor purchase order, set unit pricing, line discounts, tax rates, and payment terms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/purchase-orders`)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Order...' : isEditMode ? 'Update Purchase Order' : 'Save Purchase Order'}
          </button>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* SUPPLIER & REQUISITION SELECTION CARD */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-600" />
          Vendor & Reference Header
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SUPPLIER PICKER */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Vendor / Supplier <span className="text-rose-500">*</span>
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              required
            >
              <option value="">-- Choose Vendor --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.company_name} ({s.supplier_code || 'No Code'})
                </option>
              ))}
            </select>
          </div>

          {/* REQUISITION PICKER */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Source Purchase Requisition (Optional)
            </label>
            <select
              value={requisitionId}
              onChange={(e) => setRequisitionId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="">-- Standalone Manual PO --</option>
              {approvedPRs.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.requisition_number} ({pr.department})
                </option>
              ))}
            </select>
          </div>

          {/* CURRENCY */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Currency <span className="text-rose-500">*</span>
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="INR">INR (₹)</option>
              <option value="INR">INR (₹)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          {/* PRIORITY */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* ORDER DATE */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Order Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              required
            />
          </div>

          {/* EXPECTED DELIVERY */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
            <input
              type="date"
              value={expectedDelivery}
              onChange={(e) => setExpectedDelivery(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* PAYMENT TERMS */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
            <input
              type="text"
              placeholder="e.g. Net 30 Days, 50% Advance"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* DELIVERY TERMS / INCOTERMS */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Terms / Incoterms</label>
            <input
              type="text"
              placeholder="e.g. FOB Factory, DAP Kolmeks Site"
              value={deliveryTerms}
              onChange={(e) => setDeliveryTerms(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* SUPPLIER REFERENCE */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor Reference / Quote #</label>
          <input
            type="text"
            placeholder="e.g. Vendor Quotation Ref VQ-88492"
            value={supplierReference}
            onChange={(e) => setSupplierReference(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
          />
        </div>
      </div>

      {/* LINE ITEMS TABLE BUILDER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-600" />
            Commercial Line Items
          </h2>

          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Line Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const lineSub = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
            let lineDisc = 0;
            if (item.discount_type === 'percentage') {
              lineDisc = (lineSub * (Number(item.discount) || 0)) / 100;
            } else {
              lineDisc = Math.min(lineSub, Number(item.discount) || 0);
            }
            const taxable = Math.max(0, lineSub - lineDisc);
            const lineTax = (taxable * (Number(item.tax_rate) || 0)) / 100;
            const lineTotal = taxable + lineTax;

            return (
              <div
                key={index}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200/80 pb-2">
                  <span>Line Item #{index + 1}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 font-normal">
                      Line Total: <strong className="text-slate-900">{currency} {lineTotal.toFixed(2)}</strong>
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-rose-600 hover:text-rose-700 p-1 rounded-md hover:bg-rose-100 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                  {/* PRODUCT MASTER PICKER */}
                  <div className="lg:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Product Master (Optional)
                    </label>
                    <select
                      value={item.product_id}
                      onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    >
                      <option value="">Custom Item / Service</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="lg:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Description <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Line item description..."
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* QUANTITY */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Qty <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* UNIT */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit</label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  {/* UNIT PRICE */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Unit Price ({currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* DISCOUNT TYPE */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Disc Type</label>
                    <select
                      value={item.discount_type}
                      onChange={(e) => handleItemChange(index, 'discount_type', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    >
                      <option value="amount">Amount ({currency})</option>
                      <option value="percentage">Percent (%)</option>
                    </select>
                  </div>

                  {/* DISCOUNT VALUE */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Discount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  {/* TAX RATE */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.tax_rate}
                      onChange={(e) => handleItemChange(index, 'tax_rate', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  {/* LINE TOTAL PREVIEW */}
                  <div className="flex flex-col justify-end">
                    <div className="px-3 py-1.5 bg-slate-200/70 rounded-lg text-xs font-bold text-slate-800 text-right">
                      {currency} {lineTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FINANCIAL SUMMARY & NOTES CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            Order Notes & Terms
          </h2>
          <textarea
            rows={4}
            placeholder="Special commercial terms, shipping location, vendor instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
          />
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-900 shadow-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-slate-200 border-b border-slate-800 pb-3">
            <Calculator className="w-4 h-4 text-emerald-400" />
            Financial Breakdown ({currency})
          </h2>

          <div className="space-y-2 text-xs font-medium text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-white">
                {currency} {totals.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Discount Amount:</span>
              <span>
                - {currency} {totals.discountTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-cyan-400">
              <span>Tax Amount:</span>
              <span>
                + {currency} {totals.taxTotal.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-bold text-emerald-400">
              <span>Grand Total:</span>
              <span>
                {currency} {totals.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
