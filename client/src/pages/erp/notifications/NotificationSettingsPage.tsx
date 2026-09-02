import React, { useEffect, useState } from 'react';
import { Settings, Save, Shield, BellRing, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { notificationService } from '../../../services/notification.service';
import { NotificationPreference } from '../../../types/notification';

export const NotificationSettingsPage: React.FC = () => {
  const [prefs, setPrefs] = useState<Partial<NotificationPreference>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    notificationService
      .getPreferences()
      .then((data) => setPrefs(data || {}))
      .catch((err) => {
        console.error('Failed to load notification preferences:', err);
        setPrefs({});
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: keyof NotificationPreference) => {
    setPrefs((prev) => {
      const current = prev || {};
      return { ...current, [key]: !current[key] };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await notificationService.updatePreferences(prefs || {});
      setMessage({ type: 'success', text: 'Notification preferences saved successfully.' });
    } catch (err: any) {
      console.error('Failed to save preferences:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'Failed to save notification preferences.',
      });
    } finally {
      setSaving(false);
    }
  };

  const categoriesList = [
    { key: 'in_app_approvals', label: 'Approvals & Digital Workflows', desc: 'Alerts when your action or sign-off is required' },
    { key: 'in_app_documents', label: 'Document Management', desc: 'Notifications on SOP revisions, review dates & expiry' },
    { key: 'in_app_procurement', label: 'Procurement & Purchasing', desc: 'Updates on PO approvals, GRNs & supplier issues' },
    { key: 'in_app_sales', label: 'Sales & Orders', desc: 'Notifications on order confirmations & delivery status' },
    { key: 'in_app_quality', label: 'Quality Control (QC/NCR)', desc: 'Urgent alerts on failed inspections and CAPA deadlines' },
    { key: 'in_app_maintenance', label: 'Asset Maintenance', desc: 'Work order assignments & breakdown alerts' },
    { key: 'in_app_hr', label: 'HR Operations & Leave', desc: 'Leave requests, approvals & attendance alerts' },
    { key: 'in_app_finance', label: 'Finance & Payments', desc: 'Invoice sign-offs & budget threshold warnings' },
    { key: 'in_app_crm', label: 'CRM Leads & Follow-ups', desc: 'Customer touchpoint reminders and lead assignments' },
    { key: 'in_app_system', label: 'System & Security', desc: 'System governance & mandatory alerts' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notification Preferences</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configure server-side alert channels and business category notification settings
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* In-App Category Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BellRing className="w-5 h-5 text-blue-500" />
          In-App Notification Feed Categories
        </h2>
        <p className="text-xs text-slate-500">
          Control which business event categories deliver in-app feed alerts. Note: Mandatory urgent security alerts bypass preferences.
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
          {categoriesList.map((cat) => (
            <div key={cat.key} className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{cat.label}</div>
                <div className="text-[11px] text-slate-500">{cat.desc}</div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean((prefs || {})[cat.key as keyof NotificationPreference])}
                  onChange={() => handleToggle(cat.key as keyof NotificationPreference)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Email Infrastructure Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-500" />
          Email Fallback Notifications
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Email for Approvals</div>
              <div className="text-[11px] text-slate-500">Send an email summary when a digital approval is assigned to your role</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(prefs?.email_approvals)}
                onChange={() => handleToggle('email_approvals')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Email for Urgent Alerts</div>
              <div className="text-[11px] text-slate-500">Send immediate email notifications for URGENT breakdown & QC failure events</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(prefs?.email_urgent)}
                onChange={() => handleToggle('email_urgent')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
