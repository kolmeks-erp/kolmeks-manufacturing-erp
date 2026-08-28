import React, { useEffect, useState } from 'react';
import { ShieldCheck, Calendar, Wrench, Package } from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import EmptyState from '../../../components/erp/EmptyState';
import { maintenanceService } from '../../../services/maintenance.service';
import { WorkOrder } from '../../../types/maintenance';

const MaintenanceHistoryPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<WorkOrder[]>([]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await maintenanceService.getMaintenanceHistory();
      setHistory(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load maintenance history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Maintenance Audit History"
        subtitle="Completed work orders, resolution logs, spare part consumption & downtime audit trail"
      />

      {loading ? (
        <LoadingState message="Loading maintenance audit history..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchHistory} />
      ) : history.length === 0 ? (
        <EmptyState
          title="No completed maintenance history"
          description="Completed work orders will be archived here for audit compliance."
        />
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {item.work_order_number}
                  </span>
                  <span className="text-xs font-semibold uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {item.maintenance_type}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    COMPLETED
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Completed: {item.actual_end ? new Date(item.actual_end).toLocaleString() : 'N/A'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Asset Equipment</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{item.assets?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Technician</span>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">
                    {item.assigned_profile ? `${item.assigned_profile.first_name || ''} ${item.assigned_profile.last_name || ''}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Downtime Recorded</span>
                  <p className="text-sm font-mono font-bold text-indigo-600 mt-0.5">{item.downtime_minutes || 0} Mins</p>
                </div>
              </div>

              {item.resolution && (
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Resolution & Corrective Actions: </span>
                  {item.resolution}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceHistoryPage;
