import React, { useEffect, useState } from 'react';
import { Timer, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import EmptyState from '../../../components/erp/EmptyState';
import { maintenanceService } from '../../../services/maintenance.service';
import { DowntimeLog, Asset } from '../../../types/maintenance';

const DowntimeListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downtimes, setDowntimes] = useState<DowntimeLog[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    asset_id: '',
    reason: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchDowntimes = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dtList, astList] = await Promise.all([
        maintenanceService.getDowntimeLogs(),
        maintenanceService.getAssets({ limit: 100 })
      ]);
      setDowntimes(dtList || []);
      setAssets(astList.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load downtime logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDowntimes();
  }, []);

  const handleCreateDowntime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.asset_id || !formData.reason) {
      setFormError('Asset and Breakdown Reason are required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await maintenanceService.createDowntimeLog(formData);
      setShowCreateModal(false);
      setFormData({ asset_id: '', reason: '', notes: '' });
      fetchDowntimes();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to record downtime log');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDowntime = async (id: string) => {
    try {
      await maintenanceService.closeDowntimeLog(id);
      fetchDowntimes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close downtime');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      {/* Modern Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 shrink-0">
            <Timer className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Asset Breakdown & Downtime Monitoring</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Track equipment stoppage duration, active breakdown events & MTTR metrics
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-xs shrink-0"
        >
          <AlertTriangle className="w-4 h-4" /> Record Asset Stoppage
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading downtime records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDowntimes} />
      ) : downtimes.length === 0 ? (
        <EmptyState
          title="No breakdown downtime recorded"
          description="All plant machinery is operating without unhandled breakdown stoppages."
          actionText="Log Stoppage"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs whitespace-nowrap">
              <tr>
                <th className="py-3.5 px-4">Asset Equipment</th>
                <th className="py-3.5 px-4">Start Time</th>
                <th className="py-3.5 px-4">End Time</th>
                <th className="py-3.5 px-4">Duration (Mins)</th>
                <th className="py-3.5 px-4">Stoppage Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {downtimes.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">{d.assets?.name || 'Asset'}</td>
                  <td className="py-3 px-4 text-xs whitespace-nowrap">{new Date(d.start_time).toLocaleString()}</td>
                  <td className="py-3 px-4 text-xs whitespace-nowrap">{d.end_time ? new Date(d.end_time).toLocaleString() : 'Ongoing'}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">{d.duration_minutes || '—'}</td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-800">{d.reason}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
                      d.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    }`}>
                      {d.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {d.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleCloseDowntime(d.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                      >
                        Close Downtime
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Downtime Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Record Asset Stoppage / Breakdown</h3>
            <p className="text-xs text-slate-500">Initiate an active downtime timer for equipment breakdown.</p>

            {formError && <ErrorState message={formError} />}

            <form onSubmit={handleCreateDowntime} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Asset Equipment *</label>
                <select
                  required
                  value={formData.asset_id}
                  onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Asset Equipment...</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.asset_code} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Breakdown Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydraulic leak / Spindle overload fault"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm disabled:opacity-60"
                >
                  {submitting ? 'Recording...' : 'Start Downtime Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DowntimeListPage;
