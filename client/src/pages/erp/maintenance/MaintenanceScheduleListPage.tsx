import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Plus, Search, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import EmptyState from '../../../components/erp/EmptyState';
import { maintenanceService } from '../../../services/maintenance.service';
import { MaintenanceSchedule } from '../../../types/maintenance';

const MaintenanceScheduleListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [search, setSearch] = useState('');

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await maintenanceService.getMaintenanceSchedules({ search });
      setSchedules(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load maintenance schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchedules();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      {/* Modern Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Preventive Maintenance Schedules</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Automated periodic servicing routines, frequency intervals & next due dates
            </p>
          </div>
        </div>
        <Link
          to="/secure-kolmeks-x0y0/maintenance/schedules/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" /> Create PM Schedule
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search schedule number, title, asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState message="Loading PM routines..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSchedules} />
      ) : schedules.length === 0 ? (
        <EmptyState
          title="No PM schedules configured"
          description="Create recurring maintenance schedules to prevent machine downtime."
          actionText="Create Schedule"
          onAction={() => window.location.href = '/secure-kolmeks-x0y0/maintenance/schedules/new'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs whitespace-nowrap">
              <tr>
                <th className="py-3.5 px-4">Schedule #</th>
                <th className="py-3.5 px-4">Asset Equipment</th>
                <th className="py-3.5 px-4">Schedule Title</th>
                <th className="py-3.5 px-4">Frequency</th>
                <th className="py-3.5 px-4">Last Done</th>
                <th className="py-3.5 px-4">Next Due Date</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((s) => {
                const isOverdue = s.next_due_date && s.next_due_date < todayStr;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">{s.schedule_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">{s.assets?.name || 'N/A'}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{s.title}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                      {s.frequency_type} ({s.frequency_value} days)
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">{s.last_completed_date || 'Never'}</td>
                    <td className="py-3 px-4 font-bold whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
                        isOverdue ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {s.next_due_date} {isOverdue ? '(OVERDUE)' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold whitespace-nowrap">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MaintenanceScheduleListPage;
