import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarRange,
  ClipboardList,
  PackageCheck,
  Gauge,
  Clock,
  Calendar as CalendarIcon,
  BarChart2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import ERPPageHeader from '../../../../components/erp/ERPPageHeader';
import StatusBadge from '../../../../components/erp/StatusBadge';
import LoadingState from '../../../../components/erp/LoadingState';
import ErrorState from '../../../../components/erp/ErrorState';
import { ERP_BASE_PATH } from '../../../../constants/navigation';
import { planningService } from '../../../../services/planning.service';

const ProductionPlanningDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await planningService.getDashboard();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load dashboard data.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading production planning telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <ERPLayout><LoadingState message="Loading Production Planning Telemetry..." /></ERPLayout>;
  if (error) return <ERPLayout><ErrorState message={error} onRetry={fetchDashboardData} /></ERPLayout>;

  const summary = data?.summary || {};

  return (
    <ERPLayout>
      <div className="space-y-6">
        <ERPPageHeader
          title="Production Planning & Scheduling"
          subtitle="Sales demand analysis, material requirement explosion (MRP), work center capacity, and shop floor scheduling"
          actions={
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDashboardData}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/plans/new`)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
              >
                <Plus size={16} /> New Production Plan
              </button>
            </div>
          }
        />

        {/* Telemetry KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Production Plans</span>
              <ClipboardList className="text-blue-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-slate-100">{summary.active_plans || 0}</div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
              <span className="text-slate-500">{summary.draft_plans || 0} Drafts</span>
              <span>•</span>
              <span className="text-slate-500">{summary.total_plans || 0} Total</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Sales Demand Queue</span>
              <PackageCheck className="text-emerald-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-slate-100">{summary.pending_demand_items || 0}</div>
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Confirmed Sales Orders Ready
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Work Schedules</span>
              <Clock className="text-indigo-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-slate-100">{summary.active_schedules || 0}</div>
            <div className="mt-2 text-xs text-slate-400">
              {summary.conflicted_schedules > 0 ? (
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  <AlertTriangle size={12} /> {summary.conflicted_schedules} Conflicts Detected
                </span>
              ) : (
                <span className="text-slate-400">0 Overlap Conflicts</span>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Work Centers Loaded</span>
              <Gauge className="text-cyan-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-slate-100">{summary.active_work_centers || 0}</div>
            <div className="mt-2 text-xs text-slate-400">Active Work Centers Monitored</div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/plans`)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
              <ClipboardList size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-1 group-hover:text-blue-400 transition-colors">
              Master Production Plans
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Create, review, and approve period-based production plans from sales order demand lines.
            </p>
            <div className="flex items-center text-xs font-medium text-blue-400 gap-1">
              View Production Plans <ArrowRight size={14} />
            </div>
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/materials`)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
              <PackageCheck size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-1 group-hover:text-emerald-400 transition-colors">
              Material Requirements (MRP)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              BOM component explosion, live stock availability comparison, and material shortage flags.
            </p>
            <div className="flex items-center text-xs font-medium text-emerald-400 gap-1">
              Check Material Requirements <ArrowRight size={14} />
            </div>
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/capacity`)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
              <Gauge size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-1 group-hover:text-cyan-400 transition-colors">
              Capacity Planning
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Evaluate work center load, shift capacity, maintenance downtime, and utilization rate %.
            </p>
            <div className="flex items-center text-xs font-medium text-cyan-400 gap-1">
              View Capacity & Utilization <ArrowRight size={14} />
            </div>
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/schedule`)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/50 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-1 group-hover:text-indigo-400 transition-colors">
              Production Scheduling
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Assign work orders to work centers and machines with overlap conflict detection.
            </p>
            <div className="flex items-center text-xs font-medium text-indigo-400 gap-1">
              Open Schedule Board <ArrowRight size={14} />
            </div>
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/calendar`)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-amber-500/50 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
              <CalendarIcon size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-1 group-hover:text-amber-400 transition-colors">
              Production Calendar
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Interactive timeline calendar showing scheduled work orders across days, weeks, and months.
            </p>
            <div className="flex items-center text-xs font-medium text-amber-400 gap-1">
              View Production Calendar <ArrowRight size={14} />
            </div>
          </div>

          <div
            onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/reports`)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
              <BarChart2 size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-1 group-hover:text-purple-400 transition-colors">
              Plan vs Actual Reports
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Compare planned quantities, scheduled execution, completion %, and schedule adherence.
            </p>
            <div className="flex items-center text-xs font-medium text-purple-400 gap-1">
              View Planning Reports <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </ERPLayout>
  );
};

export default ProductionPlanningDashboardPage;
