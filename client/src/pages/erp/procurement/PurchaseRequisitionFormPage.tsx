import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ClipboardList,
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
  Sparkles,
} from 'lucide-react';
import { ProcurementService } from '../../../services/procurement.service';
import { ProductService } from '../../../services/product.service';
import { PurchaseRequisitionPriority, PurchaseRequisitionFormPayload } from '../../../types/procurement';
import { Product } from '../../../types/product';
import { ERP_BASE_PATH } from '../../../constants/navigation';

interface RequisitionItemForm {
  product_id: string;
  description: string;
  quantity: number;
  unit: string;
  required_date: string;
  estimated_unit_cost: number;
  notes: string;
}

export const PurchaseRequisitionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Products Master List
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Form Fields
  const [department, setDepartment] = useState<string>('Manufacturing');
  const [requestDate, setRequestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [requiredDate, setRequiredDate] = useState<string>('');
  const [priority, setPriority] = useState<PurchaseRequisitionPriority>('NORMAL');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Line Items
  const [items, setItems] = useState<RequisitionItemForm[]>([
    {
      product_id: '',
      description: '',
      quantity: 1,
      unit: 'pcs',
      required_date: '',
      estimated_unit_cost: 0,
      notes: '',
    },
  ]);

  // Load products list for dropdown picker
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await ProductService.getProducts({ limit: 100, status: 'active' as any });
        if (res.success) {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.warn('Failed to load products list for requisition picker:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Fetch Requisition if in Edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadRequisition = async () => {
        try {
          setLoading(true);
          const pr = await ProcurementService.getRequisitionById(id);
          if (pr) {
            setDepartment(pr.department || 'Manufacturing');
            setRequestDate(pr.request_date || new Date().toISOString().split('T')[0]);
            setRequiredDate(pr.required_date || '');
            setPriority(pr.priority || 'NORMAL');
            setReason(pr.reason || '');
            setNotes(pr.notes || '');

            if (pr.items && pr.items.length > 0) {
              setItems(
                pr.items.map((it) => ({
                  product_id: it.product_id || '',
                  description: it.description || '',
                  quantity: Number(it.quantity) || 1,
                  unit: it.unit || 'pcs',
                  required_date: it.required_date || '',
                  estimated_unit_cost: Number(it.estimated_unit_cost) || 0,
                  notes: it.notes || '',
                }))
              );
            }
          }
        } catch (err: any) {
          console.error('Error fetching requisition for edit:', err);
          setError(err.message || 'Failed to load requisition details.');
        } finally {
          setLoading(false);
        }
      };
      loadRequisition();
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
        required_date: requiredDate || '',
        estimated_unit_cost: 0,
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('Requisition must contain at least one line item.');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof RequisitionItemForm, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };

      // Auto fill description if product is selected
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError('Reason / Purpose of Purchase Requisition is required.');
      return;
    }

    if (items.some((it) => !it.description.trim())) {
      setError('All requisition items must have a clear description.');
      return;
    }

    if (items.some((it) => it.quantity <= 0)) {
      setError('Quantity must be greater than 0 for all items.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: PurchaseRequisitionFormPayload = {
        department,
        request_date: requestDate,
        required_date: requiredDate || null,
        priority,
        reason: reason.trim(),
        notes: notes.trim(),
        items: items.map((it) => ({
          product_id: it.product_id || null,
          description: it.description.trim(),
          quantity: Number(it.quantity),
          unit: it.unit.trim(),
          required_date: it.required_date || requiredDate || null,
          estimated_unit_cost: Number(it.estimated_unit_cost) || 0,
          notes: it.notes.trim(),
        })),
      };

      if (isEditMode && id) {
        const res = await ProcurementService.updateRequisition(id, payload);
        if (res.success) {
          navigate(`${ERP_BASE_PATH}/purchase-requisitions/${id}`);
        }
      } else {
        const res = await ProcurementService.createRequisition(payload);
        if (res.success && res.data) {
          navigate(`${ERP_BASE_PATH}/purchase-requisitions/${res.data.id}`);
        }
      }
    } catch (err: any) {
      console.error('Error saving requisition:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save Purchase Requisition.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-900" />
        Loading Requisition Form...
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
            onClick={() => navigate(`${ERP_BASE_PATH}/purchase-requisitions`)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditMode ? 'Edit Purchase Requisition' : 'Create New Purchase Requisition'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify required items, requested delivery dates, and department justification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/purchase-requisitions`)}
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
            {saving ? 'Saving...' : isEditMode ? 'Update Requisition' : 'Save Requisition'}
          </button>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* GENERAL INFORMATION CARD */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-600" />
          Requisition General Header
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* DEPARTMENT */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Requesting Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              required
            >
              <option value="Manufacturing">Manufacturing</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Supply Chain">Supply Chain</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Engineering">Engineering</option>
              <option value="Administration">Administration</option>
            </select>
          </div>

          {/* PRIORITY */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority <span className="text-rose-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PurchaseRequisitionPriority)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* REQUEST DATE */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Request Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              required
            />
          </div>

          {/* REQUIRED DATE */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Required By Date</label>
            <input
              type="date"
              value={requiredDate}
              onChange={(e) => setRequiredDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* REASON / PURPOSE */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason / Purpose of Procurement <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Raw Bar Stock replenishment for CNC Machining Job SO-2026-004..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            required
          />
        </div>
      </div>

      {/* REQUISITION LINE ITEMS BUILDER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-600" />
            Requested Requisition Items
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
          {items.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200/80 pb-2">
                <span>Line Item #{index + 1}</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {/* PRODUCT MASTER PICKER */}
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Select Product (Optional Master)
                  </label>
                  <select
                    value={item.product_id}
                    onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  >
                    <option value="">Custom Item / Service (Manual)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.product_code ? `[${p.product_code}] ` : ''}
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DESCRIPTION */}
                <div className="lg:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Item Description / Specification <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Item description, grade, size, or material spec..."
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>

                {/* QUANTITY */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Quantity <span className="text-rose-500">*</span>
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
                    placeholder="pcs, kg, m, set"
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>

                {/* ESTIMATED UNIT COST */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Est. Unit Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.estimated_unit_cost}
                    onChange={(e) => handleItemChange(index, 'estimated_unit_cost', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>

                {/* REQUIRED DATE */}
                <div className="lg:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Line Required Date</label>
                  <input
                    type="date"
                    value={item.required_date}
                    onChange={(e) => handleItemChange(index, 'required_date', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADDITIONAL NOTES */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-600" />
          Requisition Notes & Instructions
        </h2>
        <textarea
          rows={3}
          placeholder="Additional notes for purchasing officer, approved vendors list, or special delivery instructions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
        />
      </div>
    </form>
  );
};
