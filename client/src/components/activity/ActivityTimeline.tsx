import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, Shield, ArrowUpRight, Activity } from 'lucide-react';
import { ActivityItem } from '../../types/activity';

interface ActivityTimelineProps {
  activities: ActivityItem[];
  loading: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        <Activity className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
        <span>Loading activity feed stream...</span>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        No recent activity records recorded in this stream view.
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-slate-700/60 space-y-6">
      {activities.map((act) => (
        <div key={act.id} className="relative group">
          {/* Timeline Dot */}
          <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 group-hover:border-emerald-400 transition-colors" />

          {/* Activity Card */}
          <div className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 transition shadow-md flex items-start justify-between">
            <div className="space-y-1.5 min-w-0 pr-3">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="font-bold text-white text-sm">{act.action}</span>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-semibold uppercase">
                  {act.module}
                </span>
                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-[10px] font-semibold uppercase">
                  {act.entityType}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium">{act.description}</p>

              <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>{act.actorName}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{new Date(act.timestamp).toLocaleString()}</span>
                </span>
              </div>
            </div>

            {act.route && (
              <button
                onClick={() => navigate(act.route)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1 shrink-0"
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
