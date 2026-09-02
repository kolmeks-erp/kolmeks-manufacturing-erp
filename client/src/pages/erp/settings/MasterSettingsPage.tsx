import React, { useEffect, useState } from 'react';
import { SettingsNavigationHeader } from './SettingsNavigationHeader';
import { settingsService } from '../../../services/settings.service';
import { MasterOption } from '../../../types/settings';
import { Database, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export const MasterSettingsPage: React.FC = () => {
  const [options, setOptions] = useState<MasterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchMasters();
  }, [selectedCategory]);

  const fetchMasters = async () => {
    try {
      setLoading(true);
      const cat = selectedCategory === 'all' ? undefined : selectedCategory;
      const data = await settingsService.getMasterDataOptions(cat);
      setOptions(data);
    } catch (err) {
      console.error('Failed to fetch master data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Master Data & Lookup Tables
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure payment terms, Incoterms, priority levels, defect classifications, and global lookup options.
          </p>
        </div>
      </div>

      <SettingsNavigationHeader />

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'payment_terms', 'shipping_methods', 'priority_levels'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Master Options Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Display Label</th>
                <th className="py-3 px-4">Sort Order</th>
                <th className="py-3 px-4">Default?</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {options.map((item) => (
                <tr key={item.id || `${item.category}-${item.code}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-500 capitalize">{item.category.replace('_', ' ')}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.code}</td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{item.label}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.sort_order}</td>
                  <td className="py-3 px-4">
                    {item.is_default ? (
                      <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded">
                        DEFAULT
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
