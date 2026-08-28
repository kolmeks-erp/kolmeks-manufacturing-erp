import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Layers } from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { maintenanceService } from '../../../services/maintenance.service';
import { productionService } from '../../../services/production.service';
import { AssetType, AssetStatus, AssetCriticality } from '../../../types/maintenance';
import { Machine, WorkCenter } from '../../../types/production';

const AssetFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [machines, setMachines] = useState<Machine[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);

  const [formData, setFormData] = useState({
    asset_code: '',
    name: '',
    asset_type: 'CNC_MACHINE' as AssetType,
    machine_id: '',
    work_center_id: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    installation_date: '',
    location: '',
    status: 'AVAILABLE' as AssetStatus,
    criticality: 'MEDIUM' as AssetCriticality,
    description: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [machList, wcList] = await Promise.all([
        productionService.getMachines(),
        productionService.getWorkCenters()
      ]);
      setMachines(machList || []);
      setWorkCenters(wcList || []);

      if (isEdit && id) {
        const asset = await maintenanceService.getAssetById(id);
        setFormData({
          asset_code: asset.asset_code || '',
          name: asset.name || '',
          asset_type: asset.asset_type || 'CNC_MACHINE',
          machine_id: asset.machine_id || '',
          work_center_id: asset.work_center_id || '',
          manufacturer: asset.manufacturer || '',
          model: asset.model || '',
          serial_number: asset.serial_number || '',
          purchase_date: asset.purchase_date || '',
          installation_date: asset.installation_date || '',
          location: asset.location || '',
          status: asset.status || 'AVAILABLE',
          criticality: asset.criticality || 'MEDIUM',
          description: asset.description || ''
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load form prerequisites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Asset Name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      if (isEdit && id) {
        await maintenanceService.updateAsset(id, formData);
        navigate(`/secure-kolmeks-x0y0/maintenance/assets/${id}`);
      } else {
        const created = await maintenanceService.createAsset(formData);
        navigate(`/secure-kolmeks-x0y0/maintenance/assets/${created.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save asset record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading form configuration..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/secure-kolmeks-x0y0/maintenance/assets"
          className="p-2 text-slate-600 hover:text-slate-900 bg-white rounded-lg border border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <ERPPageHeader
          title={isEdit ? 'Edit Asset Record' : 'Register New Factory Asset'}
          subtitle="Configure equipment attributes, linked machine/work center & criticality"
        />
      </div>

      {error && <ErrorState message={error} />}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Asset Code</label>
            <input
              type="text"
              placeholder="Auto-generated if left blank (e.g. AST-CNC-001)"
              value={formData.asset_code}
              disabled={isEdit}
              onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Asset Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Okuma LB3000 CNC Lathe #1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Asset Type</label>
            <select
              value={formData.asset_type}
              onChange={(e) => setFormData({ ...formData, asset_type: e.target.value as AssetType })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CNC_MACHINE">CNC Machine</option>
              <option value="MILLING_MACHINE">Milling Machine</option>
              <option value="TURNING_MACHINE">Turning Machine</option>
              <option value="GRINDING_MACHINE">Grinding Machine</option>
              <option value="COMPRESSOR">Compressor</option>
              <option value="ELECTRICAL">Electrical Panel / Transformer</option>
              <option value="INSPECTION_EQUIPMENT">Inspection CMM / Gauge</option>
              <option value="MATERIAL_HANDLING">Material Handling / Crane</option>
              <option value="OTHER">Other Auxiliary Asset</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Link Manufacturing Machine</label>
            <select
              value={formData.machine_id}
              onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">None (Standalone Facility Asset)</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>{m.code ? `${m.code} - ${m.name}` : m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assigned Work Center</label>
            <select
              value={formData.work_center_id}
              onChange={(e) => setFormData({ ...formData, work_center_id: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Unassigned</option>
              {workCenters.map((wc) => (
                <option key={wc.id} value={wc.id}>{wc.code} - {wc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Location / Bay</label>
            <input
              type="text"
              placeholder="e.g. Tikkurila Plant - Machining Bay A2"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Manufacturer</label>
            <input
              type="text"
              placeholder="e.g. Okuma / Haas / Atlas Copco"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Model & Serial Number</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Model (LB3000)"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Serial (SN-8829)"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Asset Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="AVAILABLE">Available</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="BREAKDOWN">Breakdown</option>
              <option value="INACTIVE">Inactive</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Criticality</label>
            <select
              value={formData.criticality}
              onChange={(e) => setFormData({ ...formData, criticality: e.target.value as AssetCriticality })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical (Bottleneck equipment)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Technical Specs & Description</label>
          <textarea
            rows={3}
            placeholder="Operating parameters, spindle power, maintenance notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/secure-kolmeks-x0y0/maintenance/assets"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" /> {submitting ? 'Saving Asset...' : isEdit ? 'Update Asset' : 'Save Asset'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetFormPage;
