import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Layers, Filter, Eye, Edit, ShieldAlert } from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import EmptyState from '../../../components/erp/EmptyState';
import Pagination from '../../../components/erp/Pagination';
import { maintenanceService } from '../../../services/maintenance.service';
import { Asset, AssetStatus, AssetCriticality } from '../../../types/maintenance';

const AssetListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState('');

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await maintenanceService.getAssets({
        page,
        limit: 15,
        search,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        criticality: criticalityFilter || undefined
      });
      setAssets(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load asset master records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, typeFilter, statusFilter, criticalityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAssets();
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'AVAILABLE':
      case 'ACTIVE':
      case 'RUNNING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">AVAILABLE</span>;
      case 'UNDER_MAINTENANCE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">UNDER MAINTENANCE</span>;
      case 'BREAKDOWN':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200 animate-pulse">BREAKDOWN</span>;
      case 'INACTIVE':
      case 'RETIRED':
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  const getCriticalityBadge = (crit: AssetCriticality) => {
    switch (crit) {
      case 'CRITICAL':
        return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Asset Master & Plant Equipment"
        subtitle="Comprehensive registry of CNC machines, compressors, assembly benches & physical factory assets"
        actions={
          <Link
            to="/secure-kolmeks-x0y0/maintenance/assets/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Register New Asset
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Asset Code, Name, Serial Number, Manufacturer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="w-48">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Asset Types</option>
              <option value="CNC_MACHINE">CNC Machine</option>
              <option value="MILLING_MACHINE">Milling Machine</option>
              <option value="TURNING_MACHINE">Turning Machine</option>
              <option value="COMPRESSOR">Compressor</option>
              <option value="ELECTRICAL">Electrical System</option>
              <option value="INSPECTION_EQUIPMENT">Inspection Equipment</option>
              <option value="MATERIAL_HANDLING">Material Handling</option>
            </select>
          </div>

          <div className="w-40">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="BREAKDOWN">Breakdown</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="w-36">
            <select
              value={criticalityFilter}
              onChange={(e) => { setCriticalityFilter(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Criticality</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Asset Table */}
      {loading ? (
        <LoadingState message="Loading assets list..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAssets} />
      ) : assets.length === 0 ? (
        <EmptyState
          title="No assets found"
          description="Register physical CNC machines or plant equipment to manage maintenance."
          actionText="Register Asset"
          onAction={() => window.location.href = '/secure-kolmeks-x0y0/maintenance/assets/new'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs">
                <tr>
                  <th className="py-3.5 px-4">Asset Code</th>
                  <th className="py-3.5 px-4">Asset Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Manufacturer / Model</th>
                  <th className="py-3.5 px-4">Work Center</th>
                  <th className="py-3.5 px-4">Criticality</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {asset.asset_code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <Link to={`/secure-kolmeks-x0y0/maintenance/assets/${asset.id}`} className="hover:text-indigo-600">
                        {asset.name}
                      </Link>
                      {asset.location && (
                        <p className="text-xs text-slate-400 font-normal">{asset.location}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                      {asset.asset_type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {asset.manufacturer || 'N/A'} {asset.model ? `(${asset.model})` : ''}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {asset.work_centers?.name || asset.machines?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      {getCriticalityBadge(asset.criticality)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(asset.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/secure-kolmeks-x0y0/maintenance/assets/${asset.id}`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetListPage;
