import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { inventoryService } from '../../../services/inventory.service';
import { warehouseService } from '../../../services/warehouse.service';
import { InventoryItem, InventorySummary, Warehouse } from '../../../types/inventory';

export const InventoryListPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Filter State
  const [search, setSearch] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchSummaryAndWarehouses = async () => {
    try {
      const [sumRes, whRes] = await Promise.all([
        inventoryService.getInventorySummary(),
        warehouseService.getWarehouses({ status: 'active' }),
      ]);
      if (sumRes.success) setSummary(sumRes.data);
      if (whRes.success) setWarehouses(whRes.data);
    } catch (err) {
      console.error('Error loading inventory summary or warehouses:', err);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getInventory({
        page,
        limit: 10,
        search,
        warehouse_id: selectedWarehouse,
        stock_status: selectedStatus,
      });

      if (res.success) {
        setInventory(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryAndWarehouses();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [page, search, selectedWarehouse, selectedStatus]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedWarehouse('');
    setSelectedStatus('');
    setPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Boxes className="w-4 h-4" />
            <span>Kolmeks ERP Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Inventory & Stock Balances</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-warehouse stock availability derived from verified ledger movements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/movements`)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition border border-slate-700"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>Movement Log</span>
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/warehouses`)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition border border-slate-700"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Warehouses</span>
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/adjustments/new`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-indigo-600/20"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>New Adjustment</span>
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/transfers/new`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-cyan-600/20"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Items</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{summary?.totalStockItems || 0}</span>
            <Boxes className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Unique stock records</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Hand Units</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-cyan-400">{summary?.totalOnHandUnits.toLocaleString() || 0}</span>
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Physical count on shelf</span>
        </div>

        <div className="bg-slate-900/80 border border-amber-900/40 bg-amber-950/10 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Low Stock</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-300">{summary?.lowStockCount || 0}</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[11px] text-amber-400/70 mt-1">At or below reorder limit</span>
        </div>

        <div className="bg-slate-900/80 border border-rose-900/40 bg-rose-950/10 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Out of Stock</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-300">{summary?.outOfStockCount || 0}</span>
            <XCircle className="w-5 h-5 text-rose-400" />
          </div>
          <span className="text-[11px] text-rose-400/70 mt-1">Zero quantity on hand</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Depots</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400">{summary?.activeWarehouses || 0}</span>
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Warehouses configured</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search code, name, part #..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Warehouse Dropdown */}
          <div>
            <select
              value={selectedWarehouse}
              onChange={(e) => {
                setSelectedWarehouse(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.code} — {wh.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Reset Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stock Balances Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Product Code</th>
                <th className="px-4 py-3.5">Product Name</th>
                <th className="px-4 py-3.5">Warehouse / Location</th>
                <th className="px-4 py-3.5 text-right">On Hand</th>
                <th className="px-4 py-3.5 text-right">Reserved</th>
                <th className="px-4 py-3.5 text-right">Available</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                      <span>Loading inventory ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Boxes className="w-10 h-10 text-slate-600" />
                      <span className="font-semibold text-slate-300">No stock balances found</span>
                      <span className="text-xs text-slate-500">
                        Try adjusting your search criteria or add new inventory.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const prod = item.products;
                  const wh = item.warehouses;
                  const loc = item.storage_locations;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`${ERP_BASE_PATH}/inventory/${item.product_id}`)}
                      className="hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-indigo-300">
                        {prod?.product_code || '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">
                        <div>{prod?.name || 'Unknown Product'}</div>
                        {prod?.drawing_number && (
                          <div className="text-[11px] text-slate-500 font-mono">Drawing: {prod.drawing_number}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{wh?.name || 'Main Warehouse'}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                          <span className="text-indigo-400 font-semibold">{wh?.code}</span>
                          {loc && <span className="text-slate-500">/ {loc.location_code}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-white">
                        {item.on_hand_quantity.toLocaleString()}{' '}
                        <span className="text-xs text-slate-400 font-normal">{prod?.unit || 'pcs'}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400">
                        {item.reserved_quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400">
                        {item.available_quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.status === 'in_stock' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                            <CheckCircle2 className="w-3 h-3" />
                            In Stock
                          </span>
                        )}
                        {item.status === 'low_stock' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/50">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        )}
                        {item.status === 'out_of_stock' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/50">
                            <XCircle className="w-3 h-3" />
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {inventory.length} of {totalItems} stock records
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 rounded font-medium transition"
              >
                Previous
              </button>
              <span className="font-semibold text-slate-300">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 rounded font-medium transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
