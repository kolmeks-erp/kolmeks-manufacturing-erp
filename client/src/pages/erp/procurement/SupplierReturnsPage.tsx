import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { procurementP2PService } from '../../../services/procurement_p2p.service';
import { SupplierReturn } from '../../../types/procurement_p2p';
import { apiClient as api } from '../../../services/api';

export const SupplierReturnsPage: React.FC = () => {
  const [returns, setReturns] = useState<SupplierReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const data = await procurementP2PService.getSupplierReturns();
      setReturns(data);
    } catch (err) {
      console.error('Failed to load supplier returns:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    }
  };

  useEffect(() => {
    fetchReturns();
    fetchSuppliers();
  }, []);

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !reason || !itemDescription) return;
    setActionLoading(true);

    try {
      await procurementP2PService.createSupplierReturn({
        supplier_id: supplierId,
        reason,
        notes,
        items: [
          {
            description: itemDescription,
            quantity: Number(itemQty),
            unit_price: Number(itemPrice),
          },
        ],
      });
      alert('Supplier return request created.');
      setShowModal(false);
      setReason('');
      setNotes('');
      setItemDescription('');
      setItemQty(1);
      setItemPrice(0);
      fetchReturns();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create return request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await procurementP2PService.updateSupplierReturnStatus(id, newStatus);
      fetchReturns();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Supplier Returns & RMA Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Log and process defective or non-conforming materials returned to suppliers following Quality inspection failures.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-2 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Supplier Return (RMA)</span>
        </button>
      </div>

      {/* Returns Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>Supplier Return Authorizations (SRN)</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">SRN Number</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Return Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    Loading supplier returns...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    No supplier return records found.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-rose-600 dark:text-rose-400">{ret.return_number}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{ret.supplier?.company_name || 'Supplier'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">{ret.return_date}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">{ret.reason}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">₹{ret.total_amount?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          ret.status === 'COMPLETED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : ret.status === 'APPROVED' || ret.status === 'DISPATCHED'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2 text-right">
                      {ret.status === 'REQUESTED' && (
                        <button
                          onClick={() => handleStatusUpdate(ret.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Approve
                        </button>
                      )}
                      {ret.status === 'APPROVED' && (
                        <button
                          onClick={() => handleStatusUpdate(ret.id, 'DISPATCHED')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Dispatch
                        </button>
                      )}
                      {ret.status === 'DISPATCHED' && (
                        <button
                          onClick={() => handleStatusUpdate(ret.id, 'COMPLETED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Complete
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

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateReturn} className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <RotateCcw className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              <span>Log Supplier Return (RMA)</span>
            </h3>

            <div>
              <label className="text-xs uppercase font-bold text-slate-600 dark:text-slate-400 block mb-1">Target Supplier *</label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.company_name} ({s.supplier_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-slate-600 dark:text-slate-400 block mb-1">Return Reason / Defect Detail *</label>
              <input
                type="text"
                required
                placeholder="e.g. Failed CMM dimensional tolerance inspection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs uppercase font-bold text-slate-600 dark:text-slate-400 block mb-1">Returned Item Description *</label>
                <input
                  type="text"
                  required
                  placeholder="Item Name / Part #"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-slate-600 dark:text-slate-400 block mb-1">Quantity *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={itemQty}
                  onChange={(e) => setItemQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-slate-600 dark:text-slate-400 block mb-1">Unit Value (₹)</label>
              <input
                type="number"
                step="0.01"
                value={itemPrice}
                onChange={(e) => setItemPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-xs"
              >
                {actionLoading ? 'Creating RMA...' : 'Create Return Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
