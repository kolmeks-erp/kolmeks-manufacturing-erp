import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  Cpu,
  RefreshCw,
  Layers,
} from 'lucide-react';
import ERPPageHeader from '../../../../components/erp/ERPPageHeader';
import StatusBadge from '../../../../components/erp/StatusBadge';
import LoadingState from '../../../../components/erp/LoadingState';
import ErrorState from '../../../../components/erp/ErrorState';
import EmptyState from '../../../../components/erp/EmptyState';
import { planningService, CalendarEvent } from '../../../../services/planning.service';

const ProductionCalendarPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'DAY'>('MONTH');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const fetchCalendar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await planningService.getCalendarEvents();
      if (res.success) {
        setEvents(res.data || []);
      } else {
        setError(res.message || 'Failed to load calendar events.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading production calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'MONTH') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'WEEK') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Interactive Production Calendar"
        subtitle="Visualize scheduled work orders, machine bookings, and shop floor timelines across days, weeks, and months"
        actions={
          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 flex items-center gap-1 text-xs">
              {(['MONTH', 'WEEK', 'DAY'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    viewMode === mode ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={fetchCalendar}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        }
      />

      {/* Date Navigator Header */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded border border-slate-200 dark:border-slate-700 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Calendar Body */}
      {loading ? (
        <LoadingState message="Building Interactive Timeline Calendar..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCalendar} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No Production Events Scheduled"
          description="No work order schedules exist for the selected planning horizon."
        />
      ) : (
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
            <CalendarIcon className="text-amber-600 dark:text-amber-400" size={18} /> Scheduled Jobs Timeline ({events.length})
          </h3>

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{ev.title}</span>
                    <StatusBadge status={ev.status} />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Building2 size={13} className="text-slate-400" /> {ev.work_center || 'Work Center'}
                    </span>
                    {ev.machine && (
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                        <Cpu size={13} /> {ev.machine}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <Clock size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>
                    {new Date(ev.start).toLocaleString()} &rarr; {new Date(ev.end).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionCalendarPage;
