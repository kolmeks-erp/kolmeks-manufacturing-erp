import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  Plus,
  CheckCircle,
  Clock,
  DollarSign,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <RotateCcw className="w-7 h-7 text-amber-400" />
            <span>Sales Returns & RMA Management</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Process customer return authorization (RMA), track quarantine/inspection routines, and issue credit notes.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Return Request</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Return Number</th>
                <th className="px-6 py-4">Return Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Loading sales returns...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No sales returns requested yet.
                  </td>
                </tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-bold text-white">{r.return_number}</td>
                    <td className="px-6 py-4 text-slate-400">{r.return_date}</td>
                    <td className="px-6 py-4 font-medium text-slate-200">{r.reason}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{r.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'REQUESTED' && (
                        <button
                          onClick={() => handleStatusUpdate(r.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white">Create Return Request</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">Customer *</label>
                <select
                  required
                  value={selectedCust}
                  onChange={(e) => setSelectedCust(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500"
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
                <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">Reason for Return *</label>
                <input
                  type="text"
                  required
                  placeholder="Defective, wrong specs, damaged in transit..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">Detailed Description / Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional inspection notes..."
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl transition shadow-md"
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
