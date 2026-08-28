import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { maintenanceService } from '../../../services/maintenance.service';
import { Asset, MaintenanceType, FrequencyType, Priority } from '../../../types/maintenance';

const MaintenanceScheduleFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assets, setAssets] = useState<Asset[]>([]);

  const [formData, setFormData] = useState({
    asset_id: '',
    maintenance_type: 'PREVENTIVE' as MaintenanceType,
    title: '',
    description: '',
    frequency_type: 'MONTHLY' as FrequencyType,
    frequency_value: 30,
    last_completed_date: '',
    priority: 'MEDIUM' as Priority
  });

  const loadAssets = async () => {
    try {
      setLoading(true);
      const res = await maintenanceService.getAssets({ limit: 100 });
      setAssets(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assets list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.asset_id || !formData.title) {
      setError('Target Asset and Schedule Title are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await maintenanceService.createMaintenanceSchedule(formData);
      navigate('/secure-kolmeks-x0y0/maintenance/schedules');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create schedule');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading schedule setup..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/secure-kolmeks-x0y0/maintenance/schedules"
          className="p-2 text-slate-600 hover:text-slate-900 bg-white rounded-lg border border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <ERPPageHeader
          title="Setup Preventive Maintenance Routine"
          subtitle="Configure recurring inspection intervals for factory equipment"
        />
      </div>

      {error && <ErrorState message={error} />}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Asset Equipment *</label>
            <select
              required
              value={formData.asset_id}
              onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Asset...</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.asset_code} — {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Maintenance Routine Type</label>
            <select
              value={formData.maintenance_type}
              onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value as MaintenanceType })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PREVENTIVE">Preventive Maintenance</option>
              <option value="INSPECTION">Inspection Routine</option>
              <option value="CALIBRATION">Calibration</option>
              <option value="LUBRICATION">Lubrication & Oil</option>
              <option value="CLEANING">Deep Cleaning</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Routine Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly CNC Way-Lube & Filter Inspection"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Frequency Interval</label>
            <select
              value={formData.frequency_type}
              onChange={(e) => setFormData({ ...formData, frequency_type: e.target.value as FrequencyType })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly (7 Days)</option>
              <option value="MONTHLY">Monthly (30 Days)</option>
              <option value="QUARTERLY">Quarterly (90 Days)</option>
              <option value="YEARLY">Yearly (365 Days)</option>
              <option value="CUSTOM_DAYS">Custom Days Interval</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Frequency Value (Days)</label>
            <input
              type="number"
              min="1"
              value={formData.frequency_value}
              onChange={(e) => setFormData({ ...formData, frequency_value: parseInt(e.target.value, 10) || 30 })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Last Serviced Date</label>
            <input
              type="date"
              value={formData.last_completed_date}
              onChange={(e) => setFormData({ ...formData, last_completed_date: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Priority Level</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Scope & Tasks Description</label>
          <textarea
            rows={3}
            placeholder="Detailed checklist instructions..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/secure-kolmeks-x0y0/maintenance/schedules"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 shadow-sm"
          >
            <Save className="w-4 h-4" /> {submitting ? 'Saving Schedule...' : 'Save Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceScheduleFormPage;
