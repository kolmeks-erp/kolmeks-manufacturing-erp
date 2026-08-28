import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  ShieldAlert 
} from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import EmptyState from '../../../components/erp/EmptyState';
import { maintenanceService } from '../../../services/maintenance.service';
import { MaintenanceRequest, Asset, Priority } from '../../../types/maintenance';

const MaintenanceRequestListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Request Form State
  const [formData, setFormData] = useState({
    asset_id: '',
    issue: '',
    priority: 'MEDIUM' as Priority,
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqList, astList] = await Promise.all([
        maintenanceService.getMaintenanceRequests(),
        maintenanceService.getAssets({ limit: 100 })
      ]);
      setRequests(reqList || []);
      setAssets(astList.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.asset_id || !formData.issue || !formData.description) {
      setFormError('Asset, Issue Summary, and Description are required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await maintenanceService.createMaintenanceRequest(formData);
      setShowCreateModal(false);
      setFormData({ asset_id: '', issue: '', priority: 'MEDIUM', description: '' });
      fetchRequests();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit maintenance request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvert = async (reqId: string) => {
    try {
      setLoading(true);
      await maintenanceService.convertRequestToWorkOrder(reqId, {});
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to convert request to Work Order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Maintenance Tickets & Issue Requests"
        subtitle="Operator breakdown reports, anomaly tickets & instant work order conversion"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" /> Report Issue / Breakdown
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Loading maintenance request tickets..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRequests} />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No reported issue requests"
          description="Report a machine anomaly or breakdown ticket for maintenance review."
          actionText="Report Issue"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs">
              <tr>
                <th className="py-3.5 px-4">Ticket #</th>
                <th className="py-3.5 px-4">Asset</th>
                <th className="py-3.5 px-4">Reported Issue</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Reported Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{r.request_number}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{r.assets?.name || 'N/A'}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {r.issue}
                    <p className="text-xs text-slate-500 font-normal line-clamp-1">{r.description}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      r.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">{new Date(r.reported_date).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      r.status === 'CONVERTED_TO_WORK_ORDER' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.status === 'OPEN' && (
                      <button
                        onClick={() => handleConvert(r.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        Convert to Work Order
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Report Equipment Issue / Breakdown</h3>
            <p className="text-xs text-slate-500">Notify maintenance engineers of machine faults or performance drops.</p>

            {formError && <ErrorState message={formError} />}

            <form onSubmit={handleCreateRequest} className="space-y-4">
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
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Issue Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spindle overheating alarm during rough turning"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
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
                  <option value="URGENT">Urgent Machine Breakdown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fault Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed symptoms, noise, error code on CNC control..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-sm disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Issue Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceRequestListPage;
