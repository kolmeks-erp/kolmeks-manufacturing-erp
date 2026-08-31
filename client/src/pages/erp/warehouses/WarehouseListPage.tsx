import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Plus,
  RefreshCw,
  Boxes,
  MapPin,
  CheckCircle2,
  XCircle,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { warehouseService } from '../../../services/warehouse.service';
import { Warehouse } from '../../../types/inventory';

export const WarehouseListPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // New Warehouse Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'Finland',
    description: '',
  });

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getWarehouses({
        search,
        status: selectedStatus || undefined,
      });
      if (res.success) {
        setWarehouses(res.data);
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [search, selectedStatus]);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.code || !formData.name) {
      setErrorMsg('Warehouse code and name are required.');
      return;
    }

    setCreating(true);
    try {
      const res = await warehouseService.createWarehouse(formData);
      if (res.success) {
        setShowCreateModal(false);
        setFormData({ code: '', name: '', address: '', city: '', state: '', country: 'Finland', description: '' });
        fetchWarehouses();
      } else {
        setErrorMsg(res.message || 'Failed to create warehouse.');
      }
    } catch (err: any) {
      console.error('Error creating warehouse:', err);
      setErrorMsg(err.response?.data?.message || 'Server error creating warehouse.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, wh: Warehouse) => {
    e.stopPropagation();
    const newStatus = wh.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await warehouseService.toggleWarehouseStatus(wh.id, newStatus);
      if (res.success) {
        fetchWarehouses();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update warehouse status.');
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Building2 className="w-4 h-4" />
            <span>Facility Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Manufacturing Warehouses & Depots</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage physical stock facilities, storage rack structures, and bin distribution hubs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Warehouse Facility</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search warehouse code, name, city, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 sm:w-48"
        >
          <option value="" className="bg-white dark:bg-[#0F2647] text-slate-900 dark:text-white">All Statuses</option>
          <option value="active" className="bg-white dark:bg-[#0F2647] text-slate-900 dark:text-white">Active Facilities</option>
          <option value="inactive" className="bg-white dark:bg-[#0F2647] text-slate-900 dark:text-white">Inactive Facilities</option>
        </select>
      </div>

      {/* Warehouse Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
            <span>Loading facilities list...</span>
          </div>
        ) : warehouses.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
            <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">No warehouse facilities found</span>
          </div>
        ) : (
          warehouses.map((wh) => (
            <div
              key={wh.id}
              onClick={() => navigate(`${ERP_BASE_PATH}/warehouses/${wh.id}`)}
              className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-5 flex flex-col justify-between space-y-4 cursor-pointer transition group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {wh.code}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleToggleStatus(e, wh)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition ${
                      wh.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {wh.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {wh.name}
                </h3>

                {wh.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{wh.description}</p>
                )}

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>
                    {wh.address ? `${wh.address}, ` : ''}
                    {wh.city || ''} {wh.country ? `(${wh.country})` : ''}
                  </span>
                </div>
              </div>

              {/* Warehouse Telemetry Breakdown Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>
                      <strong className="text-slate-900 dark:text-white">{wh.location_count || 0}</strong> Bins
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>
                      <strong className="text-slate-900 dark:text-white">{wh.stock_item_count || 0}</strong> Items
                    </span>
                  </div>
                </div>

                <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition flex items-center gap-0.5 font-semibold">
                  <span>Manage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Warehouse Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Add New Warehouse Facility</span>
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateWarehouse} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Warehouse Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. WH-004"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Facility Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Tampere Machine Hub"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Teollisuustie 15"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Tampere"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">State/Region</label>
                  <input
                    type="text"
                    placeholder="Pirkanmaa"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Facility description and purpose..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition shadow-xs"
                >
                  {creating && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Save Warehouse</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
