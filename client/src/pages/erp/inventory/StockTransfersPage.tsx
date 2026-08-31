import React, { useEffect, useState } from 'react';
import { RefreshCw, Plus, Search, Building2, CheckCircle2, User, ArrowRight } from 'lucide-react';
import inventoryService, { StockTransfer, Warehouse, StorageLocation } from '../../../services/inventory.service';

export const StockTransfersPage: React.FC = () => {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form State
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [sourceWarehouse, setSourceWarehouse] = useState<string>('');
  const [sourceLocation, setSourceLocation] = useState<string>('');
  const [destWarehouse, setDestWarehouse] = useState<string>('');
  const [destLocation, setDestLocation] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('Inter-plant inventory rebalancing');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    fetchWarehouses();
    fetchTransfers();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await inventoryService.getWarehouses();
      if (res.success) setWarehouses(res.data || []);
      // Also fetch products for dropdown
      const invRes = await inventoryService.getInventory({ limit: 100 });
      if (invRes.success && invRes.data) {
        const uniqueProds = Array.from(new Set(invRes.data.map((i: any) => i.products).filter(Boolean)));
        setProducts(uniqueProds);
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getStockTransfers({ search });
      if (res.success) setTransfers(res.data || []);
    } catch (err) {
      console.error('Error fetching transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProduct || !sourceWarehouse || !destWarehouse || !quantity) {
      setFormError('Product, Source Warehouse, Destination Warehouse, and Quantity are required.');
      return;
    }

    if (sourceWarehouse === destWarehouse) {
      setFormError('Source and Destination warehouses must be different.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await inventoryService.createStockTransfer({
        product_id: selectedProduct,
        source_warehouse_id: sourceWarehouse,
        source_location_id: sourceLocation || undefined,
        destination_warehouse_id: destWarehouse,
        destination_location_id: destLocation || undefined,
        quantity: Number(quantity),
        reason,
        notes,
      });

      if (res.success) {
        setShowModal(false);
        setQuantity('');
        setFormError('');
        fetchTransfers();
      } else {
        setFormError(res.message || 'Failed to complete stock transfer.');
      }
    } catch (err: any) {
      console.error('Error creating transfer:', err);
      setFormError(err.response?.data?.message || 'Error processing stock transfer request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-200">
            <RefreshCw className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inter-Warehouse Stock Transfers</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Execute double-entry stock transfers across warehouses with audit logs and auto stock posting
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition flex items-center gap-2 text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" /> New Stock Transfer
        </button>
      </div>

      {/* Transfers List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Transfer #</th>
                <th className="py-3.5 px-4">SKU / Product</th>
                <th className="py-3.5 px-4">Source Warehouse</th>
                <th className="py-3.5 px-4">Destination Warehouse</th>
                <th className="py-3.5 px-4 text-right">Quantity</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Requested By</th>
                <th className="py-3.5 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading stock transfers...
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No stock transfer records found. Click "New Stock Transfer" to initiate one.
                  </td>
                </tr>
              ) : (
                transfers.map((trf) => (
                  <tr key={trf.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-cyan-700">
                      {trf.transfer_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{trf.products?.name || 'Component'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{trf.products?.product_code}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-semibold">{trf.source_warehouse?.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {trf.source_warehouse?.code} {trf.source_location?.location_code && `(${trf.source_location.location_code})`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-semibold">{trf.destination_warehouse?.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {trf.destination_warehouse?.code} {trf.destination_location?.location_code && `(${trf.destination_location.location_code})`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {trf.quantity} <span className="text-xs text-slate-500">{trf.products?.unit || 'pcs'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                        {trf.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      {trf.requested_by_profile?.full_name || 'Warehouse Operator'}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                      {new Date(trf.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Stock Transfer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-bold text-slate-900">Execute Stock Transfer</h3>
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

            <form onSubmit={handleCreateTransfer} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Source Warehouse *</label>
                  <select
                    required
                    value={sourceWarehouse}
                    onChange={(e) => setSourceWarehouse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="">Source WH</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} — {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Warehouse *</label>
                  <select
                    required
                    value={destWarehouse}
                    onChange={(e) => setDestWarehouse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="">Destination WH</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} — {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Quantity *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 250"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
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
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {submitting ? 'Transferring...' : 'Execute Stock Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
