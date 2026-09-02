import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  Plus,
  Clock,
  X,
} from 'lucide-react';
import { salesService } from '../../../services/sales.service';
import { SalesReturn } from '../../../types/sales';
import api from '../../../services/api';

export const SalesReturnListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  const [selectedCust, setSelectedCust] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const data = await salesService.getSalesReturns();
      setReturns(data || []);
    } catch (err) {
      console.error('Failed to load sales returns:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers?limit=50');
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleOpenModal = () => {
    fetchCustomers();
    setShowCreateModal(true);
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust || !reason) return;
    setCreating(true);
    try {
      await salesService.createSalesReturn({
        customer_id: selectedCust,
        reason,
        notes,
      });
      setShowCreateModal(false);
      setSelectedCust('');
      setReason('');
      setNotes('');
      fetchReturns();
    } catch (err) {
      console.error('Failed to create sales return:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await salesService.updateSalesReturnStatus(id, status);
      fetchReturns();
    } catch (err) {
      console.error('Failed to update return status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400 shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sales Returns & RMA Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Process customer return authorization (RMA), track quarantine/inspection routines, and issue credit notes.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-2 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Return Request</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Return Number</th>
                <th className="px-6 py-4">Return Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    Loading sales returns...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    No sales returns requested yet.
                  </td>
                </tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">{r.return_number}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">{r.return_date}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{r.reason}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{r.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'REQUESTED' && (
                        <button
                          onClick={() => handleStatusUpdate(r.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Approve RMA
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Return Request</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Customer *</label>
                <select
                  required
                  value={selectedCust}
                  onChange={(e) => setSelectedCust(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Reason for Return *</label>
                <input
                  type="text"
                  required
                  placeholder="Defective, wrong specs, damaged in transit..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Detailed Description / Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional inspection notes..."
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  {creating ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
