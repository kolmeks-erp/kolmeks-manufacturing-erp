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
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
          <ShieldAlert className="w-7 h-7 text-rose-500" />
          <span>System & Security Audit Activity Log</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          High-fidelity immutable activity stream capturing administrative alterations, privilege updates, and security events.
        </p>
      </div>

      <ActivityNavigationHeader />

      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-semibold text-slate-400 uppercase">Time Horizon:</span>
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_month">This Month</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-semibold text-slate-400 uppercase">Module Scope:</span>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 capitalize"
          >
            <option value="">All Security & Audit Streams</option>
            <option value="Security">Security</option>
            <option value="Settings">Settings</option>
            <option value="Workflows">Workflows</option>
            <option value="Documents">Documents</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 shadow-lg">
        <ActivityTimeline activities={activities} loading={loading} />
      </div>
    </div>
  );
};
