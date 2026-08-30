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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Factory className="w-3.5 h-3.5" />
            <span>Kolmeks CNC Manufacturing Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Production & Manufacturing Operations</h1>
          <p className="text-slate-600 text-sm">
            Real-time monitoring of manufacturing orders, active CNC machines, BOM definitions, and shop floor routings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/production/orders/new`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-md active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Production Order</span>
          </button>
        </div>
      </div>

      {/* KPI Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Planned / Scheduled */}
        <div className="bg-white border border-slate-200 shadow-xs p-5 rounded-2xl relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Planned Orders</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{loading ? '...' : summary?.planned_count || 0}</span>
            <span className="text-xs text-slate-500">Ready to release</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 border-t border-slate-100 pt-2.5">
            Awaiting shop floor dispatch
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200 shadow-xs p-5 rounded-2xl relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Production</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Play className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{loading ? '...' : summary?.in_progress_count || 0}</span>
            <span className="text-xs text-indigo-700 font-semibold">Active jobs</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 border-t border-slate-100 pt-2.5">
            Operations currently executing
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-slate-200 shadow-xs p-5 rounded-2xl relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Jobs</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{loading ? '...' : summary?.completed_count || 0}</span>
            <span className="text-xs text-emerald-700 font-semibold">Finished goods</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 border-t border-slate-100 pt-2.5">
            Posted to warehouse inventory
          </div>
        </div>

        {/* Active Machines */}
        <div className="bg-white border border-slate-200 shadow-xs p-5 rounded-2xl relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active CNC Machines</span>
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {loading ? '...' : `${summary?.running_machines || 0} / ${summary?.total_machines || 0}`}
            </span>
            <span className="text-xs text-slate-500">Running</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 border-t border-slate-100 pt-2.5">
            ERP-maintained operational status
          </div>
        </div>
      </div>

      {/* Quick Navigation Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Production Orders Card */}
        <div
          onClick={() => navigate(`${ERP_BASE_PATH}/production/orders`)}
          className="bg-white border border-slate-200 shadow-xs p-6 rounded-2xl hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Production Orders</h3>
          <p className="text-slate-600 text-sm">
            Track manufacturing orders, planned quantities, operations progress, material requirements, and finished output.
          </p>
        </div>

        {/* Bills of Materials (BOM) Card */}
        <div
          onClick={() => navigate(`${ERP_BASE_PATH}/production/boms`)}
          className="bg-white border border-slate-200 shadow-xs p-6 rounded-2xl hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-110 transition-transform">
              <FolderTree className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Bills of Materials (BOM)</h3>
          <p className="text-slate-600 text-sm">
            Define multi-level product components, quantity per unit, scrap percentages, and version lifecycle management.
          </p>
        </div>

        {/* Manufacturing Routings Card */}
        <div
          onClick={() => navigate(`${ERP_BASE_PATH}/production/routings`)}
          className="bg-white border border-slate-200 shadow-xs p-6 rounded-2xl hover:border-cyan-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-cyan-50 text-cyan-700 group-hover:scale-110 transition-transform">
              <GitFork className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Manufacturing Routings</h3>
          <p className="text-slate-600 text-sm">
            Configure sequence of shop floor operations, setup & run times, work center assignments, and machine routing.
          </p>
        </div>
      </div>
    </div>
  );
};
