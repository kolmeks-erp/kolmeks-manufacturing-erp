import React, { useEffect, useState } from 'react';
import {
  IndianRupee,
  Plus,
  CheckCircle,
  X,
} from 'lucide-react';
import { salesService } from '../../../services/sales.service';
import { CreditNote } from '../../../types/sales';
import api from '../../../services/api';

export const CreditNotesListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  const [selectedCust, setSelectedCust] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCreditNotes = async () => {
    setLoading(true);
    try {
      const data = await salesService.getCreditNotes();
      setCreditNotes(data || []);
    } catch (err) {
      console.error('Failed to load credit notes:', err);
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
    fetchCreditNotes();
  }, []);

  const handleOpenModal = () => {
    fetchCustomers();
    setShowCreateModal(true);
  };

  const handleCreateCN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust || subtotal <= 0) return;
    setCreating(true);
    const totalAmount = subtotal + tax;
    try {
      await salesService.createCreditNote({
        customer_id: selectedCust,
        subtotal,
        tax_amount: tax,
        total_amount: totalAmount,
        notes,
      });
      setShowCreateModal(false);
      setSelectedCust('');
      setSubtotal(0);
      setTax(0);
      setNotes('');
      fetchCreditNotes();
    } catch (err) {
      console.error('Failed to issue credit note:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Credit Notes Register
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Issue credit notes for customer returns, billing adjustments, or quality concessions linked to Accounts Receivable.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-2 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Credit Note</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Credit Note No.</th>
                <th className="px-6 py-4">Credit Date</th>
                <th className="px-6 py-4">Subtotal</th>
                <th className="px-6 py-4">Total Credited</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    Loading credit notes...
                  </td>
                </tr>
              ) : creditNotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    No credit notes issued.
                  </td>
                </tr>
              ) : (
                creditNotes.map((cn) => (
                  <tr key={cn.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">{cn.credit_note_number}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">{cn.credit_date}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 font-mono">₹{Number(cn.subtotal).toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {cn.currency} ₹{Number(cn.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{cn.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Post Credit Note</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCN} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Customer *</label>
                <select
                  required
                  value={selectedCust}
                  onChange={(e) => setSelectedCust(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Subtotal (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={subtotal}
                    onChange={(e) => setSubtotal(parseFloat(e.target.value || '0'))}
                    className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Tax Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tax}
                    onChange={(e) => setTax(parseFloat(e.target.value || '0'))}
                    className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Credit Reason / Journal Note</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Concession on returned batch..."
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  {creating ? 'Posting...' : 'Post Credit Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
