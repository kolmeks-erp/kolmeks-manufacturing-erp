import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  Layers, 
  CheckCircle2, 
  Timer,
  Activity,
  ArrowRight
} from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { maintenanceService } from '../../../services/maintenance.service';
import { MaintenanceKPIs, WorkOrder, MaintenanceSchedule } from '../../../types/maintenance';

const MaintenanceDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<MaintenanceKPIs | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpiRes, woRes, schedRes] = await Promise.all([
        maintenanceService.getDashboardKPIs(),
        maintenanceService.getWorkOrders({ limit: 5, status: 'IN_PROGRESS' }),
        maintenanceService.getMaintenanceSchedules({ status: 'ACTIVE' })
      ]);
      setKpis(kpiRes);
      setWorkOrders(woRes.data || []);
      setSchedules(schedRes || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load maintenance telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingState message="Loading Maintenance & Asset Telemetry..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboardData} />;

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      {/* Modern Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 shrink-0">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance & Asset Operations</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Real-time machinery readiness, preventive routines, breakdown logs & work order execution
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/secure-kolmeks-x0y0/maintenance/requests"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors border border-amber-200 shadow-xs"
          >
            <AlertTriangle className="w-4 h-4" /> Log Issue Request
          </Link>
          <Link
            to="/secure-kolmeks-x0y0/maintenance/work-orders/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> New Work Order
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Registered Assets</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis?.totalAssets || 0}</h3>
            <p className="text-xs text-slate-500 mt-1">CNC Lathes, Mills, Compressors</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assets In Maintenance</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {kpis?.assetsUnderMaintenance || 0}
              {kpis?.breakdownAssets ? (
                <span className="text-xs font-semibold text-red-600 ml-2">({kpis.breakdownAssets} Breakdown)</span>
              ) : null}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Active repair / downtime</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Open Work Orders</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis?.openWorkOrders || 0}</h3>
            <p className="text-xs text-slate-500 mt-1">{kpis?.completedWorkOrders || 0} completed recently</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overdue PM Routines</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{kpis?.overduePMs || 0}</h3>
            <p className="text-xs text-slate-500 mt-1">{kpis?.upcomingPMs || 0} PMs upcoming</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active In-Progress Work Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Work Orders In-Progress</h2>
            </div>
            <Link
              to="/secure-kolmeks-x0y0/maintenance/work-orders"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {workOrders.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium">No active maintenance work orders in progress</p>
              <p className="text-xs text-slate-400 mt-0.5">All machines operating normally or scheduled PM up to date</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {workOrders.map((wo) => (
                <div key={wo.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {wo.work_order_number}
                      </span>
                      <span className={`text-xs px-2 py-0.5 font-medium rounded ${
                        wo.priority === 'URGENT' || wo.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {wo.priority}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 uppercase">{wo.maintenance_type}</span>
                    </div>
                    <h4 className="text-sm font-medium text-slate-900">{wo.title}</h4>
                    <p className="text-xs text-slate-500">
                      Asset: <span className="font-semibold text-slate-700">{wo.assets?.name || 'N/A'}</span> ({wo.assets?.asset_code})
                    </p>
                  </div>
                  <Link
                    to={`/secure-kolmeks-x0y0/maintenance/work-orders/${wo.id}`}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
                  >
                    Manage Execution
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preventive Maintenance Schedule Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="font-semibold text-slate-900">PM Schedules</h2>
            </div>
            <Link
              to="/secure-kolmeks-x0y0/maintenance/schedules"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {schedules.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No active PM schedules configured.</p>
          ) : (
            <div className="space-y-3">
              {schedules.slice(0, 5).map((sched) => (
                <div key={sched.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700">{sched.schedule_number}</span>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      Due: {sched.next_due_date}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-900">{sched.title}</p>
                  <p className="text-xs text-slate-500">{sched.assets?.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboardPage;
