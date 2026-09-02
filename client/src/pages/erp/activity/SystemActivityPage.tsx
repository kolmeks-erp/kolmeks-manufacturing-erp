import React, { useEffect, useState } from 'react';
import { ShieldAlert, Filter, Calendar } from 'lucide-react';
import { ActivityNavigationHeader } from '../../../components/activity/ActivityNavigationHeader';
import { ActivityTimeline } from '../../../components/activity/ActivityTimeline';
import { activityService } from '../../../services/activity.service';
import { ActivityItem } from '../../../types/activity';

export const SystemActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState('last_30_days');
  const [moduleFilter, setModuleFilter] = useState('');

  const fetchSystemActivity = async () => {
    setLoading(true);
    try {
      const res = await activityService.getActivity({
        view: 'system',
        datePreset,
        module: moduleFilter
      });
      setActivities(res.activities || []);
    } catch (err) {
      console.error('Failed to load system security activity feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemActivity();
  }, [datePreset, moduleFilter]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              System & Security Audit Activity Log
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              High-fidelity immutable activity stream capturing administrative alterations, privilege updates, and security events.
            </p>
          </div>
        </div>
      </div>

      <ActivityNavigationHeader />

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time Horizon:</span>
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_month">This Month</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Module Scope:</span>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 capitalize"
          >
            <option value="">All Security & Audit Streams</option>
            <option value="Security">Security</option>
            <option value="Settings">Settings</option>
            <option value="Workflows">Workflows</option>
            <option value="Documents">Documents</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline Card */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs min-h-[300px]">
        <ActivityTimeline activities={activities} loading={loading} />
      </div>
    </div>
  );
};
