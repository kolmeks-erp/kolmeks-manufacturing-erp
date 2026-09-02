import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Plus,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react';
import { salesService } from '../../../services/sales.service';
import { PickingList } from '../../../types/sales';
import api from '../../../services/api';

export const PickingListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pickings, setPickings] = useState<PickingList[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const [selectedSO, setSelectedSO] = useState('');
  const [selectedWH, setSelectedWH] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchPickings = async () => {
    setLoading(true);
    try {
      const data = await salesService.getPickings();
      setPickings(data || []);
    } catch (err) {
      console.error('Failed to load pickings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [soRes, whRes] = await Promise.all([
        api.get('/sales-orders?limit=50'),
        api.get('/warehouses'),
      ]);
      setSalesOrders(soRes.data.data || []);
      setWarehouses(whRes.data.data || whRes.data || []);
    } catch (err) {
      console.error('Failed to load dependencies:', err);
    }
  };

  useEffect(() => {
    fetchPickings();
  }, []);

  const handleOpenModal = () => {
    fetchDependencies();
    setShowCreateModal(true);
  };

  const handleCreatePicking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSO || !selectedWH) return;
    setCreating(true);
    try {
      await salesService.createPicking({
        sales_order_id: selectedSO,
        warehouse_id: selectedWH,
        notes,
      });
      setShowCreateModal(false);
      setSelectedSO('');
      setSelectedWH('');
      setNotes('');
      fetchPickings();
    } catch (err) {
      console.error('Failed to create picking:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleCompletePicking = async (id: string) => {
    try {
      await salesService.updatePickingStatus(id, 'PICKED');
      fetchPickings();
    } catch (err) {
      console.error('Failed to mark picking as completed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Warehouse Picking Lists
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Generate picking slips for warehouse operators, locate inventory bins, and log picked line item quantities.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-2 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Picking Slip</span>
        </button>
      </div>

      {/* Picking Lists Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Picking Slip No.</th>
                <th className="px-6 py-4">Sales Order</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    Loading picking lists...
                  </td>
                </tr>
              ) : pickings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    No picking lists found. Create a new picking slip to begin.
                  </td>
                </tr>
              ) : (
                pickings.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">{p.picking_number}</td>
                    <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-bold font-mono">{p.sales_order_id}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {p.status === 'PICKED' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>PICKED</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{p.status}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status !== 'PICKED' && (
                        <button
                          onClick={() => handleCompletePicking(p.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Confirm Picked
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating Picking Slip */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Warehouse Picking Slip</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePicking} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Select Sales Order *</label>
                <select
                  required
                  value={selectedSO}
                  onChange={(e) => setSelectedSO(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Sales Order --</option>
                  {salesOrders.map((so) => (
                    <option key={so.id} value={so.id}>
                      {so.order_number} ({so.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Target Warehouse *</label>
                <select
                  required
                  value={selectedWH}
                  onChange={(e) => setSelectedWH(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Warehouse --</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code || 'WH'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Picking Instructions / Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special handling or bin retrieval notes..."
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  {creating ? 'Generating...' : 'Generate Picking Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
