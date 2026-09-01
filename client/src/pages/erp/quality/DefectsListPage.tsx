import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { qualityService } from '../../../services/quality.service';
import { QualityDefect } from '../../../types/quality';

const DefectsListPage: React.FC = () => {
  const [defects, setDefects] = useState<QualityDefect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<QualityDefect>>({
    defect_code: '',
    name: '',
    description: '',
    category: 'DIMENSIONAL',
    severity: 'MEDIUM'
  });

  const fetchDefects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getDefects({ category: categoryFilter, search });
      if (res.success) {
        setDefects(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch defects catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefects();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDefects();
  };

  const handleCreateDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await qualityService.createDefect(formData);
      if (res.success) {
        setShowModal(false);
        setFormData({ defect_code: '', name: '', description: '', category: 'DIMENSIONAL', severity: 'MEDIUM' });
        fetchDefects();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create defect catalog item');
    }
  };

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Quality Defects Catalog"
        subtitle="Standard library of defect codes, categories, severities, and failure classification rules."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Defect Code
          </button>
        }
      />

      {/* FILTER STRIP */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search defect code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Defect Categories</option>
              <option value="DIMENSIONAL">Dimensional</option>
              <option value="SURFACE_FINISH">Surface Finish</option>
              <option value="MATERIAL_DEFECT">Material Defect</option>
              <option value="ASSEMBLY">Assembly</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PACKAGING">Packaging</option>
              <option value="DOCUMENTATION">Documentation</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <button
            onClick={fetchDefects}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading Defects Catalog..." />
      ) : error ? (
        <ErrorState title="Error Loading Defects" message={error} onRetry={fetchDefects} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Defect Code</th>
                <th className="py-3.5 px-4 font-semibold">Defect Name & Description</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Severity</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {defects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No defect codes found matching your criteria.
                  </td>
                </tr>
              ) : (
                defects.map((def) => (
                  <tr key={def.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-indigo-600 font-mono">
                      {def.defect_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{def.name}</p>
                      {def.description && <p className="text-xs text-slate-500">{def.description}</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                        {def.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={def.severity} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${def.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${def.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {def.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
              Add Quality Defect Code
            </h3>

            <form onSubmit={handleCreateDefect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Defect Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. DEF-DIM-004 (Auto-generated if blank)"
                  value={formData.defect_code || ''}
                  onChange={(e) => setFormData({ ...formData, defect_code: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Defect Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crack on Surface Bevel"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DIMENSIONAL">Dimensional</option>
                    <option value="SURFACE_FINISH">Surface Finish</option>
                    <option value="MATERIAL_DEFECT">Material Defect</option>
                    <option value="ASSEMBLY">Assembly</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PACKAGING">Packaging</option>
                    <option value="DOCUMENTATION">Documentation</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed criteria or inspection instructions..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Defect Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefectsListPage;
