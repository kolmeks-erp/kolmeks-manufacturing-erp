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
    <div className="space-y-6">
      <ERPPageHeader
        title="Preventive Maintenance Schedules"
        subtitle="Automated periodic servicing routines, frequency intervals & next due dates"
        actions={
          <Link
            to="/secure-kolmeks-x0y0/maintenance/schedules/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create PM Schedule
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search schedule number, title, asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs">
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
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.schedule_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{s.assets?.name || 'N/A'}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{s.title}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                      {s.frequency_type} ({s.frequency_value} days)
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{s.last_completed_date || 'Never'}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        isOverdue ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {s.next_due_date} {isOverdue ? '(OVERDUE)' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold">{s.status}</td>
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
