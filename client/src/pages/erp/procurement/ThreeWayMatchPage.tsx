import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Search,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { procurementP2PService } from '../../../services/procurement_p2p.service';
import { ThreeWayMatchResult } from '../../../types/procurement_p2p';
import { apiClient as api } from '../../../services/api';

export const ThreeWayMatchPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [matchResult, setMatchResult] = useState<ThreeWayMatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/purchase-invoices');
      const data = res.data.data || res.data || [];
      setInvoices(data);
      if (data.length > 0) {
        setSelectedInvoiceId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load purchase invoices:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRunMatch = async (invId: string) => {
    if (!invId) return;
    setLoading(true);
    try {
      const res = await procurementP2PService.performThreeWayMatch(invId);
      setMatchResult(res);
    } catch (err: any) {
      console.error('Failed to perform three-way match:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInvoiceId) {
      handleRunMatch(selectedInvoiceId);
    }
  }, [selectedInvoiceId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span>Three-Way Invoice Matching (PO + GRN + Invoice)</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Automated verification comparing Purchase Order price/terms, Goods Receipt actual quantities, and Supplier Invoice amounts.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Select Purchase Invoice</label>
          <select
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            {invoices.length === 0 && <option value="">No Invoices Available</option>}
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.internal_invoice_number || inv.supplier_invoice_number} (
                {inv.supplier?.company_name || 'Supplier'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Match Result Display */}
      {loading ? (
        <div className="bg-slate-800/80 p-12 text-center text-slate-400 rounded-2xl border border-slate-700/60">
          Performing 3-Way Match validation...
        </div>
      ) : !matchResult ? (
        <div className="bg-slate-800/80 p-12 text-center text-slate-400 rounded-2xl border border-slate-700/60">
          Select an invoice to run three-way matching.
        </div>
      ) : (
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-700">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Match Verification Status</span>
              <h2 className="text-2xl font-bold text-white mt-1 flex items-center space-x-3">
                {matchResult.matchStatus === 'MATCHED' ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-amber-400" />
                )}
                <span>{matchResult.matchStatus}</span>
              </h2>
            </div>
            <button
              onClick={() => handleRunMatch(selectedInvoiceId)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-medium transition flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-run Validation</span>
            </button>
          </div>

          {/* Document Verification Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-700 rounded-xl">
              <p className="text-xs uppercase font-semibold text-slate-400">1. Purchase Order</p>
              <h4 className="text-lg font-bold text-white mt-1">{matchResult.poReference}</h4>
              <p className="text-xs text-slate-400 mt-1">Contracted line item prices & terms</p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-700 rounded-xl">
              <p className="text-xs uppercase font-semibold text-slate-400">2. Goods Receipt (GRN)</p>
              <h4 className="text-lg font-bold text-white mt-1">{matchResult.grnReference}</h4>
              <p className="text-xs text-slate-400 mt-1">Verified warehouse received stock</p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-700 rounded-xl">
              <p className="text-xs uppercase font-semibold text-slate-400">3. Supplier Invoice</p>
              <h4 className="text-lg font-bold text-white mt-1">{selectedInvoiceId.slice(0, 8)}...</h4>
              <p className="text-xs text-slate-400 mt-1">Billed quantities and amounts</p>
            </div>
          </div>

          {/* Variance Breakdown */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-white">Match Variance Inspection Results</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${matchResult.hasPriceVariance ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">Price Variance Check</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${matchResult.hasPriceVariance ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {matchResult.hasPriceVariance ? 'VARIANCE DETECTED' : 'PASS (0.00 Variance)'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  {matchResult.hasPriceVariance
                    ? 'Unit price or total billing amount differs from approved PO terms. Manager approval required.'
                    : 'Invoice unit prices strictly match approved PO terms.'}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${matchResult.hasQtyVariance ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">Quantity Variance Check</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${matchResult.hasQtyVariance ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {matchResult.hasQtyVariance ? 'VARIANCE DETECTED' : 'PASS (0.00 Variance)'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  {matchResult.hasQtyVariance
                    ? 'Invoiced line quantities differ from physically received GRN stock quantities.'
                    : 'Invoiced quantities match physically received GRN items.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
