import React, { useEffect, useState } from 'react';
import { SettingsNavigationHeader } from './SettingsNavigationHeader';
import { settingsService } from '../../../services/settings.service';
import { NumberingSequence } from '../../../types/settings';
import { Hash, Edit2, Save, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const NumberingSettingsPage: React.FC = () => {
  const [sequences, setSequences] = useState<NumberingSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NumberingSequence | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchSequences();
  }, []);

  const fetchSequences = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getNumberingSequences();
      setSequences(data);
    } catch (err) {
      console.error('Failed to fetch numbering sequences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item: NumberingSequence) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.id) return;
    try {
      setSaving(true);
      await settingsService.updateNumberingSequence(editingItem.id, editingItem);
      setToast({ message: 'Numbering sequence updated.', type: 'success' });
      setModalOpen(false);
      fetchSequences();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update numbering sequence.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Hash className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          Document & Code Numbering Sequences
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure auto-generated prefixes, sequence padding, reset rules, and number formats.
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

      {/* Sequence Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Prefix</th>
                <th className="py-3 px-4">Current Counter</th>
                <th className="py-3 px-4">Length</th>
                <th className="py-3 px-4">Pattern Format</th>
                <th className="py-3 px-4">Reset Period</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {sequences.map((item) => (
                <tr key={item.id || item.entity_type} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{item.label}</td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">{item.prefix}</td>
                  <td className="py-3 px-4 font-mono font-bold text-gray-800 dark:text-gray-200">{item.current_value}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.sequence_length} digits</td>
                  <td className="py-3 px-4 font-mono text-xs text-blue-600 dark:text-blue-400">{item.pattern}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{item.reset_period}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Edit Sequence: {editingItem.label}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Prefix *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.prefix}
                    onChange={(e) => setEditingItem({ ...editingItem, prefix: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Sequence Length</label>
                  <input
                    type="number"
                    min="4"
                    max="10"
                    value={editingItem.sequence_length}
                    onChange={(e) => setEditingItem({ ...editingItem, sequence_length: parseInt(e.target.value) || 6 })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Sequence Counter Value</label>
                <input
                  type="number"
                  value={editingItem.current_value}
                  onChange={(e) => setEditingItem({ ...editingItem, current_value: parseInt(e.target.value) || 1000 })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Pattern Format Template</label>
                <input
                  type="text"
                  value={editingItem.pattern}
                  onChange={(e) => setEditingItem({ ...editingItem, pattern: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-xs text-gray-900 dark:text-white"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Placeholders: &#123;PREFIX&#125;, &#123;YEAR&#125;, &#123;SEQUENCE&#125;</span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Reset Interval</label>
                <select
                  value={editingItem.reset_period}
                  onChange={(e) => setEditingItem({ ...editingItem, reset_period: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="Never">Never Reset</option>
                  <option value="Yearly">Yearly (Jan 1st)</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Sequence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
