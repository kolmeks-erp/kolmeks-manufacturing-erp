import React, { useEffect, useState } from 'react';
import {
  Award,
  Clock,
  Star,
  CheckCircle2,
  TrendingDown,
  Building2,
} from 'lucide-react';
import { procurementP2PService } from '../../../services/procurement_p2p.service';
import { SupplierQuotation } from '../../../types/procurement_p2p';
import { apiClient as api } from '../../../services/api';

export const QuotationComparisonPage: React.FC = () => {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState<string>('');
  const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectingQuote, setSelectingQuote] = useState<SupplierQuotation | null>(null);
  const [selectionReason, setSelectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch RFQs list
  const fetchRfqs = async () => {
    try {
      const res = await api.get('/rfqs');
      const data = res.data.data || res.data || [];
      setRfqs(data);
      if (data.length > 0) {
        setSelectedRfqId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load RFQs:', err);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  const loadComparison = async (rfqId: string) => {
    if (!rfqId) return;
    setLoading(true);
    try {
      const quotes = await procurementP2PService.getQuotationComparison(rfqId);
      setQuotations(quotes);
    } catch (err) {
      console.error('Failed to load quotation comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRfqId) {
      loadComparison(selectedRfqId);
    }
  }, [selectedRfqId]);

  const handleSelectSupplier = async () => {
    if (!selectingQuote || !selectionReason.trim()) return;
    setActionLoading(true);
    try {
      await procurementP2PService.selectSupplierForRFQ(selectingQuote.id, {
        rfq_id: selectedRfqId,
        supplier_id: selectingQuote.supplier_id,
        reason: selectionReason,
      });
      alert('Supplier selected successfully!');
      setSelectingQuote(null);
      setSelectionReason('');
      loadComparison(selectedRfqId);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to select supplier.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/60 rounded-xl border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              RFQ Supplier Quotation Comparison Matrix
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Side-by-side analytical evaluation of unit prices, total cost, lead times, payment terms, and overall supplier quality ratings.
            </p>
          </div>
        </div>
        <div className="w-full sm:w-64 shrink-0">
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Select Active RFQ</label>
          <select
            value={selectedRfqId}
            onChange={(e) => setSelectedRfqId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {rfqs.length === 0 && <option value="">No RFQs available</option>}
            {rfqs.map((rfq) => (
              <option key={rfq.id} value={rfq.id}>
                {rfq.rfq_number || rfq.id} — {rfq.title || rfq.product_id || 'RFQ'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid Matrix */}
      {loading ? (
        <div className="bg-white dark:bg-[#0F2647] p-12 text-center text-slate-500 dark:text-slate-400 font-medium rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          Loading supplier quotations matrix...
        </div>
      ) : quotations.length === 0 ? (
        <div className="bg-white dark:bg-[#0F2647] p-12 text-center text-slate-500 dark:text-slate-400 font-medium rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          No supplier quotations recorded for the selected RFQ.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotations.map((q) => (
            <div
              key={q.id}
              className={`bg-white dark:bg-[#0F2647] border rounded-2xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden ${
                q.status === 'SELECTED'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : q.isLowestPrice
                  ? 'border-purple-300 dark:border-purple-700'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Status Badges */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{q.quotation_number}</span>
                <div className="flex gap-2">
                  {q.isLowestPrice && (
                    <span className="px-2.5 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-full text-[11px] font-bold flex items-center space-x-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>Lowest Price</span>
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      q.status === 'SELECTED'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
              </div>

              {/* Supplier Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>{q.supplier?.company_name || 'Supplier'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Code: {q.supplier?.supplier_code || 'N/A'}</p>
                <div className="flex items-center space-x-1 mt-2 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Rating: {q.supplier?.rating ? `${q.supplier.rating} / 5.0` : 'N/A'}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold tracking-wider">Total Quoted Price:</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹{q.total_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold tracking-wider">Promised Lead Time:</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{q.lead_time_days} Days</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold tracking-wider">Payment Terms:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{q.payment_terms}</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="bg-slate-50 dark:bg-[#071220] rounded-xl p-3 mb-6 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Quoted Items Breakdown</p>
                <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                  {q.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300 py-0.5">
                      <span className="font-medium">{item.description} (x{item.quantity})</span>
                      <span className="font-mono text-slate-900 dark:text-white font-semibold">₹{item.unit_price?.toFixed(2)}/unit</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selection Button */}
              {q.status === 'SELECTED' ? (
                <div className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-xs font-bold flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Awarded Supplier</span>
                </div>
              ) : (
                <button
                  onClick={() => setSelectingQuote(q)}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition text-xs flex items-center justify-center space-x-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Award & Select Supplier</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selection Confirmation Modal */}
      {selectingQuote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <span>Confirm Supplier Selection Decision</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs mb-4">
              You are selecting <strong className="text-slate-900 dark:text-white font-bold">{selectingQuote.supplier?.company_name}</strong> for Quotation{' '}
              <strong className="text-slate-900 dark:text-white font-bold font-mono">{selectingQuote.quotation_number}</strong> at total cost ₹
              {selectingQuote.total_amount?.toFixed(2)}.
            </p>

            <div className="mb-4">
              <label className="text-xs uppercase font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Selection Rationale / Audit Justification *
              </label>
              <textarea
                rows={3}
                value={selectionReason}
                onChange={(e) => setSelectionReason(e.target.value)}
                placeholder="Explain why this supplier was chosen over competitors (e.g. best total value, lead time, technical compliance)..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectingQuote(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSelectSupplier}
                disabled={actionLoading || !selectionReason.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-xs"
              >
                {actionLoading ? 'Recording Selection...' : 'Confirm Supplier Selection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
