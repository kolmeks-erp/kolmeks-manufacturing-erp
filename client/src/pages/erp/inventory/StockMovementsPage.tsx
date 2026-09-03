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
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'ADJUSTMENT_OUT':
      case 'TRANSFER_OUT':
      case 'PRODUCTION_CONSUMPTION':
      case 'SALES_ISSUE':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-blue-50 text-blue-700 border border-blue-200';
    }
  };

  return (
    <div className="space-y-6 text-slate-800 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Movement Audit Trail</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Traceable, immutable record of every inventory receipt, issue, transfer, and adjustment transaction
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by transaction #, SKU code, product name, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Movement Type */}
        <div>
          <select
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
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
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
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
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading stock movement audit logs...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
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
                    <tr key={txn.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-700">
                        {txn.transaction_number}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full ${getMovementBadge(txn.movement_type)}`}>
                          {txn.movement_type.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{txn.products?.name || 'Item'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{txn.products?.product_code}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold">{txn.warehouses?.name || 'Warehouse'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Bin: {txn.storage_locations?.location_code || 'General'}
                        </div>
                      </td>

                      <td className={`py-3.5 px-4 text-right font-extrabold ${isStockIn ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isStockIn ? `+${txn.quantity}` : `-${txn.quantity}`} {txn.unit}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-700">
                        <span className="font-semibold text-slate-800">{txn.reason || 'N/A'}</span>
                        {txn.notes && <span className="text-slate-500 block truncate">{txn.notes}</span>}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {txn.profiles?.full_name || 'System Operator'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 text-slate-700 rounded-lg transition"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 text-slate-700 rounded-lg transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
