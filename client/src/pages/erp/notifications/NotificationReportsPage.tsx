import React, { useEffect, useState } from 'react';
import { BarChart2, Bell, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { notificationService } from '../../../services/notification.service';
import { NotificationReportData } from '../../../types/notification';

export const NotificationReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<NotificationReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    notificationService
      .getNotificationReports()
      .then((data) => setReportData(data))
      .catch((err) => console.error('Failed to load notification reports:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notification Analytics & Delivery Logs</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              System telemetry on notification volume, unread counts, and multi-channel delivery success
            </p>
          </div>
        </div>
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Total Notifications</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {loading ? '...' : reportData?.totalCount || 0}
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Unread Feed Alerts</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {loading ? '...' : reportData?.unreadCount || 0}
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Urgent Priority Events</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {loading ? '...' : reportData?.urgentCount || 0}
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Feed Volume by ERP Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {reportData?.categoryCounts &&
            Object.entries(reportData.categoryCounts).map(([cat, count]) => (
              <div key={cat} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-400 font-semibold uppercase">{cat}</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{count}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Delivery Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Channel Delivery Logs</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Notification ID</th>
                <th className="px-6 py-4">Delivery Channel</th>
                <th className="px-6 py-4">Delivery Status</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Loading delivery logs...
                  </td>
                </tr>
              ) : !reportData?.recentDeliveryLogs || reportData.recentDeliveryLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No delivery log entries recorded yet.
                  </td>
                </tr>
              ) : (
                reportData.recentDeliveryLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900 dark:text-white">{log.notification_id}</td>
                    <td className="px-6 py-4 font-mono text-xs">{log.channel}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">{new Date(log.sent_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
