import React, { useEffect, useState } from 'react';
import { SettingsNavigationHeader } from './SettingsNavigationHeader';
import { settingsService } from '../../../services/settings.service';
import { PermissionItem } from '../../../types/settings';
import { KeyRound, Shield, Check } from 'lucide-react';

export const PermissionSettingsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getPermissions();
      setPermissions(data);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by category
  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <KeyRound className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          System Permission Catalog
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete catalog of system access keys, action scopes, and functional authorization policies.
        </p>
      </div>

      <SettingsNavigationHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const catPermissions = permissions.filter((p) => p.category === cat);
          return (
            <div key={cat} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  {cat}
                </h3>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{catPermissions.length} rules</span>
              </div>

              <ul className="space-y-2 text-xs">
                {catPermissions.map((p) => (
                  <li key={p.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block">{p.name}</span>
                      <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 block">{p.code}</span>
                      {p.description && <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 block">{p.description}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
