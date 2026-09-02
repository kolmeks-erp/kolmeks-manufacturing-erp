import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  CheckCircle,
  Clock,
  Package,
  X,
} from 'lucide-react';
import { salesService } from '../../../services/sales.service';
import { PackingList } from '../../../types/sales';
import api from '../../../services/api';

export const PackingListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [packings, setPackings] = useState<PackingList[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);

  const [selectedSO, setSelectedSO] = useState('');
  const [totalPackages, setTotalPackages] = useState(1);
  const [totalWeight, setTotalWeight] = useState(0);
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchPackings = async () => {
    setLoading(true);
    try {
      const data = await salesService.getPackings();
      setPackings(data || []);
    } catch (err) {
      console.error('Failed to load packings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const res = await api.get('/sales-orders?limit=50');
      setSalesOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to load sales orders:', err);
    }
  };

  useEffect(() => {
    fetchPackings();
  }, []);

  const handleOpenModal = () => {
    fetchDependencies();
    setShowCreateModal(true);
  };

  const handleCreatePacking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSO) return;
    setCreating(true);
    try {
      await salesService.createPacking({
        sales_order_id: selectedSO,
        total_packages: totalPackages,
        total_weight_kg: totalWeight,
        notes,
      });
      setShowCreateModal(false);
      setSelectedSO('');
      setNotes('');
      fetchPackings();
    } catch (err) {
      console.error('Failed to create packing slip:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Layers className="w-7 h-7 text-blue-400" />
            <span>Packing Slips & Package Registry</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Bundle picked items into numbered shipping packages, specify gross weights, and finalize packing slips.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Packing Slip</span>
        </button>
      </div>

      {/* Packing Lists Table */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Packing Slip No.</th>
                <th className="px-6 py-4">Sales Order</th>
                <th className="px-6 py-4">Packages</th>
                <th className="px-6 py-4">Total Weight</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Loading packing slips...
                  </td>
                </tr>
              ) : packings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No packing slips generated yet.
                  </td>
                </tr>
              ) : (
                packings.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-bold text-white">{p.packing_number}</td>
                    <td className="px-6 py-4 text-blue-400 font-semibold">{p.sales_order_id}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{p.total_packages} Box(es)</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{p.total_weight_kg} kg</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{p.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white">Create New Packing Slip</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePacking} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">Sales Order *</label>
                <select
                  required
                  value={selectedSO}
                  onChange={(e) => setSelectedSO(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Select Sales Order --</option>
                  {salesOrders.map((so) => (
                    <option key={so.id} value={so.id}>
                      {so.order_number} ({so.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">Number of Boxes / Cartons</label>
                  <input
                    type="number"
                    min="1"
                    value={totalPackages}
                    onChange={(e) => setTotalPackages(parseInt(e.target.value || '1', 10))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">Total Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={totalWeight}
                    onChange={(e) => setTotalWeight(parseFloat(e.target.value || '0'))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">Packing Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Fragile, pallet dimensions..."
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition shadow-md"
                >
                  {creating ? 'Creating...' : 'Generate Packing Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
