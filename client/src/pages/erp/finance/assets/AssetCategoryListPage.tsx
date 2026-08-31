import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderTree, Plus, ArrowLeft, Save, Edit3 } from 'lucide-react';
import assetService, { FixedAssetCategory } from '../../../../services/asset.service';
import apiClient from '../../../../services/api';

export const AssetCategoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<FixedAssetCategory[]>([]);
  const [glAccounts, setGlAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<FixedAssetCategory | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    default_asset_account_id: '',
    default_accumulated_depreciation_account_id: '',
    default_depreciation_expense_account_id: '',
    default_useful_life_months: 60,
    default_depreciation_method: 'STRAIGHT_LINE',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [catList, accRes] = await Promise.all([
        assetService.getCategories(),
        apiClient.get('/finance/accounts').catch(() => ({ data: { data: [] } })),
      ]);
      setCategories(catList);
      setGlAccounts(accRes.data?.data || []);
    } catch (err) {
      console.error('Error loading asset categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setForm({
      code: '',
      name: '',
      description: '',
      default_asset_account_id: '',
      default_accumulated_depreciation_account_id: '',
      default_depreciation_expense_account_id: '',
      default_useful_life_months: 60,
      default_depreciation_method: 'STRAIGHT_LINE',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cat: FixedAssetCategory) => {
    setEditingCategory(cat);
    setForm({
      code: cat.code,
      name: cat.name,
      description: cat.description || '',
      default_asset_account_id: cat.default_asset_account_id || '',
      default_accumulated_depreciation_account_id: cat.default_accumulated_depreciation_account_id || '',
      default_depreciation_expense_account_id: cat.default_depreciation_expense_account_id || '',
      default_useful_life_months: cat.default_useful_life_months || 60,
      default_depreciation_method: cat.default_depreciation_method || 'STRAIGHT_LINE',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      if (editingCategory) {
        await assetService.updateCategory(editingCategory.id, form);
      } else {
        await assetService.createCategory(form);
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      console.error('Error saving asset category:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets')}
            className="flex items-center space-x-1 text-sm font-medium text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Asset Dashboard</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <FolderTree className="w-6 h-6 text-emerald-600" />
            <span>Fixed Asset Categories</span>
          </h1>
          <p className="text-sm text-slate-500">
            Asset category classification, default useful life spans, and GL account default assignments
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading asset categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500">No asset categories configured yet.</div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-indigo-600 text-xs px-2.5 py-1 bg-indigo-50 rounded-lg">
                    {cat.code}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="text-xs font-semibold text-slate-500 hover:text-indigo-600 p-1 hover:bg-slate-50 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-2">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description || 'No description'}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div>
                    Default Useful Life: <span className="font-semibold text-slate-900">{cat.default_useful_life_months} Months</span>
                  </div>
                  <div>
                    Method: <span className="font-semibold text-indigo-600">{cat.default_depreciation_method}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-500">
                <div>Asset GL: <span className="font-medium text-slate-700">{cat.default_asset_account?.account_name || '1510 Machinery'}</span></div>
                <div>Accum Dep GL: <span className="font-medium text-slate-700">{cat.default_accumulated_depreciation_account?.account_name || '1550 Accum Dep'}</span></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingCategory ? 'Edit Asset Category' : 'Create Asset Category'}
            </h3>

            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingCategory)}
                    placeholder="e.g. MACHINERY"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plant Machinery & Equipment"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Useful Life (Months) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.default_useful_life_months}
                  onChange={(e) => setForm({ ...form, default_useful_life_months: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Asset Account (15XX)</label>
                <select
                  value={form.default_asset_account_id}
                  onChange={(e) => setForm({ ...form, default_asset_account_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">Select Account...</option>
                  {glAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.account_code} - {a.account_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Accumulated Depreciation Account (1550)</label>
                <select
                  value={form.default_accumulated_depreciation_account_id}
                  onChange={(e) => setForm({ ...form, default_accumulated_depreciation_account_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">Select Account...</option>
                  {glAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.account_code} - {a.account_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Depreciation Expense Account (5600)</label>
                <select
                  value={form.default_depreciation_expense_account_id}
                  onChange={(e) => setForm({ ...form, default_depreciation_expense_account_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">Select Account...</option>
                  {glAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.account_code} - {a.account_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
