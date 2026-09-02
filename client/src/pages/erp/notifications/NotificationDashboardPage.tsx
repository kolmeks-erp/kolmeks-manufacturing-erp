import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Trash2,
  Calendar,
  Plus,
  X,
  Settings,
  BarChart2,
} from 'lucide-react';
import { notificationService } from '../../../services/notification.service';
import { NotificationItem, ReminderItem, NotificationCategory, NotificationPriority } from '../../../types/notification';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const NotificationDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current active tab based on URL path
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.endsWith('/unread')) return 'unread';
    if (path.endsWith('/mentions')) return 'mentions';
    if (path.endsWith('/approvals')) return 'approvals';
    if (path.endsWith('/reminders')) return 'reminders';
    return 'all';
  };

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'mentions' | 'approvals' | 'reminders'>(getTabFromPath());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('ALL');
  const [priority, setPriority] = useState<string>('ALL');

  // New Reminder Modal state
  const [showReminderModal, setShowReminderModal] = useState<boolean>(false);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'NORMAL',
  });

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'reminders') {
        const rems = await notificationService.getReminders();
        setReminders(rems);
      } else {
        const res = await notificationService.getNotifications({
          tab: activeTab,
          category,
          priority,
          search,
        });
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, category, priority, search]);

  const handleTabChange = (tab: 'all' | 'unread' | 'mentions' | 'approvals' | 'reminders') => {
    setActiveTab(tab);
    if (tab === 'all') navigate(`${ERP_BASE_PATH}/notifications`);
    else navigate(`${ERP_BASE_PATH}/notifications/${tab}`);
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      fetchData();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchData();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.dismissNotification(id);
      fetchData();
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderForm.title || !reminderForm.due_date) return;
    try {
      await notificationService.createReminder({
        title: reminderForm.title,
        description: reminderForm.description,
        due_date: new Date(reminderForm.due_date).toISOString(),
        priority: reminderForm.priority,
      });
      setShowReminderModal(false);
      setReminderForm({ title: '', description: '', due_date: new Date().toISOString().split('T')[0], priority: 'NORMAL' });
      fetchData();
    } catch (err) {
      console.error('Failed to create reminder:', err);
    }
  };

  const handleReminderComplete = async (id: string) => {
    try {
      await notificationService.updateReminderStatus(id, 'COMPLETED');
      fetchData();
    } catch (err) {
      console.error('Failed to complete reminder:', err);
    }
  };

  const getPriorityBadge = (p: NotificationPriority) => {
    const styles: Record<string, string> = {
      LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      NORMAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      HIGH: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      URGENT: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-bold border border-rose-300',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${styles[p] || styles.NORMAL}`}>
        {p}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications & Communication Center</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Centralized ERP alert feed, digital approvals queue, and activity reminders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'reminders' ? (
            <button
              onClick={() => setShowReminderModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Reminder
            </button>
          ) : (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500" />
              Mark All Read
            </button>
          )}

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/notifications/settings`)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
            title="Notification Preferences"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/notifications/reports`)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
            title="Notification Reports"
          >
            <BarChart2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          All Feed
        </button>
        <button
          onClick={() => handleTabChange('unread')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'unread' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => handleTabChange('approvals')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'approvals' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Approvals
        </button>
        <button
          onClick={() => handleTabChange('mentions')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'mentions' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Mentions (@)
        </button>
        <button
          onClick={() => handleTabChange('reminders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'reminders' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Reminders
        </button>
      </div>

      {/* Filter Bar (Not for Reminders tab) */}
      {activeTab !== 'reminders' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-3 items-center justify-between">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications by title, message, ref #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="Approvals">Approvals</option>
              <option value="Documents">Documents</option>
              <option value="Procurement">Procurement</option>
              <option value="Sales">Sales</option>
              <option value="Quality">Quality</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inventory">Inventory</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-sm">
            Loading notification feed...
          </div>
        ) : activeTab === 'reminders' ? (
          reminders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-sm">
              No pending reminders found. Click "New Reminder" to create one.
            </div>
          ) : (
            reminders.map((rem) => (
              <div
                key={rem.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{rem.title}</span>
                    {getPriorityBadge(rem.priority)}
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {rem.status}
                    </span>
                  </div>
                  {rem.description && <p className="text-xs text-slate-500">{rem.description}</p>}
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Due: {new Date(rem.due_date).toLocaleDateString()}
                  </div>
                </div>

                {rem.status === 'PENDING' && (
                  <button
                    onClick={() => handleReminderComplete(rem.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            ))
          )
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-sm">
            You're all caught up! No notifications found in this view.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.is_read) notificationService.markAsRead(notif.id);
                if (notif.related_route) navigate(notif.related_route);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                !notif.is_read
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-1">
                  {!notif.is_read ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block shrink-0" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 block shrink-0" />
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{notif.title}</span>
                    {getPriorityBadge(notif.priority)}
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {notif.category}
                    </span>
                    {notif.related_record_reference && (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                        {notif.related_record_reference}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{notif.message}</p>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                    <span>{new Date(notif.created_at).toLocaleString()}</span>
                    {notif.sender?.full_name && <span>• From {notif.sender.full_name}</span>}
                  </div>
                </div>
              </div>

              {/* Quick Action buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {notif.related_route && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!notif.is_read) notificationService.markAsRead(notif.id);
                      navigate(notif.related_route!);
                    }}
                    className="p-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-1 font-semibold"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </button>
                )}

                {!notif.is_read && (
                  <button
                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg"
                    title="Mark Read"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={(e) => handleDismiss(notif.id, e)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                  title="Dismiss"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Personal ERP Reminder</h3>
              <button onClick={() => setShowReminderModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium mb-1">Reminder Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Review Supplier Audit Report"
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={reminderForm.due_date}
                  onChange={(e) => setReminderForm({ ...reminderForm, due_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Priority</label>
                <select
                  value={reminderForm.priority}
                  onChange={(e) => setReminderForm({ ...reminderForm, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={reminderForm.description}
                  onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 font-medium bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl">
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
