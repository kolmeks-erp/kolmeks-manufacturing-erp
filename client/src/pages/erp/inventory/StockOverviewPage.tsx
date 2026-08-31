import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Lock,
  Plus,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';
import inventoryService, { InventoryBalance, Warehouse, ATPResponse } from '../../../services/inventory.service';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const StockOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // ATP Modal state
  const [atpModal, setAtpModal] = useState<ATPResponse | null>(null);
  const [atpLoading, setAtpLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [page, search, selectedWarehouse, selectedStatus]);

  const fetchWarehouses = async () => {
    try {
      const res = await inventoryService.getWarehouses();
      if (res.success) setWarehouses(res.data || []);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getInventory({
        page,
        limit: 12,
        search,
        warehouse_id: selectedWarehouse,
        stock_status: selectedStatus,
      });

      if (res.success) {
        setBalances(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Error fetching inventory balances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenATP = async (productId: string, warehouseId?: string) => {
    setAtpLoading(true);
    try {
      const res = await inventoryService.getAvailableToPromise(productId, warehouseId);
      if (res.success) {
        setAtpModal(res.data);
      }
    } catch (err) {
      console.error('Error fetching ATP telemetry:', err);
    } finally {
      setAtpLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Boxes className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Stock Balances & Master Register</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Real-time stock balance across warehouses, storage bins, reserved stock, and available units
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/transfers`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition flex items-center gap-2 text-sm shadow-lg shadow-blue-600/20"
          >
            <RefreshCw className="w-4 h-4" /> Transfer Stock
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/adjustments`)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium transition flex items-center gap-2 text-sm border border-slate-600"
          >
            <Plus className="w-4 h-4" /> Physical Adjustment
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by SKU code, product name, drawing #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Warehouse Filter */}
        <div>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.code} — {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Stock Balance Table */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3.5 px-4">SKU / Product</th>
                <th className="py-3.5 px-4">Warehouse & Bin</th>
                <th className="py-3.5 px-4 text-right">On-Hand</th>
                <th className="py-3.5 px-4 text-right">Reserved</th>
                <th className="py-3.5 px-4 text-right">Available</th>
                <th className="py-3.5 px-4 text-right">Min Stock</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">ATP Calculation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading stock balance records...
                  </td>
                </tr>
              ) : balances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No stock inventory balances match your search query.
                  </td>
                </tr>
              ) : (
                balances.map((item) => {
                  const onHand = Number(item.on_hand_quantity || 0);
                  const reserved = Number(item.reserved_quantity || 0);
                  const available = Number(item.available_quantity || Math.max(0, onHand - reserved));
                  const minStock = Number(item.products?.minimum_stock || item.minimum_stock || 0);

                  return (
                    <tr key={item.id} className="hover:bg-slate-700/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{item.products?.name || 'Unspecified Component'}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {item.products?.product_code || 'PROD-N/A'}{' '}
                          {item.products?.drawing_number && `| Drg: ${item.products.drawing_number}`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          {item.warehouses?.name || 'Default Facility'}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          Bin: {item.storage_locations?.location_code || 'General Storage'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-white">
                        {onHand} <span className="text-xs font-normal text-slate-400">{item.products?.unit || 'pcs'}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-amber-400">
                        {reserved > 0 ? (
                          <span className="flex items-center justify-end gap-1">
                            <Lock className="w-3 h-3" /> {reserved}
                          </span>
                        ) : (
                          '0'
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {available}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-400">
                        {minStock}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                            item.status === 'out_of_stock'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : item.status === 'low_stock'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {item.status === 'out_of_stock' ? (
                            <>
                              <XCircle className="w-3 h-3" /> Out of Stock
                            </>
                          ) : item.status === 'low_stock' ? (
                            <>
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> In Stock
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenATP(item.product_id, item.warehouse_id)}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-blue-400 rounded-lg text-xs font-medium transition inline-flex items-center gap-1 border border-slate-600"
                        >
                          <Info className="w-3.5 h-3.5" /> View ATP
                        </button>
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

      {/* ATP Telemetry Modal */}
      {atpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Available-to-Promise (ATP)</h3>
              </div>
              <button onClick={() => setAtpModal(null)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                <span>Physical On-Hand Quantity:</span>
                <span className="font-bold text-white">{atpModal.onHand}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800 text-amber-400">
                <span>Reserved Stock:</span>
                <span className="font-bold">- {atpModal.reserved}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800 text-rose-400">
                <span>Quarantined / Hold:</span>
                <span className="font-bold">- {atpModal.quarantined}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800 text-blue-400 font-medium">
                <span>Net Available Stock:</span>
                <span className="font-bold">{atpModal.netAvailable}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800 text-emerald-400">
                <span>Expected Incoming PO Receipts:</span>
                <span className="font-bold">+ {atpModal.expectedIncoming}</span>
              </div>

              <div className="flex justify-between py-3 bg-blue-950/40 p-3 rounded-xl border border-blue-800/50 mt-3 text-white font-bold text-base">
                <span>Final Available-To-Promise (ATP):</span>
                <span className="text-emerald-400 text-lg">{atpModal.atp}</span>
              </div>
            </div>

            <button
              onClick={() => setAtpModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition text-sm mt-4"
            >
              Close Telemetry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
