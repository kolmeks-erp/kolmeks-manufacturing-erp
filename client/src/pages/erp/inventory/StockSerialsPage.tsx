import React, { useEffect, useState } from 'react';
import { Barcode, Plus, Search, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import inventoryService, { StockSerial, Warehouse } from '../../../services/inventory.service';

export const StockSerialsPage: React.FC = () => {
  const [serials, setSerials] = useState<StockSerial[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form State
  const [serialNum, setSerialNum] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    fetchMasterData();
    fetchSerials();
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
      console.error('Error fetching master data:', err);
    }
  };

  const fetchSerials = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getSerialNumbers({ search });
      if (res.success) setSerials(res.data || []);
    } catch (err) {
      console.error('Error fetching serials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSerial = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!serialNum || !selectedProduct || !selectedWarehouse) {
      setFormError('Serial Number, Product, and Warehouse are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await inventoryService.createSerialNumber({
        serial_number: serialNum,
        product_id: selectedProduct,
        warehouse_id: selectedWarehouse,
        notes,
      });

      if (res.success) {
        setShowModal(false);
        setSerialNum('');
        setNotes('');
        fetchSerials();
      } else {
        setFormError(res.message || 'Failed to register serial number.');
      }
    } catch (err: any) {
      console.error('Error registering serial:', err);
      setFormError(err.response?.data?.message || 'Failed to register unit serial number.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-600/20 text-teal-400 rounded-xl border border-teal-500/30">
            <Barcode className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Unit Serial Number Tracking</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Unit-level component traceability for precision motors, electric coils, and high-value CNC components
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition flex items-center gap-2 text-sm shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-4 h-4" /> Register Serial Number
        </button>
      </div>

      {/* Serials Table */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3.5 px-4">Serial Number</th>
                <th className="py-3.5 px-4">SKU / Product Component</th>
                <th className="py-3.5 px-4">Warehouse & Bin</th>
                <th className="py-3.5 px-4">Associated Batch</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading serial number register...
                  </td>
                </tr>
              ) : serials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No unit serial numbers registered.
                  </td>
                </tr>
              ) : (
                serials.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-700/30 transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-teal-400">
                      {s.serial_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{s.products?.name || 'Component'}</div>
                      <div className="text-xs text-slate-400 font-mono">{s.products?.product_code}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{s.warehouses?.name || 'Main Facility'}</div>
                      <div className="text-xs text-slate-400 font-mono">Bin: {s.storage_locations?.location_code || 'General'}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                      {s.stock_batches?.batch_number || 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                        {s.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Serial Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold text-white">Register Unit Serial Number</h3>
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

            <form onSubmit={handleRegisterSerial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Serial Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SN-KOL-2026-90412"
                  value={serialNum}
                  onChange={(e) => setSerialNum(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono"
                />
              </div>

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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Inspection Stamp</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pass quality test batch #3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-teal-600/20"
                >
                  {submitting ? 'Saving...' : 'Register Serial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
