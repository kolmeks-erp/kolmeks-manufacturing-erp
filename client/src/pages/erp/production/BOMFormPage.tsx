import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, FolderTree } from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { productionService } from '../../../services/production.service';
import { apiClient } from '../../../services/api';

export const BOMFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState<string>('');
  const [version, setVersion] = useState<string>('V1');
  const [description, setDescription] = useState<string>('');
  
  const [items, setItems] = useState<Array<{ component_id: string; quantity_per: string; scrap_percentage: string; unit: string }>>([
    { component_id: '', quantity_per: '1', scrap_percentage: '0', unit: 'pcs' },
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products');
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { component_id: '', quantity_per: '1', scrap_percentage: '0', unit: 'pcs' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, val: string) => {
    const next = [...items];
    (next[index] as any)[field] = val;
    setItems(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!productId) {
      setErrorMsg('Please select a Product.');
      return;
    }
    const validItems = items.filter((i) => i.component_id && parseFloat(i.quantity_per) > 0);
    if (validItems.length === 0) {
      setErrorMsg('At least one component material with valid quantity is required.');
      return;
    }

    try {
      setLoading(true);
      const created = await productionService.createBOM({
        product_id: productId,
        version,
        description: description || undefined,
        items: validItems.map((i) => ({
          component_id: i.component_id,
          quantity_per: parseFloat(i.quantity_per),
          scrap_percentage: parseFloat(i.scrap_percentage || '0'),
          unit: i.unit,
        })),
      });

      navigate(`${ERP_BASE_PATH}/production/boms/${created.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to create BOM.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/production/boms`)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Define Bill of Materials (BOM)</h1>
          <p className="text-slate-400 text-sm">Specify raw material components required for product assembly.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Assembly Product Master *</label>
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="">Select Product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_code} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Component Items */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-amber-400" />
              <span>Component Line Items</span>
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 text-xs font-semibold border border-amber-500/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Component
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="col-span-5">
                  <label className="block text-[10px] text-slate-500 mb-1">Component</label>
                  <select
                    value={item.component_id}
                    onChange={(e) => handleItemChange(idx, 'component_id', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="">Select Material...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.product_code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="block text-[10px] text-slate-500 mb-1">Qty Per Assembly</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={item.quantity_per}
                    onChange={(e) => handleItemChange(idx, 'quantity_per', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-[10px] text-slate-500 mb-1">Scrap %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={item.scrap_percentage}
                    onChange={(e) => handleItemChange(idx, 'scrap_percentage', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="col-span-1 text-center pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length === 1}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/production/boms`)}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-all shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save BOM Definition'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
