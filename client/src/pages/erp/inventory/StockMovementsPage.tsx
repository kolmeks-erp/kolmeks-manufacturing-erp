import React, { useEffect, useState } from 'react';
import { Activity, Search, Filter, ArrowUpRight, ArrowDownLeft, RefreshCw, User, Calendar } from 'lucide-react';
import inventoryService, { InventoryTransaction, Warehouse } from '../../../services/inventory.service';

export const StockMovementsPage: React.FC = () => {
  const [movements, setMovements] = useState<InventoryTransaction[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [movementType, setMovementType] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [page, search, movementType, warehouseId]);

  const fetchWarehouses = async () => {
    try {
      const res = await inventoryService.getWarehouses();
      if (res.success) setWarehouses(res.data || []);
    } catch (err) {
      console.error('Error loading warehouses:', err);
    }
  };

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getStockMovements({
        page,
        limit: 15,
        search,
        movement_type: movementType,
        warehouse_id: warehouseId,
      });

      if (res.success) {
        setMovements(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Error loading stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'RECEIPT':
      case 'ADJUSTMENT_IN':
      case 'TRANSFER_IN':
      case 'PRODUCTION_OUTPUT':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'ADJUSTMENT_OUT':
      case 'TRANSFER_OUT':
      case 'PRODUCTION_CONSUMPTION':
      case 'SALES_ISSUE':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Stock Movement Audit Trail</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Traceable, immutable record of every inventory receipt, issue, transfer, and adjustment transaction
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by transaction #, SKU code, product name, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Movement Type */}
        <div>
          <select
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Movement Types</option>
            <option value="RECEIPT">RECEIPT (GRN)</option>
            <option value="ADJUSTMENT_IN">ADJUSTMENT IN (+)</option>
            <option value="ADJUSTMENT_OUT">ADJUSTMENT OUT (-)</option>
            <option value="TRANSFER_IN">TRANSFER IN (+)</option>
            <option value="TRANSFER_OUT">TRANSFER OUT (-)</option>
            <option value="PRODUCTION_CONSUMPTION">PRODUCTION CONSUMPTION (-)</option>
            <option value="PRODUCTION_OUTPUT">PRODUCTION OUTPUT (+)</option>
            <option value="SALES_ISSUE">SALES ISSUE (-)</option>
          </select>
        </div>

        {/* Warehouse Filter */}
        <div>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.code} — {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3.5 px-4">Transaction #</th>
                <th className="py-3.5 px-4">Movement Type</th>
                <th className="py-3.5 px-4">SKU / Product</th>
                <th className="py-3.5 px-4">Warehouse & Bin</th>
                <th className="py-3.5 px-4 text-right">Quantity</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4">Performed By</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading stock movement audit logs...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No stock movements logged.
                  </td>
                </tr>
              ) : (
                movements.map((txn) => {
                  const isStockIn = [
                    'RECEIPT',
                    'ADJUSTMENT_IN',
                    'TRANSFER_IN',
                    'PRODUCTION_OUTPUT',
                  ].includes(txn.movement_type);

                  return (
                    <tr key={txn.id} className="hover:bg-slate-700/30 transition">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-blue-400">
                        {txn.transaction_number}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full ${getMovementBadge(txn.movement_type)}`}>
                          {txn.movement_type.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{txn.products?.name || 'Item'}</div>
                        <div className="text-xs text-slate-400 font-mono">{txn.products?.product_code}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{txn.warehouses?.name || 'Warehouse'}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          Bin: {txn.storage_locations?.location_code || 'General'}
                        </div>
                      </td>

                      <td className={`py-3.5 px-4 text-right font-bold ${isStockIn ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isStockIn ? `+${txn.quantity}` : `-${txn.quantity}`} {txn.unit}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-300">
                        <span className="font-medium text-slate-200">{txn.reason || 'N/A'}</span>
                        {txn.notes && <span className="text-slate-400 block truncate">{txn.notes}</span>}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {txn.profiles?.full_name || 'System Operator'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                        {new Date(txn.transaction_date).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg transition"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
