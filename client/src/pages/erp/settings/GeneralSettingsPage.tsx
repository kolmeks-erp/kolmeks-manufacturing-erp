import React, { useEffect, useState } from 'react';
import { SettingsNavigationHeader } from './SettingsNavigationHeader';
import { settingsService } from '../../../services/settings.service';
import { OrganizationProfile } from '../../../types/settings';
import { SlidersHorizontal, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const GeneralSettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<OrganizationProfile>({
    org_name: 'Kolmeks Oy',
    default_timezone: 'Europe/Helsinki',
    default_currency: 'EUR',
    date_format: 'YYYY-MM-DD',
    number_format: '1,234.56',
    quantity_precision: 2,
    price_precision: 2,
    country: 'Finland'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getOrganizationProfile();
      if (data) setProfile(data);
    } catch (err) {
      console.error('Failed to fetch general settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateOrganizationProfile(profile);
      setToast({ message: 'General system preferences saved successfully.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update preferences.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          General System Preferences
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure system defaults, pagination, date formats, timezones, and numerical precision.
        </p>
      </div>

      <SettingsNavigationHeader />

      {toast && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200'
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700">
          System Regional & Display Defaults
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Default System Timezone</label>
            <select
              value={profile.default_timezone}
              onChange={(e) => setProfile({ ...profile, default_timezone: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Europe/Helsinki">Europe/Helsinki (EET / UTC+2)</option>
              <option value="Europe/Tallinn">Europe/Tallinn (EET / UTC+2)</option>
              <option value="Asia/Shanghai">Asia/Shanghai (CST / UTC+8)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST / UTC+5:30)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Default Reporting Currency</label>
            <select
              value={profile.default_currency}
              onChange={(e) => setProfile({ ...profile, default_currency: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="EUR">Euro (EUR - €)</option>
              <option value="USD">US Dollar (USD - $)</option>
              <option value="GBP">British Pound (GBP - £)</option>
              <option value="INR">Indian Rupee (INR - ₹)</option>
              <option value="CNY">Chinese Yuan (CNY - ¥)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">System Date Display Format</label>
            <select
              value={profile.date_format}
              onChange={(e) => setProfile({ ...profile, date_format: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO International standard)</option>
              <option value="DD.MM.YYYY">DD.MM.YYYY (Finnish / European standard)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (US format)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Number Formatting Pattern</label>
            <select
              value={profile.number_format}
              onChange={(e) => setProfile({ ...profile, number_format: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="1,234.56">1,234.56 (Comma separator, Dot decimal)</option>
              <option value="1 234,56">1 234,56 (Space separator, Comma decimal)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Quantity Decimal Precision</label>
            <input
              type="number"
              min="0"
              max="4"
              value={profile.quantity_precision || 2}
              onChange={(e) => setProfile({ ...profile, quantity_precision: parseInt(e.target.value) || 2 })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Price / Cost Decimal Precision</label>
            <input
              type="number"
              min="2"
              max="4"
              value={profile.price_precision || 2}
              onChange={(e) => setProfile({ ...profile, price_precision: parseInt(e.target.value) || 2 })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save General Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
