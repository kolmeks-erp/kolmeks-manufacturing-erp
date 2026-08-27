import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Boxes,
  Building2,
  History,
  SlidersHorizontal,
  ArrowLeftRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { inventoryService } from '../../../services/inventory.service';
import { InventoryItem, StockMovement } from '../../../types/inventory';

export const InventoryDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<any>(null);
  const [totalOnHand, setTotalOnHand] = useState<number>(0);
  const [totalReserved, setTotalReserved] = useState<number>(0);
  const [totalAvailable, setTotalAvailable] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const fetchDetail = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await inventoryService.getInventoryByProduct(productId);
      if (res.success && res.data) {
        setProduct(res.data.product);
        setTotalOnHand(res.data.totalOnHand);
        setTotalReserved(res.data.totalReserved);
        setTotalAvailable(res.data.totalAvailable);
        setBreakdown(res.data.warehouseBreakdown);
        setMovements(res.data.recentMovements);
      }
    } catch (err) {
      console.error('Error fetching product inventory detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [productId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <span>Loading product stock details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/inventory`)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold"
        >
          Back to Inventory
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Navigation Breadcrumb */}
      <button
        onClick={() => navigate(`${ERP_BASE_PATH}/inventory`)}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Inventory Balances</span>
      </button>

      {/* Header Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              {product.product_code}
            </span>
            {product.categories?.name && (
              <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
                {product.categories.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
            {product.drawing_number && <span>Drawing #: {product.drawing_number}</span>}
            <span>Unit: {product.unit || 'pcs'}</span>
            <span>Min Stock Threshold: {product.minimum_stock || 0}</span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/adjustments/new`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-indigo-600/20"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Adjust Stock</span>
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/transfers/new`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-cyan-600/20"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transfer Stock</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total On-Hand</span>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {totalOnHand.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-400">{product.unit || 'pcs'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Sum of physical stock across all warehouses</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reserved</span>
          <div className="mt-2 text-3xl font-extrabold text-amber-400">
            {totalReserved.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-400">{product.unit || 'pcs'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Committed for active production or sales</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Available</span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400">
            {totalAvailable.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-400">{product.unit || 'pcs'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Available for immediate issue or transfer</p>
        </div>
      </div>

      {/* Warehouse Breakdown Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Warehouse & Storage Location Breakdown</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Storage Location</th>
                <th className="px-4 py-3 text-right">On-Hand</th>
                <th className="px-4 py-3 text-right">Reserved</th>
                <th className="px-4 py-3 text-right">Available</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {breakdown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No physical stock recorded in any warehouse yet.
                  </td>
                </tr>
              ) : (
                breakdown.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-white">
                      <div>{item.warehouses?.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{item.warehouses?.code}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.storage_locations ? (
                        <div className="font-mono text-indigo-300">
                          {item.storage_locations.location_code} — {item.storage_locations.name}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">General Floor</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-white">{item.on_hand_quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{item.reserved_quantity}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">{item.available_quantity}</td>
                    <td className="px-4 py-3 text-center">
                      {item.on_hand_quantity > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                          Active Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                          Empty
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Audit History Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Recent Transaction Movements</h2>
          </div>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/movements?product_id=${productId}`)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            View Full Movement Audit Log
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Txn #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No movement transaction logs recorded for this product yet.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isPositive = ['RECEIPT', 'ADJUSTMENT_IN', 'TRANSFER_IN'].includes(m.movement_type);
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono font-semibold text-indigo-300">
                        {m.transaction_number}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                        {new Date(m.transaction_date).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold uppercase font-mono ${
                            isPositive
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {m.movement_type}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold font-mono ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? `+${m.quantity}` : `-${m.quantity}`} {m.unit}
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-xs">{m.warehouses?.code}</td>
                      <td className="px-4 py-3 text-slate-300">{m.reason || '—'}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{m.profiles?.full_name || 'System'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
