import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, RefreshCw, Edit, Eye, CheckCircle, XCircle } from 'lucide-react';
import { ERPLayout } from '../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { budgetingService } from '../../../services/budgeting.service';
import { employeeService } from '../../../services/employee.service';
import { CostCenter } from '../../../types/budgeting';
import { Employee } from '../../../types/employee';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const CostCenterListPage: React.FC = () => {
  const navigate = useNavigate();
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  // Modal State for Create/Edit
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCenter, setEditingCenter] = useState<CostCenter | null>(null);
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [managerId, setManagerId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchCostCenters = async () => {
    try {
      setLoading(true);
      setError(null);
      const [centersRes, empRes] = await Promise.all([
        budgetingService.getCostCenters({ search: search || undefined }),
        employeeService.getEmployees({ limit: 100 }),
      ]);
      if (centersRes.success) setCostCenters(centersRes.data);
      if (empRes.success) setEmployees(empRes.data);
    } catch (err: any) {
      console.error('Error fetching cost centers:', err);
      setError(err?.response?.data?.message || 'Failed to load cost centers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostCenters();
  }, []);

  const openCreateModal = () => {
    setEditingCenter(null);
    setCode('');
    setName('');
    setDescription('');
    setParentId('');
    setManagerId('');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (center: CostCenter) => {
    setEditingCenter(center);
    setCode(center.code);
    setName(center.name);
    setDescription(center.description || '');
    setParentId(center.parent_id || '');
    setManagerId(center.manager_id || '');
    setIsActive(center.is_active);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      if (editingCenter) {
        await budgetingService.updateCostCenter(editingCenter.id, {
          name: name.trim(),
          description: description.trim() || null,
          parent_id: parentId || null,
          manager_id: managerId || null,
          is_active: isActive,
        });
      } else {
        if (!code.trim()) return;
        await budgetingService.createCostCenter({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim() || null,
          parent_id: parentId || null,
          manager_id: managerId || null,
          is_active: isActive,
        });
      }

      setShowModal(false);
      fetchCostCenters();
    } catch (err: any) {
      console.error('Error saving cost center:', err);
      setError(err?.response?.data?.message || 'Failed to save cost center.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Cost Centers Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Define organizational units, departmental cost tracking hierarchies, and responsible cost center managers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCostCenters}
            className="inline-flex items-center px-3 py-2 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Cost Center
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Cost Center Code or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCostCenters()}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">Total {costCenters.length} cost centers</span>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState message="Loading cost centers hierarchy..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCostCenters} />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Cost Center Name</th>
                  <th className="py-3.5 px-4">Parent Cost Center</th>
                  <th className="py-3.5 px-4">Responsible Manager</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {costCenters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No cost centers configured yet. Click "Add Cost Center" to create one.
                    </td>
                  </tr>
                ) : (
                  costCenters.map((cc) => (
                    <tr key={cc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">{cc.code}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{cc.name}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {cc.parent ? `${cc.parent.code} - ${cc.parent.name}` : 'Top-Level'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {cc.manager ? `${cc.manager.first_name} ${cc.manager.last_name}` : 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            cc.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {cc.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/finance/cost-centers/${cc.id}`)}
                          className="inline-flex items-center text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </button>
                        <button
                          onClick={() => openEditModal(cc)}
                          className="inline-flex items-center text-xs text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              {editingCenter ? `Edit Cost Center (${editingCenter.code})` : 'Create New Cost Center'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cost Center Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingCenter}
                  placeholder="e.g. CC-CNC or CC-MFG"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cost Center Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNC Machining Workshop"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Cost Center</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Top Level --</option>
                    {costCenters
                      .filter((c) => !editingCenter || c.id !== editingCenter.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Manager</label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Operational scope or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-slate-50 border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Cost Center Active
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingCenter ? 'Update Cost Center' : 'Create Cost Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
