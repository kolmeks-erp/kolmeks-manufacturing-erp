import React, { useEffect, useState } from 'react';
import { Package, Plus, Search, Calendar, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';
import inventoryService, { StockBatch, Warehouse } from '../../../services/inventory.service';

export const StockBatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form State
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [mfgDate, setMfgDate] = useState<string>('');
  const [expDate, setExpDate] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [status, setStatus] = useState<string>('AVAILABLE');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchMasterData();
    fetchBatches();
  }, []);

  const fetchMasterData = async () => {
    try {
      const whRes = await inventoryService.getWarehouses();
      if (whRes.success) setWarehouses(whRes.data || []);

      const invRes = await inventoryService.getInventory({ limit: 100 });
      if (invRes.success && invRes.data) {
        const uniqueProds = Array.from(new Set(invRes.data.map((i: any) => i.products).filter(Boolean)));
        setProducts(uniqueProds);
      }
    } catch (err) {
      console.error('Error loading master data:', err);
    }
  };

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getBatches({ search });
      if (res.success) setBatches(res.data || []);
    } catch (err) {
      console.error('Error loading batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedWarehouse || !quantity) return;

    setSubmitting(true);
    try {
      const res = await inventoryService.createBatch({
        product_id: selectedProduct,
        warehouse_id: selectedWarehouse,
        manufacture_date: mfgDate || undefined,
        expiry_date: expDate || undefined,
        quantity: Number(quantity),
        status,
      });

      if (res.success) {
        setShowModal(false);
        setQuantity('');
        setMfgDate('');
        setExpDate('');
        fetchBatches();
      }
    } catch (err) {
      console.error('Error registering batch:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Batch & Lot Tracking Register</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Trace raw material heat numbers, manufacturing lot batches, and product expiration dates
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition flex items-center gap-2 text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" /> Register New Batch
        </button>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Batch / Lot #</th>
                <th className="py-3.5 px-4">SKU / Product</th>
                <th className="py-3.5 px-4">Warehouse</th>
                <th className="py-3.5 px-4 text-right">Batch Quantity</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Manufacture Date</th>
                <th className="py-3.5 px-4">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading stock batch register...
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No batch or lot records registered.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-indigo-700">
                      {batch.batch_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{batch.products?.name || 'Component'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{batch.products?.product_code}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-800 font-semibold">
                      {batch.warehouses?.name || 'Main WH'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {batch.quantity} <span className="text-xs text-slate-500 font-normal">{batch.products?.unit || 'pcs'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                        {batch.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 font-mono">
                      {batch.manufacture_date ? new Date(batch.manufacture_date).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 font-mono">
                      {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'No Expiry'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Register Stock Batch / Lot</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product *</label>
                <select
                  required
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Warehouse *</label>
                <select
                  required
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Quantity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 500"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="QUARANTINED">QUARANTINED</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacture Date</label>
                  <input
                    type="date"
                    value={mfgDate}
                    onChange={(e) => setMfgDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {submitting ? 'Registering...' : 'Register Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
