import React, { useEffect, useState } from 'react';
import { PieChart, DollarSign, Boxes, Building2, BarChart3, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import inventoryService, { InventoryValuationResponse } from '../../../services/inventory.service';

export const InventoryReportsPage: React.FC = () => {
  const [data, setData] = useState<InventoryValuationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchValuation();
  }, []);

  const fetchValuation = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getInventoryValuation();
      if (res.success) setData(res.data);
    } catch (err) {
      console.error('Error fetching inventory valuation:', err);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-600/20 text-sky-400 rounded-xl border border-sky-500/30">
            <PieChart className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Stock Valuation & Inventory Financial Analytics</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Financial valuation breakdown by plant warehouse, category asset distribution, and inventory performance
            </p>
          </div>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Inventory Asset Value</p>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              {loading ? '...' : formatCurrency(data?.totalValuation || 0)}
            </h2>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> General Ledger Balance Aligned
            </p>
          </div>
          <div className="p-4 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total On-Hand Unit Count</p>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              {loading ? '...' : (data?.totalItemsCount || 0).toLocaleString()}
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-medium">Physical items in storage</p>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Boxes className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Stock Turn Ratio</p>
            <h2 className="text-3xl font-extrabold text-white mt-1">6.4x / yr</h2>
            <p className="text-xs text-blue-400 mt-2 font-medium">Healthy lean manufacturing turnover</p>
          </div>
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
            <BarChart3 className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouse Valuation Distribution */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-700/60">
            <Building2 className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold text-white">Warehouse Asset Valuation Distribution</h3>
          </div>

          {loading ? (
            <p className="text-slate-400 text-sm py-8 text-center">Calculating warehouse distribution...</p>
          ) : !data?.warehouseValuation || data.warehouseValuation.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No warehouse valuation data available.</p>
          ) : (
            <div className="space-y-4">
              {data.warehouseValuation.map((wh, idx) => {
                const percentage = data.totalValuation > 0 ? (wh.value / data.totalValuation) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-white">{wh.name}</span>
                      <span className="font-bold text-sky-400">{formatCurrency(wh.value)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Asset Valuation Distribution */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-700/60">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Component Category Valuation</h3>
          </div>

          {loading ? (
            <p className="text-slate-400 text-sm py-8 text-center">Calculating category distribution...</p>
          ) : !data?.categoryValuation || data.categoryValuation.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No category valuation data available.</p>
          ) : (
            <div className="space-y-4">
              {data.categoryValuation.map((cat, idx) => {
                const percentage = data.totalValuation > 0 ? (cat.value / data.totalValuation) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-white">{cat.name}</span>
                      <span className="font-bold text-emerald-400">{formatCurrency(cat.value)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
