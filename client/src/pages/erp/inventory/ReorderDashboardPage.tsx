import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, ShieldAlert, CheckCircle2, Settings, ShoppingCart } from 'lucide-react';
import inventoryService, { ReorderDashboardResponse, ReorderDashboardItem, Warehouse } from '../../../services/inventory.service';

export const ReorderDashboardPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<ReorderDashboardResponse | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit config modal
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ReorderDashboardItem | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [minStock, setMinStock] = useState<string>('0');
  const [reorderPoint, setReorderPoint] = useState<string>('10');
  const [safetyStock, setSafetyStock] = useState<string>('5');
  const [reorderQty, setReorderQty] = useState<string>('50');
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  useEffect(() => {
    fetchWarehouses();
    fetchReorderTelemetry();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await inventoryService.getWarehouses();
      if (res.success) {
        setWarehouses(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedWarehouseId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading warehouses:', err);
    }
  };

  const fetchReorderTelemetry = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getReorderDashboard();
      if (res.success) setTelemetry(res.data);
    } catch (err) {
      console.error('Error fetching reorder dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfig = (item: ReorderDashboardItem) => {
    setSelectedItem(item);
    setMinStock(String(item.minimum_stock));
    setReorderPoint(String(item.reorder_point));
    setSafetyStock(String(item.safety_stock));
    setReorderQty(String(item.reorder_quantity));
    setShowConfigModal(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedWarehouseId) return;

    setSavingConfig(true);
    try {
      const res = await inventoryService.upsertReorderLevel({
        product_id: selectedItem.product.id,
        warehouse_id: selectedWarehouseId,
        minimum_stock: Number(minStock),
        reorder_point: Number(reorderPoint),
        safety_stock: Number(safetyStock),
        reorder_quantity: Number(reorderQty),
      });

      if (res.success) {
        setShowConfigModal(false);
        fetchReorderTelemetry();
      }
    } catch (err) {
      console.error('Error saving reorder config:', err);
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-600/20 text-yellow-400 rounded-xl border border-yellow-500/30">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Automated Reorder & Safety Stock Engine</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Continuous stock health monitoring, safety stock breach alerts, and automated procurement suggestions
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total SKUs Monitored</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {loading ? '...' : telemetry?.totalProducts || 0}
          </div>
        </div>

        <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Healthy Stock SKUs</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {loading ? '...' : telemetry?.healthyCount || 0}
          </div>
        </div>

        <div className="bg-slate-800/70 p-5 rounded-xl border border-amber-500/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Reorder Needed</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {loading ? '...' : telemetry?.lowStockCount || 0}
          </div>
        </div>

        <div className="bg-slate-800/70 p-5 rounded-xl border border-rose-500/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Critical Out of Stock</span>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {loading ? '...' : telemetry?.outOfStockCount || 0}
          </div>
        </div>
      </div>

      {/* Main Reorder Telemetry Table */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3.5 px-4">SKU Code</th>
                <th className="py-3.5 px-4">Product Component Name</th>
                <th className="py-3.5 px-4 text-right">Physical On-Hand</th>
                <th className="py-3.5 px-4 text-right">Available</th>
                <th className="py-3.5 px-4 text-right">Reorder Point</th>
                <th className="py-3.5 px-4 text-right">Safety Stock</th>
                <th className="py-3.5 px-4 text-center">Stock Health</th>
                <th className="py-3.5 px-4 text-right">Suggested PO Qty</th>
                <th className="py-3.5 px-4 text-center">Reorder Config</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Evaluating safety stock levels and reorder parameters...
                  </td>
                </tr>
              ) : !telemetry?.items || telemetry.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No active product inventory records found for reorder telemetry.
                  </td>
                </tr>
              ) : (
                telemetry.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/30 transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-400">
                      {item.product.product_code}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      {item.product.name}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      {item.on_hand} <span className="text-xs text-slate-400 font-normal">{item.product.unit || 'pcs'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                      {item.available}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-300">
                      {item.reorder_point}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-rose-400">
                      {item.safety_stock}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full ${
                          item.status === 'HEALTHY'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'REORDER_NEEDED'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-yellow-400">
                      {item.suggested_order_qty > 0 ? (
                        <span className="flex items-center justify-end gap-1">
                          <ShoppingCart className="w-3.5 h-3.5" /> {item.suggested_order_qty}
                        </span>
                      ) : (
                        '0'
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenConfig(item)}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-yellow-400 rounded-lg text-xs font-medium transition inline-flex items-center gap-1 border border-slate-600"
                      >
                        <Settings className="w-3.5 h-3.5" /> Adjust Parameters
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configure Reorder Parameters Modal */}
      {showConfigModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Reorder Parameters: {selectedItem.product.product_code}</h3>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Warehouse *</label>
                <select
                  required
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Stock Level</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reorder Trigger Point *</label>
                  <input
                    type="number"
                    required
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Safety Stock Buffer</label>
                  <input
                    type="number"
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Default Purchase Qty (EOQ)</label>
                  <input
                    type="number"
                    value={reorderQty}
                    onChange={(e) => setReorderQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-yellow-600/20"
                >
                  {savingConfig ? 'Saving...' : 'Save Parameters'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
