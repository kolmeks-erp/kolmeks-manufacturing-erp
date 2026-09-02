import React, { useEffect, useState } from 'react';
import {
  Award,
  DollarSign,
  Clock,
  Star,
  CheckCircle2,
  FileText,
  AlertCircle,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Award className="w-7 h-7 text-purple-400" />
            <span>RFQ Supplier Quotation Comparison Matrix</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Side-by-side analytical evaluation of unit prices, total cost, lead times, payment terms, and overall supplier quality ratings.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Select Active RFQ</label>
          <select
            value={selectedRfqId}
            onChange={(e) => setSelectedRfqId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
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
        <div className="bg-slate-800/80 p-12 text-center text-slate-400 rounded-2xl border border-slate-700/60">
          Loading supplier quotations matrix...
        </div>
      ) : quotations.length === 0 ? (
        <div className="bg-slate-800/80 p-12 text-center text-slate-400 rounded-2xl border border-slate-700/60">
          No supplier quotations recorded for the selected RFQ.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotations.map((q) => (
            <div
              key={q.id}
              className={`bg-slate-800/80 backdrop-blur-sm border rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden ${
                q.status === 'SELECTED'
                  ? 'border-emerald-500/80 ring-2 ring-emerald-500/20'
                  : q.isLowestPrice
                  ? 'border-purple-500/60'
                  : 'border-slate-700/60'
              }`}
            >
              {/* Status Badges */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono font-bold text-slate-400">{q.quotation_number}</span>
                <div className="flex gap-2">
                  {q.isLowestPrice && (
                    <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>Lowest Price</span>
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      q.status === 'SELECTED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
              </div>

              {/* Supplier Header */}
              <div className="border-b border-slate-700/60 pb-4 mb-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <span>{q.supplier?.company_name || 'Supplier'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Code: {q.supplier?.supplier_code || 'N/A'}</p>
                <div className="flex items-center space-x-1 mt-2 text-amber-400 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Rating: {q.supplier?.rating ? `${q.supplier.rating} / 5.0` : 'N/A'}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3 text-sm text-slate-300 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs uppercase font-medium">Total Quoted Price:</span>
                  <span className="text-xl font-bold text-emerald-400">₹{q.total_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs uppercase font-medium">Promised Lead Time:</span>
                  <span className="font-semibold text-white flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{q.lead_time_days} Days</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs uppercase font-medium">Payment Terms:</span>
                  <span className="font-medium text-slate-200">{q.payment_terms}</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="bg-slate-900/60 rounded-xl p-3 mb-6 border border-slate-700/50">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Quoted Items Breakdown</p>
                <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                  {q.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300 py-0.5">
                      <span>{item.description} (x{item.quantity})</span>
                      <span className="font-mono text-slate-200">₹{item.unit_price?.toFixed(2)}/unit</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selection Button */}
              {q.status === 'SELECTED' ? (
                <div className="w-full py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-center text-sm font-semibold flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Awarded Supplier</span>
                </div>
              ) : (
                <button
                  onClick={() => setSelectingQuote(q)}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl shadow-md transition text-sm flex items-center justify-center space-x-2"
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
              <Award className="w-6 h-6 text-purple-400" />
              <span>Confirm Supplier Selection Decision</span>
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              You are selecting <strong className="text-white">{selectingQuote.supplier?.company_name}</strong> for Quotation{' '}
              <strong className="text-white">{selectingQuote.quotation_number}</strong> at total cost ₹
              {selectingQuote.total_amount?.toFixed(2)}.
            </p>

            <div className="mb-4">
              <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">
                Selection Rationale / Audit Justification *
              </label>
              <textarea
                rows={3}
                value={selectionReason}
                onChange={(e) => setSelectionReason(e.target.value)}
                placeholder="Explain why this supplier was chosen over competitors (e.g. best total value, lead time, technical compliance)..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectingQuote(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSelectSupplier}
                disabled={actionLoading || !selectionReason.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
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
