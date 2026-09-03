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
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">AVAILABLE</span>;
      case 'UNDER_MAINTENANCE':
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">UNDER MAINTENANCE</span>;
      case 'BREAKDOWN':
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 animate-pulse whitespace-nowrap">BREAKDOWN</span>;
      case 'INACTIVE':
      case 'RETIRED':
      default:
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">{status.replace(/_/g, ' ')}</span>;
    }
  };

  const getCriticalityBadge = (crit: AssetCriticality) => {
    switch (crit) {
      case 'CRITICAL':
        return <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg whitespace-nowrap">CRITICAL</span>;
      case 'HIGH':
        return <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg whitespace-nowrap">HIGH</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg whitespace-nowrap">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg whitespace-nowrap">LOW</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      {/* Modern Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 shrink-0">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Asset Master & Plant Equipment</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Comprehensive registry of CNC machines, compressors, assembly benches & physical factory assets
            </p>
          </div>
        </div>
        <Link
          to="/secure-kolmeks-x0y0/maintenance/assets/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" /> Register New Asset
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Asset Code, Name, Serial Number, Manufacturer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="w-48">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs whitespace-nowrap">
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
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {asset.asset_code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      <Link to={`/secure-kolmeks-x0y0/maintenance/assets/${asset.id}`} className="hover:text-indigo-600">
                        {asset.name}
                      </Link>
                      {asset.location && (
                        <p className="text-xs text-slate-400 font-normal">{asset.location}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                      {asset.asset_type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {asset.manufacturer || 'N/A'} {asset.model ? `(${asset.model})` : ''}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {asset.work_centers?.name || asset.machines?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getCriticalityBadge(asset.criticality)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(asset.status)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
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
