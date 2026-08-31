import React, { useEffect, useState } from 'react';
import { Sliders, Plus, Search, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import inventoryService, { StockAdjustment, Warehouse } from '../../../services/inventory.service';

export const StockAdjustmentsPage: React.FC = () => {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [expectedQty, setExpectedQty] = useState<string>('0');
  const [countedQty, setCountedQty] = useState<string>('0');
  const [reason, setReason] = useState<string>('Annual physical stock cycle count difference');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    fetchWarehousesAndProducts();
    fetchAdjustments();
  }, []);

  const fetchWarehousesAndProducts = async () => {
    try {
      const whRes = await inventoryService.getWarehouses();
      if (whRes.success) setWarehouses(whRes.data || []);

      const invRes = await inventoryService.getInventory({ limit: 100 });
      if (invRes.success && invRes.data) {
        const uniqueProds = Array.from(new Set(invRes.data.map((i: any) => i.products).filter(Boolean)));
        setProducts(uniqueProds);
      }
    } catch (err) {
      console.error('Error fetching master data:', err);
    }
  };

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getStockAdjustments({ search });
      if (res.success) setAdjustments(res.data || []);
    } catch (err) {
      console.error('Error fetching adjustments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProduct || !selectedWarehouse || countedQty === '') {
      setFormError('Product, Warehouse, and Counted Quantity are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await inventoryService.createStockAdjustment({
        product_id: selectedProduct,
        warehouse_id: selectedWarehouse,
        expected_quantity: Number(expectedQty),
        counted_quantity: Number(countedQty),
        reason,
        notes,
      });

      if (res.success) {
        setShowModal(false);
        setCountedQty('0');
        setExpectedQty('0');
        fetchAdjustments();
      } else {
        setFormError(res.message || 'Failed to submit adjustment.');
      }
    } catch (err: any) {
      console.error('Error recording adjustment:', err);
      setFormError(err.response?.data?.message || 'Failed to record stock adjustment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Sliders className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Physical Stock Adjustments</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Record physical stock count differences, scrap write-offs, and stock reconciliation entries
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition flex items-center gap-2 text-sm shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" /> Record Adjustment
        </button>
      </div>

      {/* Adjustments Table */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3.5 px-4">Adjustment #</th>
                <th className="py-3.5 px-4">SKU / Product</th>
                <th className="py-3.5 px-4">Warehouse</th>
                <th className="py-3.5 px-4 text-right">Expected</th>
                <th className="py-3.5 px-4 text-right">Counted</th>
                <th className="py-3.5 px-4 text-right">Variance</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading stock adjustments...
                  </td>
                </tr>
              ) : adjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No physical count adjustments recorded yet.
                  </td>
                </tr>
              ) : (
                adjustments.map((adj) => {
                  const isPositive = Number(adj.variance_quantity || 0) >= 0;
                  return (
                    <tr key={adj.id} className="hover:bg-slate-700/30 transition">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-amber-400">
                        {adj.adjustment_number}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{adj.products?.name || 'Item'}</div>
                        <div className="text-xs text-slate-400 font-mono">{adj.products?.product_code}</div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {adj.warehouses?.name || 'Main WH'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-300">
                        {adj.expected_quantity}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-white">
                        {adj.counted_quantity}
                      </td>

                      <td className={`py-3.5 px-4 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? `+${adj.variance_quantity}` : adj.variance_quantity}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                          {adj.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">
                        {adj.reason}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                        {new Date(adj.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Adjustment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Record Physical Count Adjustment</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Product Component *</label>
                <select
                  required
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                >
                  <option value="">Select Product Component</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Warehouse Facility *</label>
                <select
                  required
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">System Expected Qty</label>
                  <input
                    type="number"
                    value={expectedQty}
                    onChange={(e) => setExpectedQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Counted Qty *</label>
                  <input
                    type="number"
                    required
                    value={countedQty}
                    onChange={(e) => setCountedQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Adjustment *</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-amber-600/20"
                >
                  {submitting ? 'Posting...' : 'Post Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
