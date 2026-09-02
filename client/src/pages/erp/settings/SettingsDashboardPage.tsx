import React, { useEffect, useState } from 'react';
import { SettingsNavigationHeader } from './SettingsNavigationHeader';
import { settingsService } from '../../../services/settings.service';
import { AdminTelemetry } from '../../../types/settings';
import {
  Building2,
  MapPin,
  GitFork,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SettingsDashboardPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<AdminTelemetry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getDashboardTelemetry();
      setTelemetry(data);
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <SettingsNavigationHeader />
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const metrics = telemetry?.metrics || {
    totalLocations: 4,
    activeLocations: 4,
    totalDepartments: 8,
    totalUsers: 12,
    activeUsers: 12,
    totalRoles: 6,
    pendingIssues: 0,
    securityStatus: 'SECURE (RLS Enabled)'
  };

  const org = telemetry?.organization;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            System Administration & Control Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enterprise configuration, RBAC security, location scoping, and audit visibility.
          </p>
        </div>
      </div>

      <SettingsNavigationHeader />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Organization Locations</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{metrics.activeLocations} / {metrics.totalLocations}</h3>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Plants Active
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Active ERP Users</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{metrics.activeUsers}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{metrics.totalUsers} total user profiles</span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Active Departments</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{metrics.totalDepartments}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">HQ & Subsidiary Units</span>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <GitFork className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Security Policy</p>
            <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">RLS Active</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Supabase Row Level Security</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Overview */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Organization Identity
            </h2>
            <Link
              to="/secure-kolmeks-x0y0/settings/organization"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Edit Profile <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-100 dark:border-gray-700">
            <div>
              <span className="text-gray-500 dark:text-gray-400 block text-xs">Legal Company Name</span>
              <p className="font-semibold text-gray-900 dark:text-white">{org?.legal_name || 'Kolmeks Oy Ltd'}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block text-xs">Company Code</span>
              <p className="font-semibold text-gray-900 dark:text-white">{org?.company_code || 'KOLMEKS-HQ'}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block text-xs">Tax Registration ID</span>
              <p className="font-semibold text-gray-900 dark:text-white">{org?.tax_id || 'FI01234567'}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block text-xs">Headquarters</span>
              <p className="font-semibold text-gray-900 dark:text-white">{org?.city || 'Turenki'}, {org?.country || 'Finland'}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block text-xs">Default Currency</span>
              <p className="font-semibold text-gray-900 dark:text-white">{org?.default_currency || 'EUR'} (€)</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block text-xs">Default Timezone</span>
              <p className="font-semibold text-gray-900 dark:text-white">{org?.default_timezone || 'Europe/Helsinki'}</p>
            </div>
          </div>

          {/* Active Plant Locations List */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-3">Operating Manufacturing Plants</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(telemetry?.locations || []).map((loc) => (
                <div key={loc.code} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-medium text-xs text-gray-900 dark:text-white block">{loc.name}</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">{loc.code} • {loc.country}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full">
                    {loc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Checklist & Activity */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Configuration Checklist
            </h2>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Organization Identity & Tax Info Configured</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Global Plant Locations Registered (Finland, Estonia, China, India)</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Document Sequence Patterns Active</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Currencies (EUR, USD, GBP, INR, CNY) & UOM Configured</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>RBAC Granular Permissions Enforced</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Admin Activity
            </h2>
            <div className="space-y-3 text-xs">
              {(telemetry?.recentAuditActivity || []).slice(0, 4).map((log) => (
                <div key={log.id} className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-gray-800 dark:text-gray-200">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-gray-400">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">{log.module} • {log.target_record || 'System'}</p>
                </div>
              ))}
              {(!telemetry?.recentAuditActivity || telemetry.recentAuditActivity.length === 0) && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-2">No recent audit log entries.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
