import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, CheckSquare } from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { maintenanceService } from '../../../services/maintenance.service';
import { Asset, MaintenanceType, Priority } from '../../../types/maintenance';
import { apiClient } from '../../../services/api';

interface ProfileOption {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const WorkOrderFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillAssetId = searchParams.get('assetId') || '';

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);

  const [formData, setFormData] = useState({
    asset_id: prefillAssetId,
    maintenance_type: 'PREVENTIVE' as MaintenanceType,
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
    assigned_to: '',
    planned_start: new Date().toISOString().split('T')[0],
    planned_end: ''
  });

  const [checklists, setChecklists] = useState<Array<{ title: string; required: boolean }>>([
    { title: 'Safety Isolations & Lockout Tagout (LOTO)', required: true },
    { title: 'Visual Mechanical & Leak Inspection', required: true },
    { title: 'Perform Servicing / Part Replacement / Calibration', required: true },
    { title: 'Post-Maintenance Test Run & Clearance', required: true }
  ]);

  const loadPrerequisites = async () => {
    try {
      setLoading(true);
      setError(null);
      const [astRes, profRes] = await Promise.all([
        maintenanceService.getAssets({ limit: 100 }),
        apiClient.get('/employees').catch(() => ({ data: { data: [] } }))
      ]);
      setAssets(astRes.data || []);
      if (profRes.data?.data) {
        setProfiles(profRes.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assets list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const addChecklistItem = () => {
    setChecklists([...checklists, { title: '', required: true }]);
  };

  const removeChecklistItem = (idx: number) => {
    setChecklists(checklists.filter((_, i) => i !== idx));
  };

  const updateChecklistTitle = (idx: number, title: string) => {
    const updated = [...checklists];
    updated[idx].title = title;
    setChecklists(updated);
  };

  const toggleChecklistRequired = (idx: number) => {
    const updated = [...checklists];
    updated[idx].required = !updated[idx].required;
    setChecklists(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.asset_id || !formData.title) {
      setError('Target Asset and Work Order Title are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const validChecklists = checklists.filter(c => c.title.trim() !== '');
      const created = await maintenanceService.createWorkOrder({
        ...formData,
        checklists: validChecklists as any
      });
      navigate(`/secure-kolmeks-x0y0/maintenance/work-orders/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create work order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading work order creation..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/secure-kolmeks-x0y0/maintenance/work-orders"
          className="p-2 text-slate-600 hover:text-slate-900 bg-white rounded-lg border border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <ERPPageHeader
          title="Create Maintenance Work Order"
          subtitle="Schedule preventive routines, corrective repairs & technician assignments"
        />
      </div>

      {error && <ErrorState message={error} />}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Asset *</label>
            <select
              required
              value={formData.asset_id}
              onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Asset Equipment...</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.asset_code} — {a.name} ({a.status})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Maintenance Type</label>
            <select
              value={formData.maintenance_type}
              onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value as MaintenanceType })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PREVENTIVE">Preventive Maintenance</option>
              <option value="CORRECTIVE">Corrective Breakdown Repair</option>
              <option value="INSPECTION">Inspection Routine</option>
              <option value="CALIBRATION">Calibration</option>
              <option value="LUBRICATION">Lubrication & Fluid Refill</option>
              <option value="CLEANING">Deep Cleaning</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Work Order Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly CNC Spindle Alignment & Lubrication Check"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assigned Technician</label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Unassigned (Open Pool)</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.first_name || 'Staff'} {p.last_name || ''} ({p.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent Breakdown</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Planned Start Date</label>
            <input
              type="date"
              value={formData.planned_start}
              onChange={(e) => setFormData({ ...formData, planned_start: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Planned End Date</label>
            <input
              type="date"
              value={formData.planned_end}
              onChange={(e) => setFormData({ ...formData, planned_end: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Maintenance Scope & Instructions</label>
          <textarea
            rows={3}
            placeholder="Detailed procedure, safety instructions, torque settings..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Maintenance Checklist Section */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" /> Execution Checklist Items
            </h3>
            <button
              type="button"
              onClick={addChecklistItem}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>

          <div className="space-y-2">
            {checklists.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Task ${idx + 1}...`}
                  value={item.title}
                  onChange={(e) => updateChecklistTitle(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer select-none whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={item.required}
                    onChange={() => toggleChecklistRequired(idx)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => removeChecklistItem(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/secure-kolmeks-x0y0/maintenance/work-orders"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" /> {submitting ? 'Creating Work Order...' : 'Create Work Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkOrderFormPage;
