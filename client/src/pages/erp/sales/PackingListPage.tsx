import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  CheckCircle,
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
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Packing Slips & Package Registry
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Bundle picked items into numbered shipping packages, specify gross weights, and finalize packing slips.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-2 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Packing Slip</span>
        </button>
      </div>

      {/* Packing Lists Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Packing Slip No.</th>
                <th className="px-6 py-4">Sales Order</th>
                <th className="px-6 py-4">Packages</th>
                <th className="px-6 py-4">Total Weight</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    Loading packing slips...
                  </td>
                </tr>
              ) : packings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    No packing slips generated yet.
                  </td>
                </tr>
              ) : (
                packings.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">{p.packing_number}</td>
                    <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-bold font-mono">{p.sales_order_id}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-semibold">{p.total_packages} Box(es)</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-semibold font-mono">{p.total_weight_kg} kg</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center space-x-1">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Packing Slip</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePacking} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Sales Order *</label>
                <select
                  required
                  value={selectedSO}
                  onChange={(e) => setSelectedSO(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Number of Boxes / Cartons</label>
                  <input
                    type="number"
                    min="1"
                    value={totalPackages}
                    onChange={(e) => setTotalPackages(parseInt(e.target.value || '1', 10))}
                    className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Total Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={totalWeight}
                    onChange={(e) => setTotalWeight(parseFloat(e.target.value || '0'))}
                    className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Packing Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Fragile, pallet dimensions..."
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
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
