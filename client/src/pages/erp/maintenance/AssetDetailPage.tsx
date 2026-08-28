import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Wrench, 
  Clock, 
  AlertTriangle, 
  Layers, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert,
  Activity
} from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { maintenanceService } from '../../../services/maintenance.service';
import { Asset } from '../../../types/maintenance';

const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<'WORK_ORDERS' | 'SCHEDULES' | 'DOWNTIME' | 'TIMELINE'>('WORK_ORDERS');

  const fetchAsset = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await maintenanceService.getAssetById(id);
      setAsset(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load asset details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
  }, [id]);

  if (loading) return <LoadingState message="Loading asset details & history..." />;
  if (error || !asset) return <ErrorState message={error || 'Asset not found'} onRetry={fetchAsset} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/secure-kolmeks-x0y0/maintenance/assets"
          className="p-2 text-slate-600 hover:text-slate-900 bg-white rounded-lg border border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <ERPPageHeader
          title={`${asset.name} (${asset.asset_code})`}
          subtitle={`Location: ${asset.location || 'Factory Floor'} | Criticality: ${asset.criticality}`}
          actions={
            <div className="flex gap-2">
              <Link
                to={`/secure-kolmeks-x0y0/maintenance/work-orders/new?assetId=${asset.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create Work Order
              </Link>
            </div>
          }
        />
      </div>

      {/* Asset Specifications Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Asset Type</span>
            <p className="font-semibold text-slate-900 mt-0.5">{asset.asset_type.replace('_', ' ')}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Manufacturer / Model</span>
            <p className="font-semibold text-slate-900 mt-0.5">{asset.manufacturer || 'N/A'} {asset.model ? `(${asset.model})` : ''}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Work Center</span>
            <p className="font-semibold text-slate-900 mt-0.5">{asset.work_centers?.name || 'Unassigned'}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Status</span>
            <div className="mt-1">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                asset.status === 'AVAILABLE' || asset.status === 'RUNNING' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                asset.status === 'UNDER_MAINTENANCE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                asset.status === 'BREAKDOWN' ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' :
                'bg-slate-100 text-slate-600'
              }`}>
                {asset.status}
              </span>
            </div>
          </div>
        </div>

        {asset.description && (
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Description & Specs</span>
            <p className="text-sm text-slate-700 mt-1">{asset.description}</p>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('WORK_ORDERS')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'WORK_ORDERS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Work Orders ({asset.workOrders?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('SCHEDULES')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'SCHEDULES' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          PM Schedules ({asset.schedules?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('DOWNTIME')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'DOWNTIME' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Downtime Logs ({asset.downtimes?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'TIMELINE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Activity Timeline ({asset.activities?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'WORK_ORDERS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {asset.workOrders && asset.workOrders.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs">
                <tr>
                  <th className="py-3.5 px-4">WO Number</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {asset.workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{wo.work_order_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{wo.title}</td>
                    <td className="py-3 px-4 text-xs uppercase">{wo.maintenance_type}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {wo.assigned_profile ? `${wo.assigned_profile.first_name || ''} ${wo.assigned_profile.last_name || ''}` : 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold">{wo.priority}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        wo.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        wo.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {wo.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/secure-kolmeks-x0y0/maintenance/work-orders/${wo.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        View WO
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-8 text-center text-slate-500 text-sm">No work orders recorded for this asset.</p>
          )}
        </div>
      )}

      {activeTab === 'SCHEDULES' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          {asset.schedules && asset.schedules.length > 0 ? (
            asset.schedules.map((s) => (
              <div key={s.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-800">{s.schedule_number}</span>
                  <h4 className="font-semibold text-slate-900">{s.title}</h4>
                  <p className="text-xs text-slate-500">Frequency: {s.frequency_type} ({s.frequency_value} days)</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                    Next Due: {s.next_due_date}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-slate-500 text-sm">No preventive maintenance schedules set for this asset.</p>
          )}
        </div>
      )}

      {activeTab === 'DOWNTIME' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {asset.downtimes && asset.downtimes.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4">End Time</th>
                  <th className="py-3 px-4">Duration (Mins)</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {asset.downtimes.map((d) => (
                  <tr key={d.id}>
                    <td className="py-3 px-4 text-xs">{new Date(d.start_time).toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs">{d.end_time ? new Date(d.end_time).toLocaleString() : 'Ongoing'}</td>
                    <td className="py-3 px-4 text-xs font-mono font-semibold">{d.duration_minutes || '—'}</td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-800">{d.reason}</td>
                    <td className="py-3 px-4 text-xs font-semibold">{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-8 text-center text-slate-500 text-sm">No recorded downtime logs for this asset.</p>
          )}
        </div>
      )}

      {activeTab === 'TIMELINE' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          {asset.activities && asset.activities.length > 0 ? (
            <div className="space-y-4">
              {asset.activities.map((act) => (
                <div key={act.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2"></div>
                  <div>
                    <p className="font-semibold text-slate-900">{act.description}</p>
                    <p className="text-xs text-slate-400">
                      By {act.actor_name || 'System'} on {new Date(act.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 text-sm">No activity history recorded.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AssetDetailPage;
