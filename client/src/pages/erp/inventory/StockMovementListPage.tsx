import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  History,
  Search,
  RefreshCw,
  ArrowLeft,
  Building2,
  Boxes,
  FileText,
  SlidersHorizontal,
  ArrowLeftRight,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { inventoryService } from '../../../services/inventory.service';
import { warehouseService } from '../../../services/warehouse.service';
import { StockMovement, Warehouse } from '../../../types/inventory';

export const StockMovementListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialProductId = searchParams.get('product_id') || '';

  const [loading, setLoading] = useState<boolean>(true);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Filter state
  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [selectedRefType, setSelectedRefType] = useState<string>('');
  const [productIdFilter, setProductIdFilter] = useState<string>(initialProductId);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalMovements, setTotalMovements] = useState<number>(0);

  const fetchWarehouses = async () => {
    try {
      const res = await warehouseService.getWarehouses();
      if (res.success) setWarehouses(res.data);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getStockMovements({
        page,
        limit: 15,
        search,
        movement_type: selectedType,
        warehouse_id: selectedWarehouse,
        product_id: productIdFilter,
        reference_type: selectedRefType,
      });

      if (res.success) {
        setMovements(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalMovements(res.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [page, search, selectedType, selectedWarehouse, selectedRefType, productIdFilter]);

  const handleReset = () => {
    setSearch('');
    setSelectedType('');
    setSelectedWarehouse('');
    setSelectedRefType('');
    setProductIdFilter('');
    setPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory`)}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-2 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory Balances</span>
          </button>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Stock Movement Transaction Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable, audit-ready record of all stock receipts, adjustments, transfers, and issues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/adjustments/new`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>New Adjustment</span>
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/transfers/new`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Txn #, Code, Reason..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Movement Type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Movement Types</option>
              <option value="RECEIPT">RECEIPT (GRN)</option>
              <option value="ADJUSTMENT_IN">ADJUSTMENT IN (+)</option>
              <option value="ADJUSTMENT_OUT">ADJUSTMENT OUT (-)</option>
              <option value="TRANSFER_IN">TRANSFER IN (+)</option>
              <option value="TRANSFER_OUT">TRANSFER OUT (-)</option>
            </select>
          </div>

          {/* Warehouse */}
          <div>
            <select
              value={selectedWarehouse}
              onChange={(e) => {
                setSelectedWarehouse(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.code} — {wh.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reference Type */}
          <div>
            <select
              value={selectedRefType}
              onChange={(e) => {
                setSelectedRefType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Reference Types</option>
              <option value="GRN">Goods Receipt Note (GRN)</option>
              <option value="ADJUSTMENT">Stock Adjustment</option>
              <option value="TRANSFER">Stock Transfer</option>
            </select>
          </div>

          {/* Reset Button */}
          <div>
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition border border-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Txn Reference #</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Movement Type</th>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5 text-right">Quantity</th>
                <th className="px-4 py-3.5">Depot / Location</th>
                <th className="px-4 py-3.5">Reason & Reference</th>
                <th className="px-4 py-3.5">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <span>Loading movement audit log...</span>
                    </div>
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="w-10 h-10 text-slate-400" />
                      <span className="font-semibold text-slate-700">No stock movements found</span>
                      <span className="text-xs text-slate-500">
                        Try adjusting your filters or record a new transaction.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isPositive = ['RECEIPT', 'ADJUSTMENT_IN', 'TRANSFER_IN'].includes(m.movement_type);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-mono font-semibold text-indigo-600">
                        {m.transaction_number}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                        {new Date(m.transaction_date).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold uppercase font-mono ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {m.movement_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{m.products?.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{m.products?.product_code}</div>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold font-mono text-base ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? `+${m.quantity}` : `-${m.quantity}`} {m.unit}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{m.warehouses?.name}</div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <span className="text-indigo-600">{m.warehouses?.code}</span>
                          {m.storage_locations && <span className="text-slate-400">/ {m.storage_locations.location_code}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700 text-xs font-medium">{m.reason || '—'}</div>
                        {m.reference_type && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">Ref: {m.reference_type}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {m.profiles?.full_name || 'System Auto'}
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
              Showing {movements.length} of {totalMovements} movement logs
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded font-medium transition shadow-sm"
              >
                Previous
              </button>
              <span className="font-semibold text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded font-medium transition shadow-sm"
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
