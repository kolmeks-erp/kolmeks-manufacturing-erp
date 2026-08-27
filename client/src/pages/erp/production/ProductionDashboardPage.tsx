import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory,
  Cpu,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Plus,
  ArrowRight,
  FolderTree,
  GitFork,
  Boxes,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { productionService } from '../../../services/production.service';
import { ProductionSummary } from '../../../types/production';

export const ProductionDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ProductionSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await productionService.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load production summary:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Factory className="w-3.5 h-3.5" />
            <span>Kolmeks CNC Manufacturing Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Production & Manufacturing Operations</h1>
          <p className="text-slate-400 text-sm">
            Real-time monitoring of manufacturing orders, active CNC machines, BOM definitions, and shop floor routings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/production/orders/new`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Production Order</span>
          </button>
        </div>
      </div>

      {/* KPI Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Planned / Scheduled */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Planned Orders</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{loading ? '...' : summary?.planned_count || 0}</span>
            <span className="text-xs text-slate-400">Ready to release</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 border-t border-slate-800/60 pt-2.5">
            Awaiting shop floor dispatch
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">In Production</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Play className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{loading ? '...' : summary?.in_progress_count || 0}</span>
            <span className="text-xs text-indigo-400 font-medium">Active jobs</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 border-t border-slate-800/60 pt-2.5">
            Operations currently executing
          </div>
        </div>

        {/* Completed */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed Jobs</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{loading ? '...' : summary?.completed_count || 0}</span>
            <span className="text-xs text-emerald-400 font-medium">Finished goods</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 border-t border-slate-800/60 pt-2.5">
            Posted to warehouse inventory
          </div>
        </div>

        {/* Active Machines */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active CNC Machines</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {loading ? '...' : `${summary?.running_machines || 0} / ${summary?.total_machines || 0}`}
            </span>
            <span className="text-xs text-slate-400">Running</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 border-t border-slate-800/60 pt-2.5">
            ERP-maintained operational status
          </div>
        </div>
      </div>

      {/* Quick Navigation Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Production Orders Card */}
        <div
          onClick={() => navigate(`${ERP_BASE_PATH}/production/orders`)}
          className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Production Orders</h3>
          <p className="text-slate-400 text-sm">
            Track manufacturing orders, planned quantities, operations progress, material requirements, and finished output.
          </p>
        </div>

        {/* Bills of Materials (BOM) Card */}
        <div
          onClick={() => navigate(`${ERP_BASE_PATH}/production/boms`)}
          className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <FolderTree className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Bills of Materials (BOM)</h3>
          <p className="text-slate-400 text-sm">
            Define multi-level product components, quantity per unit, scrap percentages, and version lifecycle management.
          </p>
        </div>

        {/* Manufacturing Routings Card */}
        <div
          onClick={() => navigate(`${ERP_BASE_PATH}/production/routings`)}
          className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <GitFork className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Manufacturing Routings</h3>
          <p className="text-slate-400 text-sm">
            Configure sequence of shop floor operations, setup & run times, work center assignments, and machine routing.
          </p>
        </div>
      </div>
    </div>
  );
};
