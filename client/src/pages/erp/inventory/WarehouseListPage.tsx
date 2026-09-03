import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, MapPin, Boxes, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import inventoryService, { Warehouse, StorageLocation } from '../../../services/inventory.service';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const WarehouseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New storage location modal state
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [locCode, setLocCode] = useState<string>('');
  const [locName, setLocName] = useState<string>('');
  const [locDesc, setLocDesc] = useState<string>('');
  const [locType, setLocType] = useState<string>('STORAGE');
  const [modalSubmitting, setModalSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getWarehouses();
      if (res.success) setWarehouses(res.data || []);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouseId || !locCode || !locName) return;

    setModalSubmitting(true);
    try {
      const res = await inventoryService.createStorageLocation({
        warehouse_id: selectedWarehouseId,
        location_code: locCode.trim(),
        name: locName.trim(),
        description: locDesc.trim(),
        location_type: locType,
      });

      if (res.success) {
        setShowLocationModal(false);
        setLocCode('');
        setLocName('');
        setLocDesc('');
        fetchWarehouses();
      }
    } catch (err) {
      console.error('Error creating storage location:', err);
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Warehouses & Storage Locations</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage physical plant facilities, storage racks, receiving docks, WIP bins, and quarantine areas
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLocationModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition flex items-center gap-2 text-sm shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Storage Bin
          </button>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-500">Loading plant warehouses...</div>
        ) : (
          warehouses.map((wh) => (
            <div
              key={wh.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-purple-50 text-purple-700 rounded border border-purple-200">
                    {wh.code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      wh.status === 'active' ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  >
                    {wh.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    {wh.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{wh.name}</h3>

                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    {wh.address || wh.location || 'Valimotie 12'}, {wh.city || 'Vantaa'}, {wh.country || 'Finland'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {wh.description || 'Primary manufacturing component and motor storage facility.'}
                </p>

                {/* Storage Locations summary list */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Storage Bins / Racks</h4>
                  {wh.storage_locations && wh.storage_locations.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {wh.storage_locations.map((loc) => (
                        <span
                          key={loc.id}
                          className="px-2 py-0.5 bg-slate-100 text-xs font-mono text-slate-700 rounded border border-slate-200"
                        >
                          {loc.location_code} ({loc.location_type || 'STORAGE'})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No specific storage bins configured yet.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedWarehouseId(wh.id);
                    setShowLocationModal(true);
                  }}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Storage Bin
                </button>
                <button
                  onClick={() => navigate(`${ERP_BASE_PATH}/inventory/stock?warehouse_id=${wh.id}`)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View Stock <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Storage Bin Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create Storage Location / Bin</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Warehouse *</label>
                <select
                  required
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RM-A03, WIP-B02"
                    value={locCode}
                    onChange={(e) => setLocCode(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location Type</label>
                  <select
                    value={locType}
                    onChange={(e) => setLocType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="RECEIVING">Receiving Dock</option>
                    <option value="STORAGE">Storage Rack</option>
                    <option value="WIP">Work in Progress (WIP)</option>
                    <option value="FINISHED_GOODS">Finished Goods Staging</option>
                    <option value="QUARANTINE">Quarantine Zone</option>
                    <option value="SCRAP">Scrap Bin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Steel Bar Rack 3"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Additional storage notes..."
                  value={locDesc}
                  onChange={(e) => setLocDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {modalSubmitting ? 'Saving...' : 'Save Storage Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
