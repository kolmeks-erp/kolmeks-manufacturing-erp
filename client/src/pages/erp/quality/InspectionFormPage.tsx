import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { apiClient } from '../../../services/api';
import { qualityService } from '../../../services/quality.service';
import { InspectionType, InspectionPlan } from '../../../types/quality';

const InspectionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const prefillGrnId = searchParams.get('grnId');
  const prefillProdId = searchParams.get('productionOrderId');

  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<InspectionPlan[]>([]);

  const [inspectionType, setInspectionType] = useState<'INCOMING' | 'IN_PROCESS' | 'FINAL' | 'FIRST_ARTICLE'>('INCOMING');
  const [productId, setProductId] = useState('');
  const [grnId, setGrnId] = useState(prefillGrnId || '');
  const [productionOrderId, setProductionOrderId] = useState(prefillProdId || '');
  const [inspectionPlanId, setInspectionPlanId] = useState('');
  const [quantityInspected, setQuantityInspected] = useState<number>(1);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch products
    apiClient.get('/products').then((res) => {
      if (res.data.success) setProducts(res.data.data);
    }).catch(console.error);

    // Fetch active inspection plans
    qualityService.getInspectionPlans({ status: 'ACTIVE' }).then((res) => {
      if (res.success) setPlans(res.data);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError('Please select a product to inspect.');
      return;
    }
    if (quantityInspected <= 0) {
      setError('Quantity inspected must be greater than zero.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await qualityService.createInspection({
        inspection_type: inspectionType,
        product_id: productId,
        grn_id: grnId || undefined,
        production_order_id: productionOrderId || undefined,
        inspection_plan_id: inspectionPlanId || undefined,
        quantity_inspected: quantityInspected,
        notes
      });

      if (res.success && res.data) {
        navigate(`/secure-kolmeks-x0y0/quality/inspections/${res.data.id}`);
      }
    } catch (err: any) {
      console.error('Failed to create inspection:', err);
      setError(err.response?.data?.message || err.message || 'Unable to create quality inspection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ERPPageHeader
        title="Create Quality Inspection"
        subtitle="Initiate quality verification for incoming components or manufactured output."
        actions={
          <Link
            to="/secure-kolmeks-x0y0/quality/inspections"
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inspection Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Inspection Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={inspectionType}
              onChange={(e: any) => setInspectionType(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="INCOMING">INCOMING — Raw Material / Supplier Part</option>
              <option value="IN_PROCESS">IN_PROCESS — Machining / Sub-assembly Operation</option>
              <option value="FINAL">FINAL — Finished Motor / Pump Output</option>
              <option value="FIRST_ARTICLE">FIRST_ARTICLE — FAI Pre-production Sample</option>
            </select>
          </div>

          {/* Product Selection */}
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
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Inspection Plan Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Inspection Template Plan (Optional)
            </label>
            <select
              value={inspectionPlanId}
              onChange={(e) => setInspectionPlanId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">No Plan (Manual Characteristics)</option>
              {plans
                .filter((pl) => !productId || pl.product_id === productId)
                .map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.plan_number} — {pl.description || pl.version}
                  </option>
                ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Selecting a plan copies tolerance limits into measurement lines.</p>
          </div>

          {/* Quantity Inspected */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Quantity Inspected <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={quantityInspected}
              onChange={(e) => setQuantityInspected(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* References */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Goods Receipt Note (GRN) Reference UUID
            </label>
            <input
              type="text"
              placeholder="e.g. GRN UUID if linked to incoming receipt"
              value={grnId}
              onChange={(e) => setGrnId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Production Order Reference UUID
            </label>
            <input
              type="text"
              placeholder="e.g. Production Order UUID if linked to manufacturing"
              value={productionOrderId}
              onChange={(e) => setProductionOrderId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Inspection Notes / Instructions
          </label>
          <textarea
            rows={3}
            placeholder="Record ambient temperature, batch lot number, or visual sampling notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            to="/secure-kolmeks-x0y0/quality/inspections"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            {submitting ? 'Creating...' : 'Create Inspection'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InspectionFormPage;
