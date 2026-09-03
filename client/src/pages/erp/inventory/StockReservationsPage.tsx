import React, { useEffect, useState } from 'react';
import { Lock, Plus, Search, CheckCircle2, Unlock, AlertCircle } from 'lucide-react';
import inventoryService, { StockReservation, Warehouse } from '../../../services/inventory.service';

export const StockReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<StockReservation[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form State
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [refType, setRefType] = useState<string>('SALES_ORDER');
  const [refId, setRefId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    fetchMasterData();
    fetchReservations();
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

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getStockReservations({ search });
      if (res.success) setReservations(res.data || []);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProduct || !selectedWarehouse || !quantity) {
      setFormError('Product, Warehouse, and Quantity are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await inventoryService.createStockReservation({
        product_id: selectedProduct,
        warehouse_id: selectedWarehouse,
        quantity: Number(quantity),
        reference_type: refType,
        reference_id: refId.trim() || undefined,
      });

      if (res.success) {
        setShowModal(false);
        setQuantity('');
        setRefId('');
        fetchReservations();
      } else {
        setFormError(res.message || 'Failed to create reservation.');
      }
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      setFormError(err.response?.data?.message || 'Error processing reservation request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseReservation = async (id: string) => {
    try {
      const res = await inventoryService.releaseStockReservation(id);
      if (res.success) {
        fetchReservations();
      }
    } catch (err) {
      console.error('Error releasing reservation:', err);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Reservations & Allocations</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Hard lock inventory quantities against customer Sales Orders and Production Work Orders
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition flex items-center gap-2 text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" /> Reserve Stock
        </button>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Reservation #</th>
                <th className="py-3.5 px-4">SKU / Product</th>
                <th className="py-3.5 px-4">Warehouse</th>
                <th className="py-3.5 px-4">Allocated To</th>
                <th className="py-3.5 px-4 text-right">Reserved Qty</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading active stock reservations...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No active stock reservations found.
                  </td>
                </tr>
              ) : (
                reservations.map((resItem) => (
                  <tr key={resItem.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-rose-700">
                      {resItem.reservation_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{resItem.products?.name || 'Component'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{resItem.products?.product_code}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {resItem.warehouses?.name || 'Main WH'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-bold text-slate-800">{resItem.reference_type}</div>
                      {resItem.reference_id && <div className="text-[11px] text-slate-500 font-mono">Ref: {resItem.reference_id}</div>}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-amber-700">
                      {resItem.quantity} <span className="text-xs font-normal text-slate-500">{resItem.products?.unit || 'pcs'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-1 text-xs font-mono font-bold rounded-full ${
                          resItem.status === 'RELEASED'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {resItem.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                      {new Date(resItem.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {resItem.status === 'RESERVED' && (
                        <button
                          onClick={() => handleReleaseReservation(resItem.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 border border-slate-200"
                        >
                          <Unlock className="w-3.5 h-3.5" /> Release Lock
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Reservation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-bold text-slate-900">Create Stock Reservation</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-4">
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Category</label>
                  <select
                    value={refType}
                    onChange={(e) => setRefType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="SALES_ORDER">Sales Order (SO)</option>
                    <option value="PRODUCTION_ORDER">Production Order (WO)</option>
                    <option value="INTERNAL">Internal Reserve</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity to Reserve *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reference ID / Order Number</label>
                <input
                  type="text"
                  placeholder="e.g. SO-2026-0041 or WO-884"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {submitting ? 'Reserving...' : 'Confirm Stock Lock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
