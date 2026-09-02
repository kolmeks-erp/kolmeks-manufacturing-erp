import React, { useEffect, useState } from 'react';
import { SettingsNavigationHeader } from './SettingsNavigationHeader';
import { settingsService } from '../../../services/settings.service';
import { OrganizationProfile } from '../../../types/settings';
import { Building2, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const OrganizationSettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<OrganizationProfile>({
    org_name: 'Kolmeks Oy',
    legal_name: 'Kolmeks Oy Ltd',
    display_name: 'Kolmeks Manufacturing ERP',
    company_code: 'KOLMEKS-HQ',
    registration_number: 'FI-0123456-7',
    tax_id: 'FI01234567',
    address_line1: 'Taimistotie 1',
    city: 'Turenki',
    state_province: 'Kanta-Häme',
    postal_code: '14200',
    country: 'Finland',
    phone: '+358 20 744 1400',
    email: 'info@kolmeks.com',
    website: 'https://www.kolmeks.com',
    logo_url: '/images/kolmeks-logo.png',
    default_timezone: 'Europe/Helsinki',
    default_currency: 'INR',
    date_format: 'YYYY-MM-DD',
    number_format: '1,234.56'
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
      console.error('Failed to fetch org profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateOrganizationProfile(profile);
      setToast({ message: 'Organization profile updated successfully.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update organization profile.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Organization & Legal Entity Profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage corporate registration details, tax identifiers, headquarter addresses, and contact channels.
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
          Company Identification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Organization Name *</label>
            <input
              type="text"
              required
              value={profile.org_name}
              onChange={(e) => setProfile({ ...profile, org_name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Legal Registered Name</label>
            <input
              type="text"
              value={profile.legal_name || ''}
              onChange={(e) => setProfile({ ...profile, legal_name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Company Code / Entity ID</label>
            <input
              type="text"
              value={profile.company_code || ''}
              onChange={(e) => setProfile({ ...profile, company_code: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Business Registration Number</label>
            <input
              type="text"
              value={profile.registration_number || ''}
              onChange={(e) => setProfile({ ...profile, registration_number: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Tax / VAT Identifier</label>
            <input
              type="text"
              value={profile.tax_id || ''}
              onChange={(e) => setProfile({ ...profile, tax_id: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Corporate Website</label>
            <input
              type="url"
              value={profile.website || ''}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <h2 className="text-base font-bold text-gray-900 dark:text-white pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
          Headquarters Location & Contact
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="md:col-span-2">
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Address Line 1</label>
            <input
              type="text"
              value={profile.address_line1 || ''}
              onChange={(e) => setProfile({ ...profile, address_line1: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">City</label>
            <input
              type="text"
              value={profile.city || ''}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">State / Province</label>
            <input
              type="text"
              value={profile.state_province || ''}
              onChange={(e) => setProfile({ ...profile, state_province: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
            <input
              type="text"
              value={profile.postal_code || ''}
              onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Country</label>
            <input
              type="text"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
            <input
              type="text"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
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
            {saving ? 'Saving...' : 'Save Organization Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
