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
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs tracking-wider uppercase mb-1">
            <Boxes className="w-4 h-4" />
            <span>Kolmeks ERP Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory & Stock Balances</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-warehouse stock availability derived from verified ledger movements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/movements`)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Movement Log</span>
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/warehouses`)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Warehouses</span>
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/adjustments/new`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>New Adjustment</span>
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/transfers/new`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Items</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{summary?.totalStockItems || 0}</span>
            <Boxes className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Unique stock records</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">On-Hand Units</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-cyan-700">{summary?.totalOnHandUnits.toLocaleString() || 0}</span>
            <CheckCircle2 className="w-5 h-5 text-cyan-600" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Physical count on shelf</span>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Low Stock</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700">{summary?.lowStockCount || 0}</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-[11px] text-amber-700 mt-1">At or below reorder limit</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Out of Stock</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-700">{summary?.outOfStockCount || 0}</span>
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <span className="text-[11px] text-rose-700 mt-1">Zero quantity on hand</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Depots</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700">{summary?.activeWarehouses || 0}</span>
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Warehouses configured</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
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
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
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
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stock Balances Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <span>Loading inventory ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Boxes className="w-10 h-10 text-slate-300" />
                      <span className="font-semibold text-slate-700">No stock balances found</span>
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
                      className="hover:bg-slate-50/60 cursor-pointer transition"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-indigo-700">
                        {prod?.product_code || '—'}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <div>{prod?.name || 'Unknown Product'}</div>
                        {prod?.drawing_number && (
                          <div className="text-[11px] text-slate-500 font-mono">Drawing: {prod.drawing_number}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{wh?.name || 'Main Warehouse'}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <span className="text-indigo-700 font-semibold">{wh?.code}</span>
                          {loc && <span className="text-slate-400">/ {loc.location_code}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {item.on_hand_quantity.toLocaleString()}{' '}
                        <span className="text-xs text-slate-500 font-normal">{prod?.unit || 'pcs'}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 font-medium">
                        {item.reserved_quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">
                        {item.available_quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.status === 'in_stock' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            In Stock
                          </span>
                        )}
                        {item.status === 'low_stock' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        )}
                        {item.status === 'out_of_stock' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
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
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {inventory.length} of {totalItems} stock records
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg font-semibold transition"
              >
                Previous
              </button>
              <span className="font-semibold text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg font-semibold transition"
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
