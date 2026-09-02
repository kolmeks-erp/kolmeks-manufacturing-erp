import React, { useEffect, useState } from 'react';
import { User, Filter, Calendar } from 'lucide-react';
import { ActivityNavigationHeader } from '../../../components/activity/ActivityNavigationHeader';
import { ActivityTimeline } from '../../../components/activity/ActivityTimeline';
import { activityService } from '../../../services/activity.service';
import { ActivityItem } from '../../../types/activity';

export const MyActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState('last_30_days');
  const [moduleFilter, setModuleFilter] = useState('');

  const fetchMyActivity = async () => {
    setLoading(true);
    try {
      const res = await activityService.getActivity({
        view: 'my',
        datePreset,
        module: moduleFilter
      });
      setActivities(res.activities || []);
    } catch (err) {
      console.error('Failed to load my activity feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyActivity();
  }, [datePreset, moduleFilter]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Personal Activity Timeline
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Review your created records, submitted forms, workflow approvals, and transaction history.
            </p>
          </div>
        </div>
      </div>

      <ActivityNavigationHeader />

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time Horizon:</span>
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_month">This Month</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Module Scope:</span>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
          >
            <option value="">All Modules</option>
            <option value="Sales">Sales</option>
            <option value="Procurement">Procurement</option>
            <option value="Inventory">Inventory</option>
            <option value="Production">Production</option>
            <option value="Quality">Quality</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Documents">Documents</option>
            <option value="Workflows">Workflows</option>
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
