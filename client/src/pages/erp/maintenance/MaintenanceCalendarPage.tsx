import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, AlertTriangle, ZapOff, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import EmptyState from '../../../components/erp/EmptyState';
import { maintenanceService } from '../../../services/maintenance.service';
import { MaintenanceCalendarEvent } from '../../../types/maintenance';

const MaintenanceCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<MaintenanceCalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'DAY'>('MONTH');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await maintenanceService.getMaintenanceCalendar();
      setEvents(data || []);
    } catch (err: any) {
      console.error('Failed to load maintenance calendar:', err);
      setError(err.message || 'Unable to load scheduled maintenance events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'PREVENTIVE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WORK_ORDER':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'BREAKDOWN':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) return <LoadingState message="Loading maintenance calendar & schedule Timeline..." />;
  if (error) return <ErrorState message={error} onRetry={fetchEvents} />;

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Maintenance Schedule & Work Order Calendar"
        subtitle="Visual interactive scheduling matrix for preventive maintenance, work orders, and breakdown interventions."
        actions={
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
              {(['MONTH', 'WEEK', 'DAY'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    viewMode === mode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button
              onClick={fetchEvents}
              className="p-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              title="Refresh Calendar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Legend */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6 text-xs font-medium text-slate-700">
        <span className="text-slate-500 font-semibold uppercase tracking-wider">Legend:</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Preventive PM Schedule</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-600"></span> Active Work Order</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-600"></span> Emergency Breakdown</span>
      </div>

      {/* Scheduled Event Cards List View */}
      {events.length === 0 ? (
        <EmptyState
          title="No Scheduled Maintenance Events"
          description="There are no preventive maintenance tasks or active work orders scheduled."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {events.map((evt) => (
            <div key={evt.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getEventBadge(evt.type)}`}>
                  {evt.type}
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{evt.title}</h4>
                  <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Date: {evt.date}</span>
                    <span>Priority: <strong className="text-slate-700">{evt.priority}</strong></span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {evt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceCalendarPage;
