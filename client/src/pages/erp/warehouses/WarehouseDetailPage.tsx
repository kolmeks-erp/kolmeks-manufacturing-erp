import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Boxes,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Edit2,
  ChevronRight,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { warehouseService } from '../../../services/warehouse.service';
import { inventoryService } from '../../../services/inventory.service';
import { Warehouse, StorageLocation, InventoryItem } from '../../../types/inventory';

export const WarehouseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  // Modals state
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [editingLocation, setEditingLocation] = useState<StorageLocation | null>(null);
  const [locationForm, setLocationForm] = useState({ location_code: '', name: '', description: '' });
  const [submittingLoc, setSubmittingLoc] = useState<boolean>(false);
  const [locError, setLocError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [whRes, locRes, invRes] = await Promise.all([
        warehouseService.getWarehouseById(id),
        warehouseService.getWarehouseLocations(id),
        inventoryService.getInventory({ warehouse_id: id, limit: 50 }),
      ]);

      if (whRes.success) setWarehouse(whRes.data);
      if (locRes.success) setLocations(locRes.data);
      if (invRes.success) setInventoryItems(invRes.data);
    } catch (err) {
      console.error('Error fetching warehouse details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleOpenAddLocation = () => {
    setEditingLocation(null);
    setLocationForm({ location_code: '', name: '', description: '' });
    setLocError(null);
    setShowLocationModal(true);
  };

  const handleOpenEditLocation = (loc: StorageLocation) => {
    setEditingLocation(loc);
    setLocationForm({
      location_code: loc.location_code,
      name: loc.name,
      description: loc.description || '',
    });
    setLocError(null);
    setShowLocationModal(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLocError(null);

    if (!locationForm.location_code || !locationForm.name) {
      setLocError('Location code and name are required.');
      return;
    }

    setSubmittingLoc(true);
    try {
      if (editingLocation) {
        const res = await warehouseService.updateWarehouseLocation(id, editingLocation.id, locationForm);
        if (res.success) {
          setShowLocationModal(false);
          fetchData();
        } else {
          setLocError(res.message || 'Failed to update location.');
        }
      } else {
        const res = await warehouseService.createWarehouseLocation(id, locationForm);
        if (res.success) {
          setShowLocationModal(false);
          fetchData();
        } else {
          setLocError(res.message || 'Failed to create location.');
        }
      }
    } catch (err: any) {
      console.error('Error saving storage location:', err);
      setLocError(err.response?.data?.message || 'Server error saving storage location.');
    } finally {
      setSubmittingLoc(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <span>Loading warehouse facility details...</span>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="p-8 text-center text-slate-400">
        <h2 className="text-xl font-bold text-white mb-4">Warehouse Facility Not Found</h2>
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/warehouses`)}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold"
        >
          Back to Warehouses
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Navigation Header */}
      <button
        type="button"
        onClick={() => navigate(`${ERP_BASE_PATH}/warehouses`)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Warehouses List</span>
      </button>

      {/* Facility Summary Header Card */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              {warehouse.code}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                warehouse.status === 'active'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {warehouse.status === 'active' ? 'Active Facility' : 'Inactive Facility'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{warehouse.name}</h1>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>
              {warehouse.address ? `${warehouse.address}, ` : ''}
              {warehouse.city || ''} {warehouse.state ? `, ${warehouse.state}` : ''}{' '}
              {warehouse.country ? `(${warehouse.country})` : ''}
            </span>
          </div>

          {warehouse.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">{warehouse.description}</p>
          )}
        </div>

        {/* Telemetry Pills */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center min-w-[120px]">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Storage Bins</span>
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{locations.length}</span>
          </div>
          <div className="bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center min-w-[120px]">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Stock Items</span>
            <span className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">{inventoryItems.length}</span>
          </div>
        </div>
      </div>

      {/* Storage Locations Management Section */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Storage Locations & Rack Bins</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sub-locations inside {warehouse.name} for precise bin management.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddLocation}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Storage Bin</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {locations.length === 0 ? (
            <div className="col-span-3 py-6 text-center text-slate-500 dark:text-slate-400 text-xs">
              No specific bin locations created for this warehouse yet.
            </div>
          ) : (
            locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between hover:border-blue-500/50 transition"
              >
                <div>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-300 text-xs block">{loc.location_code}</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm block">{loc.name}</span>
                  {loc.description && <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{loc.description}</span>}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEditLocation(loc)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
                  title="Edit Bin Location"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Warehouse Stock Balances Section */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>Inventory Items Stored in Facility</span>
          </h2>
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory?warehouse_id=${warehouse.id}`)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            View in Full Inventory Ledger
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-[#0B1E36] text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Product Code</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Storage Location</th>
                <th className="px-4 py-3 text-right">On-Hand</th>
                <th className="px-4 py-3 text-right">Available</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#0F2647]">
              {inventoryItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No active stock items currently assigned to this warehouse facility.
                  </td>
                </tr>
              ) : (
                inventoryItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`${ERP_BASE_PATH}/inventory/${item.product_id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-[#163761]/50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-300">
                      {item.products?.product_code}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{item.products?.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {item.storage_locations ? item.storage_locations.location_code : 'General Floor'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">{item.on_hand_quantity}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{item.available_quantity}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                        In Stock
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Storage Location Modal (Create / Edit) */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>{editingLocation ? 'Edit Storage Bin' : 'Add Storage Bin Location'}</span>
            </h3>

            {locError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
                {locError}
              </div>
            )}

            <form onSubmit={handleSaveLocation} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Bin / Location Code *</label>
                <input
                  type="text"
                  placeholder="e.g. A1-R02-S04"
                  value={locationForm.location_code}
                  onChange={(e) => setLocationForm({ ...locationForm, location_code: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Location Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rack A2 Raw Material Bay"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Bin capacity or specific material type..."
                  value={locationForm.description}
                  onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLoc}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition shadow-xs"
                >
                  {submittingLoc && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Save Storage Bin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
