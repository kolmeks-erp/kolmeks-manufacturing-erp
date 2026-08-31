import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Box, Info } from 'lucide-react';
import assetService, { FixedAssetCategory } from '../../../../services/asset.service';
import apiClient from '../../../../services/api';

export const AssetFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<FixedAssetCategory[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [operationalAssets, setOperationalAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    operational_asset_id: '',
    asset_name: '',
    category_id: '',
    description: '',
    acquisition_date: new Date().toISOString().split('T')[0],
    acquisition_cost: 0,
    residual_value: 0,
    useful_life_months: 60,
    depreciation_method: 'STRAIGHT_LINE',
    cost_center_id: '',
    location_id: '',
  });

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setLoading(true);
        const [catList, ccRes, opAssetRes] = await Promise.all([
          assetService.getCategories(),
          apiClient.get('/finance/cost-centers').catch(() => ({ data: { data: [] } })),
          apiClient.get('/maintenance/assets').catch(() => ({ data: { data: [] } })),
        ]);
        setCategories(catList);
        setCostCenters(ccRes.data?.data || []);
        setOperationalAssets(opAssetRes.data?.data || []);

        if (isEdit && id) {
          const assetData = await assetService.getAssetById(id);
          setFormData({
            operational_asset_id: assetData.operational_asset_id || '',
            asset_name: assetData.asset_name || '',
            category_id: assetData.category_id || '',
            description: assetData.description || '',
            acquisition_date: assetData.acquisition_date || '',
            acquisition_cost: assetData.acquisition_cost || 0,
            residual_value: assetData.residual_value || 0,
            useful_life_months: assetData.useful_life_months || 60,
            depreciation_method: assetData.depreciation_method || 'STRAIGHT_LINE',
            cost_center_id: assetData.cost_center_id || '',
            location_id: assetData.location_id || '',
          });
        }
      } catch (err: any) {
        console.error('Error loading master data for asset form:', err);
        setError('Failed to load initial master data.');
      } finally {
        setLoading(false);
      }
    };
    loadMasterData();
  }, [id, isEdit]);

  const handleCategoryChange = (catId: string) => {
    const selectedCat = categories.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      category_id: catId,
      useful_life_months: selectedCat?.default_useful_life_months || prev.useful_life_months,
      depreciation_method: selectedCat?.default_depreciation_method || prev.depreciation_method,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      if (!formData.asset_name || !formData.category_id || !formData.acquisition_date) {
        setError('Please fill in all required fields (Asset Name, Category, Acquisition Date).');
        setSubmitting(false);
        return;
      }

      if (Number(formData.acquisition_cost) < 0) {
        setError('Acquisition cost cannot be negative.');
        setSubmitting(false);
        return;
      }

      if (Number(formData.residual_value) > Number(formData.acquisition_cost)) {
        setError('Residual value cannot exceed Acquisition Cost.');
        setSubmitting(false);
        return;
      }

      if (Number(formData.useful_life_months) <= 0) {
        setError('Useful life in months must be greater than 0.');
        setSubmitting(false);
        return;
      }

      if (isEdit && id) {
        await assetService.updateAsset(id, formData);
      } else {
        await assetService.createAsset(formData);
      }

      navigate('/secure-kolmeks-x0y0/finance/assets/list');
    } catch (err: any) {
      console.error('Error saving asset:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save fixed asset.');
    } finally {
      setSubmitting(false);
    }
  };

  const depreciableAmount = Math.max(0, Number(formData.acquisition_cost) - Number(formData.residual_value));
  const monthlyDep = Number(formData.useful_life_months) > 0 ? depreciableAmount / Number(formData.useful_life_months) : 0;

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading asset form...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/list')}
            className="flex items-center space-x-1 text-sm font-medium text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Asset Register</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEdit ? 'Edit Fixed Asset' : 'Register New Fixed Asset'}
          </h1>
          <p className="text-sm text-slate-500">Record asset acquisition cost, depreciation rules, and cost center assignment</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Asset Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Asset Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mazak Integrex i-200S 5-Axis CNC Lathe"
              value={formData.asset_name}
              onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Asset Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Financial Asset Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="">Select Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.default_useful_life_months} Months Life)
                </option>
              ))}
            </select>
          </div>

          {/* Operational Maintenance Asset Link */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Link Operational Maintenance Asset (Optional)
            </label>
            <select
              value={formData.operational_asset_id}
              onChange={(e) => setFormData({ ...formData, operational_asset_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="">No Operational Asset Link</option>
              {operationalAssets.map((oa) => (
                <option key={oa.id} value={oa.id}>
                  {oa.asset_code} - {oa.name}
                </option>
              ))}
            </select>
          </div>

          {/* Acquisition Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Acquisition Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.acquisition_date}
              onChange={(e) => setFormData({ ...formData, acquisition_date: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Acquisition Cost */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Acquisition Cost (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              value={formData.acquisition_cost}
              onChange={(e) => setFormData({ ...formData, acquisition_cost: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Residual Value */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Residual / Scrap Value (₹)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={formData.residual_value}
              onChange={(e) => setFormData({ ...formData, residual_value: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Useful Life Months */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Useful Life (Months) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              value={formData.useful_life_months}
              onChange={(e) => setFormData({ ...formData, useful_life_months: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <span className="text-xs text-slate-400 mt-1 block">
              {(Number(formData.useful_life_months) / 12).toFixed(1)} Years
            </span>
          </div>

          {/* Cost Center */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Cost Center</label>
            <select
              value={formData.cost_center_id}
              onChange={(e) => setFormData({ ...formData, cost_center_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="">Select Cost Center...</option>
              {costCenters.map((cc) => (
                <option key={cc.id} value={cc.id}>
                  {cc.code} - {cc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Plant / Physical Location</label>
            <input
              type="text"
              placeholder="e.g. Tikkurila Plant - Machining Bay 2"
              value={formData.location_id}
              onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description / Technical Notes</label>
            <textarea
              rows={3}
              placeholder="Detailed specifications, warranty details, model, serial number..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Straight Line Depreciation Calculation Preview Card */}
        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 flex items-start space-x-3">
          <Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-indigo-900 space-y-1">
            <p className="font-semibold text-sm">Straight-Line Depreciation Preview:</p>
            <p>
              • Depreciable Amount: ₹{depreciableAmount.toLocaleString()} (Acquisition Cost - Residual Value)
            </p>
            <p>
              • Expected Monthly Depreciation: ₹{monthlyDep.toFixed(2)} / month over {formData.useful_life_months} months
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/list')}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg transition-all text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving Asset...' : isEdit ? 'Update Asset' : 'Register Asset'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
