import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ZapOff, Plus, Search, Filter, RefreshCw, AlertTriangle, CheckCircle, 
  Clock, ArrowRight, Eye, AlertCircle, FileText
} from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/erp/StatusBadge';
import EmptyState from '../../../components/erp/EmptyState';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import ConfirmDialog from '../../../components/erp/ConfirmDialog';
import { maintenanceService } from '../../../services/maintenance.service';
import { Breakdown } from '../../../types/maintenance';
import { ERP_BASE_PATH } from '../../../constants/navigation';

const BreakdownListPage: React.FC = () => {
  const navigate = useNavigate();
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [failureTypeFilter, setFailureTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedBreakdown, setSelectedBreakdown] = useState<Breakdown | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // New Breakdown Form State
  const [newAssetId, setNewAssetId] = useState<string>('');
  const [newFailureType, setNewFailureType] = useState<string>('MECHANICAL');
  const [newSeverity, setNewSeverity] = useState<string>('HIGH');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newImmediateCause, setNewImmediateCause] = useState<string>('');
  const [newRootCause, setNewRootCause] = useState<string>('');
  const [assets, setAssets] = useState<Array<{ id: string; asset_code: string; name: string }>>([]);

  const fetchBreakdowns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await maintenanceService.getBreakdowns({
        search,
        failureType: failureTypeFilter || undefined,
        status: statusFilter || undefined
      });
      setBreakdowns(data || []);
    } catch (err: any) {
      console.error('Failed to load breakdowns:', err);
      setError(err.message || 'Unable to load maintenance breakdowns. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakdowns();
  }, [search, failureTypeFilter, statusFilter]);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const res = await maintenanceService.getAssets({ limit: 100 });
        setAssets(res.data || []);
      } catch (err) {
        console.error('Failed to load assets for breakdown form:', err);
      }
    };
    loadAssets();
  }, []);

  const handleCreateBreakdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetId || !newDescription) {
      alert('Please select an Asset and provide a Description');
      return;
    }
    try {
      await maintenanceService.createBreakdown({
        asset_id: newAssetId,
        failure_type: newFailureType as any,
        severity: newSeverity as any,
        description: newDescription,
        immediate_cause: newImmediateCause || undefined,
        root_cause: newRootCause || undefined
      });
      setIsCreateModalOpen(false);
      setNewDescription('');
      setNewImmediateCause('');
      setNewRootCause('');
      fetchBreakdowns();
    } catch (err: any) {
      alert(err.message || 'Unable to record breakdown');
    }
  };

  const handleConvert = async () => {
    if (!selectedBreakdown) return;
    try {
      await maintenanceService.convertBreakdownToWorkOrder(selectedBreakdown.id, {
        priority: selectedBreakdown.severity
      });
      setIsConvertModalOpen(false);
      setSelectedBreakdown(null);
      fetchBreakdowns();
    } catch (err: any) {
      alert(err.message || 'Unable to convert breakdown to work order');
    }
  };

  const columns = [
    {
      header: 'Breakdown #',
      accessor: (row: Breakdown) => (
        <span className="font-semibold text-slate-900 font-mono text-sm whitespace-nowrap">
          {row.breakdown_number}
        </span>
      )
    },
    {
      header: 'Asset / Machine',
      accessor: (row: Breakdown) => (
        <div className="whitespace-nowrap">
          <div className="font-medium text-slate-900">{row.assets?.name || 'N/A'}</div>
          <div className="text-xs text-slate-500 font-mono">{row.assets?.asset_code}</div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: (row: Breakdown) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap">
          {row.failure_type}
        </span>
      )
    },
    {
      header: 'Severity',
      accessor: (row: Breakdown) => {
        const severityMap: Record<string, string> = {
          CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
          HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
          MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
          LOW: 'bg-slate-100 text-slate-700 border-slate-200'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border whitespace-nowrap ${severityMap[row.severity] || severityMap.MEDIUM}`}>
            {row.severity}
          </span>
        );
      }
    },
    {
      header: 'Downtime (Mins)',
      accessor: (row: Breakdown) => (
        <span className="font-mono text-sm font-medium text-slate-700 whitespace-nowrap">
          {row.downtime_minutes || 0} mins
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row: Breakdown) => (
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
          row.status === 'CONVERTED_TO_WORK_ORDER' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          row.status === 'OPEN' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
          'bg-slate-100 text-slate-700 border border-slate-200'
        }`}>
          {row.status === 'CONVERTED_TO_WORK_ORDER' ? 'CONVERTED TO WORK ORDER' : row.status.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (row: Breakdown) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          {row.status === 'OPEN' && (
            <button
              onClick={() => { setSelectedBreakdown(row); setIsConvertModalOpen(true); }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 whitespace-nowrap"
            >
              <ArrowRight className="w-3.5 h-3.5" /> Convert to WO
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      {/* Modern Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 shrink-0">
            <ZapOff className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipment Breakdowns & Downtime Tracking</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Record unplanned machine breakdowns, classify failure roots, and auto-dispatch emergency maintenance work orders
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" /> Report Equipment Breakdown
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search breakdown #, asset name, root cause..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={failureTypeFilter}
            onChange={(e) => setFailureTypeFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Failure Types</option>
            <option value="MECHANICAL">Mechanical</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="SOFTWARE">Software</option>
            <option value="HYDRAULIC">Hydraulic</option>
            <option value="PNEUMATIC">Pneumatic</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="CONVERTED_TO_WORK_ORDER">Converted to Work Order</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <button
            onClick={fetchBreakdowns}
            className="p-2 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Body */}
      {loading ? (
        <LoadingState message="Loading equipment breakdown records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBreakdowns} />
      ) : breakdowns.length === 0 ? (
        <EmptyState
          title="No breakdowns recorded"
          description="No machine breakdown events match your current filter parameters."
          actionText="Report Equipment Breakdown"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <DataTable
          data={breakdowns}
          columns={columns}
        />
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" /> Report Unplanned Breakdown
            </h3>
            <form onSubmit={handleCreateBreakdown} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Asset *</label>
                <select
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  required
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Asset / Machine</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.asset_code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Failure Classification</label>
                  <select
                    value={newFailureType}
                    onChange={(e) => setNewFailureType(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="MECHANICAL">Mechanical</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="SOFTWARE">Software</option>
                    <option value="HYDRAULIC">Hydraulic</option>
                    <option value="PNEUMATIC">Pneumatic</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Failure Symptoms / Problem *</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                  placeholder="Describe what occurred (e.g. Spindle motor over-current trip during roughing operation)..."
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Submit Breakdown Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConvertModalOpen}
        title="Convert Breakdown to Emergency Work Order?"
        message={`Are you sure you want to convert Breakdown ${selectedBreakdown?.breakdown_number} into an Emergency Maintenance Work Order? This will notify assigned technicians and initiate downtime logging.`}
        confirmText="Convert & Dispatch MWO"
        confirmVariant="danger"
        onConfirm={handleConvert}
        onCancel={() => setIsConvertModalOpen(false)}
      />
    </div>
  );
};

export default BreakdownListPage;
