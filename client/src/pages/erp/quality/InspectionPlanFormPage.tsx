import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Layers } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { apiClient } from '../../../services/api';
import { qualityService } from '../../../services/quality.service';
import { CharacteristicType } from '../../../types/quality';

interface LocalItem {
  name: string;
  description: string;
  type: CharacteristicType;
  target_value: string;
  min_value: string;
  max_value: string;
  unit: string;
  required: boolean;
}

const InspectionPlanFormPage: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [version, setVersion] = useState('V1');
  const [inspectionType, setInspectionType] = useState<'INCOMING' | 'IN_PROCESS' | 'FINAL' | 'FIRST_ARTICLE'>('INCOMING');
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OBSOLETE'>('ACTIVE');
  const [description, setDescription] = useState('');

  const [items, setItems] = useState<LocalItem[]>([
    { name: 'Outer Diameter (OD)', description: 'Critical fit dimension', type: 'NUMERIC', target_value: '25.00', min_value: '24.95', max_value: '25.05', unit: 'mm', required: true }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/products').then((res) => {
      if (res.data.success) setProducts(res.data.data);
    }).catch(console.error);
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: '', description: '', type: 'NUMERIC', target_value: '', min_value: '', max_value: '', unit: 'mm', required: true }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LocalItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError('Please select a product for this inspection plan.');
      return;
    }
    if (items.length === 0) {
      setError('At least one characteristic item must be defined in the plan.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await qualityService.createInspectionPlan({
        product_id: productId,
        version,
        inspection_type: inspectionType,
        status,
        description,
        items
      });

      if (res.success && res.data) {
        navigate(`/secure-kolmeks-x0y0/quality/inspection-plans/${res.data.id}`);
      }
    } catch (err: any) {
      console.error('Failed to create inspection plan:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create inspection plan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ERPPageHeader
        title="Create Inspection Plan"
        subtitle="Define quality characteristics, nominal values, and engineering tolerances."
        actions={
          <Link
            to="/secure-kolmeks-x0y0/quality/inspection-plans"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Plan Definition</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Product <span className="text-rose-500">*</span>
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">Select Product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Inspection Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={inspectionType}
                onChange={(e: any) => setInspectionType(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="INCOMING">INCOMING Material</option>
                <option value="IN_PROCESS">IN_PROCESS Operation</option>
                <option value="FINAL">FINAL Output</option>
                <option value="FIRST_ARTICLE">FIRST_ARTICLE Sample</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Plan Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description / Purpose</label>
            <input
              type="text"
              placeholder="e.g. Precision CNC Turning Quality Plan V1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* CHARACTERISTICS ITEMS BUILDER */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Inspection Characteristics & Tolerance Specifications
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Characteristic
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Item #{idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Characteristic Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Bore Diameter (OD), Surface Finish (Ra)..."
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                    <select
                      value={item.type}
                      onChange={(e: any) => handleItemChange(idx, 'type', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="NUMERIC">NUMERIC (Tolerance limits)</option>
                      <option value="BOOLEAN">BOOLEAN (Yes/No)</option>
                      <option value="TEXT">TEXT (Observation)</option>
                      <option value="OPTION">OPTION (Pass/Fail)</option>
                    </select>
                  </div>
                </div>

                {item.type === 'NUMERIC' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Target Value</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="25.00"
                        value={item.target_value}
                        onChange={(e) => handleItemChange(idx, 'target_value', e.target.value)}
                        className="w-full px-2.5 py-1 text-sm border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Min Value</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="24.95"
                        value={item.min_value}
                        onChange={(e) => handleItemChange(idx, 'min_value', e.target.value)}
                        className="w-full px-2.5 py-1 text-sm border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Max Value</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="25.05"
                        value={item.max_value}
                        onChange={(e) => handleItemChange(idx, 'max_value', e.target.value)}
                        className="w-full px-2.5 py-1 text-sm border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Unit</label>
                      <input
                        type="text"
                        placeholder="mm / µm"
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="w-full px-2.5 py-1 text-sm border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/secure-kolmeks-x0y0/quality/inspection-plans"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Inspection Plan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InspectionPlanFormPage;
