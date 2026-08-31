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
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Automated Reorder & Safety Stock Engine</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Continuous stock health monitoring, safety stock breach alerts, and automated procurement suggestions
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total SKUs Monitored</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {loading ? '...' : telemetry?.totalProducts || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Healthy Stock SKUs</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {loading ? '...' : telemetry?.healthyCount || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Reorder Needed</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {loading ? '...' : telemetry?.lowStockCount || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Critical Out of Stock</span>
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {loading ? '...' : telemetry?.outOfStockCount || 0}
          </div>
        </div>
      </div>

      {/* Main Reorder Telemetry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Evaluating safety stock levels and reorder parameters...
                  </td>
                </tr>
              ) : !telemetry?.items || telemetry.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No active product inventory records found for reorder telemetry.
                  </td>
                </tr>
              ) : (
                telemetry.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-700">
                      {item.product.product_code}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.product.name}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {item.on_hand} <span className="text-xs text-slate-500 font-normal">{item.product.unit || 'pcs'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {item.available}
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                      {item.reorder_point}
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold text-rose-700">
                      {item.safety_stock}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full ${
                          item.status === 'HEALTHY'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'REORDER_NEEDED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-amber-700">
                      {item.suggested_order_qty > 0 ? (
                        <span className="flex items-center justify-end gap-1">
                          <ShoppingCart className="w-3.5 h-3.5 text-amber-600" /> {item.suggested_order_qty}
                        </span>
                      ) : (
                        '0'
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenConfig(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 border border-slate-200"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-slate-900">Reorder Parameters: {selectedItem.product.product_code}</h3>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Warehouse *</label>
                <select
                  required
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Stock Level</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Trigger Point *</label>
                  <input
                    type="number"
                    required
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Safety Stock Buffer</label>
                  <input
                    type="number"
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Purchase Qty (EOQ)</label>
                  <input
                    type="number"
                    value={reorderQty}
                    onChange={(e) => setReorderQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition shadow-xs"
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
