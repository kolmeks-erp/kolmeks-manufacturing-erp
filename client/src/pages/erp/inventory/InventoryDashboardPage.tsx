import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Building2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Lock,
  Package,
  Barcode,
  TrendingUp,
  PieChart,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  Activity,
} from 'lucide-react';
import inventoryService, { InventorySummary, ReorderDashboardItem } from '../../../services/inventory.service';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const InventoryDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [valuation, setValuation] = useState<number>(0);
  const [criticalItems, setCriticalItems] = useState<ReorderDashboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, valRes, reorderRes] = await Promise.all([
        inventoryService.getInventorySummary(),
        inventoryService.getInventoryValuation(),
        inventoryService.getReorderDashboard(),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (valRes.success) setValuation(valRes.data.totalValuation || 0);
      if (reorderRes.success && reorderRes.data?.items) {
        const breach = reorderRes.data.items.filter(
          (i: ReorderDashboardItem) => i.status === 'CRITICAL_SAFETY_BREACH' || i.status === 'OUT_OF_STOCK'
        );
        setCriticalItems(breach);
      }
    } catch (err) {
      console.error('Failed to load inventory dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Boxes className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Advanced Inventory & Stock Control</h1>
              <p className="text-sm text-slate-400 mt-1">
                Multi-warehouse stock balances, lot & serial tracking, transfers, reservations, and ATP engine
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/stock`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition flex items-center gap-2 text-sm shadow-lg shadow-blue-600/20"
          >
            <Boxes className="w-4 h-4" /> Stock Balances
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory/transfers`)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium transition flex items-center gap-2 text-sm border border-slate-600"
          >
            <RefreshCw className="w-4 h-4" /> New Stock Transfer
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-700/50 hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Stock Items</span>
            <Boxes className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {loading ? '...' : summary?.totalStockItems || 0}
          </div>
          <p className="text-xs text-slate-400 mt-1">SKU location records</p>
        </div>

        <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-700/50 hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">On-Hand Units</span>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {loading ? '...' : (summary?.totalOnHandUnits || 0).toLocaleString()}
          </div>
          <p className="text-xs text-emerald-400 mt-1">Physical stock available</p>
        </div>

        <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-700/50 hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Stock Value</span>
            <DollarSign className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {loading ? '...' : formatCurrency(valuation)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Estimated asset valuation</p>
        </div>

        <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-700/50 hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Alerts</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {loading ? '...' : summary?.lowStockCount || 0}
          </div>
          <p className="text-xs text-amber-300/80 mt-1">At or below minimum stock</p>
        </div>

        <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-700/50 hover:border-rose-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Out of Stock</span>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {loading ? '...' : summary?.outOfStockCount || 0}
          </div>
          <p className="text-xs text-rose-300/80 mt-1">Critical stockout count</p>
        </div>
      </div>

      {/* Module Hub Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Stock Overview', path: '/inventory/stock', icon: Boxes, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Warehouses & Bins', path: '/inventory/warehouses', icon: Building2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Stock Movements', path: '/inventory/movements', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Inter-WH Transfers', path: '/inventory/transfers', icon: RefreshCw, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Physical Adjustments', path: '/inventory/adjustments', icon: Sliders, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Stock Reservations', path: '/inventory/reservations', icon: Lock, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Batch / Lots', path: '/inventory/batches', icon: Package, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Serial Numbers', path: '/inventory/serial-numbers', icon: Barcode, color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { label: 'Reorder Engine', path: '/inventory/reorder', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Valuation & Reports', path: '/inventory/reports', icon: PieChart, color: 'text-sky-400', bg: 'bg-sky-500/10' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => navigate(`${ERP_BASE_PATH}${item.path}`)}
            className="p-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700/60 transition flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className={`p-2.5 rounded-lg ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Grid: Critical Reorder Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Safety Stock Breaches */}
        <div className="lg:col-span-2 bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Critical Replenishment Alerts</h2>
            </div>
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/inventory/reorder`)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View Reorder Engine <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {criticalItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-700/40">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-medium">All active stock items are in healthy levels.</p>
              <p className="text-xs text-slate-400 mt-1">No critical safety stock breaches detected.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalItems.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded ${
                        item.status === 'OUT_OF_STOCK'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.product.name}</h4>
                      <p className="text-xs text-slate-400">
                        Code: <span className="text-slate-300 font-mono">{item.product.product_code}</span> | Unit: {item.product.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Available / Reorder</p>
                      <p className="text-sm font-bold text-white">
                        <span className={item.available <= item.safety_stock ? 'text-rose-400' : 'text-slate-200'}>
                          {item.available}
                        </span>{' '}
                        / {item.reorder_point}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`${ERP_BASE_PATH}/inventory/reorder`)}
                      className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition"
                    >
                      Order {item.suggested_order_qty}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stock Summary & Warehouses */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Warehouse Overview</h2>
            <button
              onClick={() => navigate(`${ERP_BASE_PATH}/inventory/warehouses`)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/40">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white">WH-001 Main Production & RM</span>
                <span className="text-blue-400">Vantaa</span>
              </div>
              <p className="text-xs text-slate-400">Bar stock, heavy steel plates & CNC billets</p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
                <span>Locations: 3 storage bins</span>
                <span className="text-emerald-400 font-mono">Active</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/40">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white">WH-002 Finished Goods Hub</span>
                <span className="text-blue-400">Helsinki</span>
              </div>
              <p className="text-xs text-slate-400">Finished CNC parts & motor assembly dispatch</p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
                <span>Locations: Staging & Shipping</span>
                <span className="text-emerald-400 font-mono">Active</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/40">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white">WH-003 Sub-Assembly Depot</span>
                <span className="text-blue-400">Espoo</span>
              </div>
              <p className="text-xs text-slate-400">Precision machined parts & electric coils</p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
                <span>Locations: Depot Racks</span>
                <span className="text-emerald-400 font-mono">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
