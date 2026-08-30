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
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs tracking-wider uppercase mb-1">
            <Building2 className="w-4 h-4" />
            <span>Facility Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manufacturing Warehouses & Depots</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage physical stock facilities, storage rack structures, and bin distribution hubs.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Warehouse Facility</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search warehouse code, name, city, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="active">Active Facilities</option>
          <option value="inactive">Inactive Facilities</option>
        </select>
      </div>

      {/* Warehouse Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Loading facilities list...</span>
          </div>
        ) : warehouses.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Building2 className="w-10 h-10 text-slate-400" />
            <span className="font-semibold text-slate-700">No warehouse facilities found</span>
          </div>
        ) : (
          warehouses.map((wh) => (
            <div
              key={wh.id}
              onClick={() => navigate(`${ERP_BASE_PATH}/warehouses/${wh.id}`)}
              className="bg-white border border-slate-200 shadow-xs hover:border-indigo-300 rounded-xl p-5 flex flex-col justify-between space-y-4 cursor-pointer transition group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {wh.code}
                  </span>
                  <button
                    onClick={(e) => handleToggleStatus(e, wh)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition ${
                      wh.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {wh.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {wh.name}
                </h3>

                {wh.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">{wh.description}</p>
                )}

                <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {wh.address ? `${wh.address}, ` : ''}
                    {wh.city || ''} {wh.country ? `(${wh.country})` : ''}
                  </span>
                </div>
              </div>

              {/* Warehouse Telemetry Breakdown Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      <strong className="text-slate-900">{wh.location_count || 0}</strong> Bins
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-cyan-600" />
                    <span>
                      <strong className="text-slate-900">{wh.stock_item_count || 0}</strong> Items
                    </span>
                  </div>
                </div>

                <span className="text-indigo-600 group-hover:translate-x-1 transition flex items-center gap-0.5 font-semibold">
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Add New Warehouse Facility</span>
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateWarehouse} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Warehouse Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. WH-004"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Facility Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Tampere Machine Hub"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Teollisuustie 15"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Tampere"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">State/Region</label>
                  <input
                    type="text"
                    placeholder="Pirkanmaa"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Facility description and purpose..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
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
