import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, ArrowUpRight, Activity } from 'lucide-react';
import { ActivityItem } from '../../types/activity';

interface ActivityTimelineProps {
  activities: ActivityItem[];
  loading: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
        <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-2" />
        <span>Loading activity feed stream...</span>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
        No recent activity records recorded in this stream view.
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
      {activities.map((act) => (
        <div key={act.id} className="relative group">
          {/* Timeline Dot */}
          <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 group-hover:border-emerald-500 transition-colors" />

          {/* Activity Card */}
          <div className="bg-slate-50/80 dark:bg-[#071220] hover:bg-blue-50/60 dark:hover:bg-[#132d54]/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition shadow-xs flex items-start justify-between">
            <div className="space-y-1.5 min-w-0 pr-3">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{act.action}</span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded text-[10px] font-bold uppercase">
                  {act.module}
                </span>
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded text-[10px] font-bold uppercase">
                  {act.entityType}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{act.description}</p>

              <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{act.actorName}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(act.timestamp).toLocaleString()}</span>
                </span>
              </div>
            </div>

            {act.route && (
              <button
                onClick={() => navigate(act.route)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-600 hover:border-blue-600 text-slate-700 dark:text-slate-200 hover:text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shrink-0 shadow-xs"
              >
                <span>Inspect</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
