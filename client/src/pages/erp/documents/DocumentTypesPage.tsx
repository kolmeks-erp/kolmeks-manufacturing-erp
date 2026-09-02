import React, { useEffect, useState } from 'react';
import { Layers, Plus, X } from 'lucide-react';
import { documentService } from '../../../services/document.service';
import { DocumentTypeItem } from '../../../types/document';

export const DocumentTypesPage: React.FC = () => {
  const [types, setTypes] = useState<DocumentTypeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [form, setForm] = useState({ code: '', name: '', description: '', category: 'General' });

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const data = await documentService.getDocumentTypes();
      setTypes(data);
    } catch (err) {
      console.error('Failed to fetch document types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) {
      alert('Code and Name are required.');
      return;
    }
    try {
      await documentService.createDocumentType(form);
      setShowModal(false);
      setForm({ code: '', name: '', description: '', category: 'General' });
      fetchTypes();
    } catch (err) {
      console.error('Failed to create document type:', err);
      alert('Failed to create document type.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Types Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure business document types (SOPs, CAD Drawings, Quality Inspection Plans, etc.)</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Document Type
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading document types...
                  </td>
                </tr>
              ) : (
                types.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900 dark:text-white">{t.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{t.name}</td>
                    <td className="px-6 py-4">{t.category || 'General'}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{t.description || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Document Type</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium mb-1">Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOP_ENG"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering Standard Operating Procedure"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-medium bg-slate-100 dark:bg-slate-800 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl">
                  Save Document Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
