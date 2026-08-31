import React, { useEffect, useState } from 'react';
import {
  Gauge,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Cpu,
  Clock,
  Wrench,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import ERPPageHeader from '../../../../components/erp/ERPPageHeader';
import LoadingState from '../../../../components/erp/LoadingState';
import ErrorState from '../../../../components/erp/ErrorState';
import EmptyState from '../../../../components/erp/EmptyState';
import { planningService, WorkCenterCapacity } from '../../../../services/planning.service';

const CapacityPlanningPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [capacityData, setCapacityData] = useState<WorkCenterCapacity[]>([]);

  const fetchCapacity = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await planningService.getCapacityPlanning();
      if (res.success) {
        setCapacityData(res.data || []);
      } else {
        setError(res.message || 'Failed to load capacity planning data.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error calculating work center capacity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapacity();
  }, []);

  const overCapacityCount = capacityData.filter((wc) => wc.status === 'OVER_CAPACITY').length;

  return (
    <ERPLayout>
      <div className="space-y-6">
        <ERPPageHeader
          title="Work Center Capacity Planning"
          subtitle="Work center hourly capacity, shift availability, maintenance downtime, and scheduled production load"
          actions={
            <button
              onClick={fetchCapacity}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <RefreshCw size={14} /> Recalculate Load
            </button>
          }
        />

        {/* Over Capacity Alert */}
        {overCapacityCount > 0 && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between text-rose-400 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle size={18} />
              <span>
                OVER CAPACITY WARNING: {overCapacityCount} Work Center(s) have scheduled production hours exceeding available shift capacity.
              </span>
            </div>
            <span className="text-xs bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded font-mono">
              Action Needed
            </span>
          </div>
        )}

        {/* Work Centers Grid */}
        {loading ? (
          <LoadingState message="Calculating Work Center Hourly Load & Maintenance Downtime..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchCapacity} />
        ) : capacityData.length === 0 ? (
          <EmptyState
            title="No Work Center Capacity Found"
            description="Ensure that Work Centers are active and machines are registered in the system."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capacityData.map((wc) => (
              <div
                key={wc.work_center_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-blue-400 font-semibold">{wc.code}</div>
                    <h3 className="text-base font-bold text-slate-100">{wc.name}</h3>
                    <div className="text-xs text-slate-400">{wc.type}</div>
                  </div>
                  <div>
                    {wc.status === 'OVER_CAPACITY' ? (
                      <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full font-bold text-xs">
                        OVER CAPACITY
                      </span>
                    ) : wc.status === 'HIGH_LOAD' ? (
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold text-xs">
                        HIGH LOAD
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-xs">
                        NORMAL
                      </span>
                    )}
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Capacity Utilization</span>
                    <span className="font-mono font-bold text-slate-200">{wc.utilization_pct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        wc.utilization_pct > 100
                          ? 'bg-rose-500'
                          : wc.utilization_pct > 85
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, wc.utilization_pct)}%` }}
                    />
                  </div>
                </div>

                {/* Capacity Hours Breakdown */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400 text-[11px]">Gross Available</div>
                    <div className="font-mono font-semibold text-slate-200 mt-0.5">{wc.total_available_hours} hrs</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Maintenance Downtime</div>
                    <div className="font-mono font-semibold text-amber-400 mt-0.5">{wc.maintenance_downtime_hours} hrs</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Scheduled Load</div>
                    <div className="font-mono font-semibold text-blue-400 mt-0.5">{wc.scheduled_hours} hrs</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Net Available</div>
                    <div className="font-mono font-semibold text-emerald-400 mt-0.5">{wc.net_available_hours} hrs</div>
                  </div>
                </div>

                {/* Machines List */}
                <div className="pt-2 border-t border-slate-800 text-xs">
                  <div className="text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                    <Cpu size={13} /> Assigned Machines ({wc.machines?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(wc.machines || []).map((m: any) => (
                      <span key={m.id} className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[11px] font-mono">
                        {m.name} ({m.code})
                      </span>
                    ))}
                    {(wc.machines || []).length === 0 && <span className="text-slate-500 italic">No machines assigned</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ERPLayout>
  );
};

export default CapacityPlanningPage;
