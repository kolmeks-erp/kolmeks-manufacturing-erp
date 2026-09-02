import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins,
  Calculator,
  Activity,
  TrendingDown,
  TrendingUp,
  Settings,
  FileText,
  IndianRupee,
  Layers,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { costingService } from '../../../../services/costing.service';

interface DashboardMetrics {
  total_wip_value: number;
  open_wip_orders: number;
  completed_production_cost: number;
  completed_orders_count: number;
  average_unit_cost: number;
  breakdown: {
    material_cost: number;
    labor_cost: number;
    overhead_cost: number;
    total_variance: number;
  };
  recent_orders: any[];
}

export const ManufacturingCostDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await costingService.getDashboard();
      if (res.success) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Error fetching costing dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const navCards = [
    {
      title: 'Production Costs',
      desc: 'View & calculate costing per production order',
      icon: Calculator,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      path: '/secure-kolmeks-x0y0/production/costing/orders',
    },
    {
      title: 'Work In Progress (WIP)',
      desc: 'Track incomplete production costs & WIP aging',
      icon: Activity,
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      path: '/secure-kolmeks-x0y0/production/wip',
    },
    {
      title: 'Cost Variance Analysis',
      desc: 'Compare planned BOM/Routing vs actual execution',
      icon: TrendingDown,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      path: '/secure-kolmeks-x0y0/production/costing/variance',
    },
    {
      title: 'Cost Configuration',
      desc: 'Manage Work Center rates & GL account mappings',
      icon: Settings,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      path: '/secure-kolmeks-x0y0/production/costing/configuration',
    },
    {
      title: 'Cost Reports',
      desc: 'Financial analytics by Product & Cost Center',
      icon: FileText,
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      path: '/secure-kolmeks-x0y0/production/costing/reports',
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Coins className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manufacturing Costing & WIP Accounting</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Real-time absorption costing, WIP tracking, labor foundation, overhead allocation & GL journal integration
            </p>
          </div>
        </div>
        <button
          onClick={fetchMetrics}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open WIP Value */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-sm font-medium">Open WIP Value</span>
            <Activity className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {loading ? '...' : formatCurrency(metrics?.total_wip_value || 0)}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            {metrics?.open_wip_orders || 0} Open Orders In Progress
          </div>
        </div>

        {/* Completed Production Cost */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-sm font-medium">Completed Cost</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {loading ? '...' : formatCurrency(metrics?.completed_production_cost || 0)}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {metrics?.completed_orders_count || 0} Posted / Closed Orders
          </div>
        </div>

        {/* Average Unit Cost */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-sm font-medium">Average Unit Cost</span>
            <IndianRupee className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {loading ? '...' : formatCurrency(metrics?.average_unit_cost || 0)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Per Finished Goods Unit</div>
        </div>

        {/* Total Cost Variance */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-sm font-medium">Production Variance</span>
            <TrendingUp className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          </div>
          <div className={`text-2xl font-bold mb-1 ${(metrics?.breakdown?.total_variance || 0) >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {loading ? '...' : formatCurrency(metrics?.breakdown?.total_variance || 0)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Actual vs Planned Baseline</div>
        </div>
      </div>

      {/* Cost Distribution & Quick Nav Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Element Breakdown */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl lg:col-span-1 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Cost Absorption Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500 dark:text-slate-400">Direct Material Cost</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {formatCurrency(metrics?.breakdown?.material_cost || 0)}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500 dark:text-slate-400">Direct Labor Cost</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {formatCurrency(metrics?.breakdown?.labor_cost || 0)}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500 dark:text-slate-400">Manufacturing Overhead</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {formatCurrency(metrics?.breakdown?.overhead_cost || 0)}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl lg:col-span-2 space-y-4 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Cost Management Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {navCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(card.path)}
                  className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-slate-700 rounded-xl cursor-pointer transition flex items-start gap-4 group"
                >
                  <div className={`p-3 rounded-lg border ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-slate-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-emerald-400 transition">
                        {card.title}
                      </h4>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-emerald-400 transition" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturingCostDashboardPage;
