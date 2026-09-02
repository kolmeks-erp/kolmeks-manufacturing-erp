import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
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
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Three-Way Invoice Matching (PO + GRN + Invoice)
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Automated verification comparing Purchase Order price/terms, Goods Receipt actual quantities, and Supplier Invoice amounts.
            </p>
          </div>
        </div>
        <div className="w-full sm:w-64 shrink-0">
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Select Purchase Invoice</label>
          <select
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
        <div className="bg-white dark:bg-[#0F2647] p-12 text-center text-slate-500 dark:text-slate-400 font-medium rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          Performing 3-Way Match validation...
        </div>
      ) : !matchResult ? (
        <div className="bg-white dark:bg-[#0F2647] p-12 text-center text-slate-500 dark:text-slate-400 font-medium rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          Select an invoice to run three-way matching.
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Match Verification Status</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center space-x-3">
                {matchResult.matchStatus === 'MATCHED' ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                )}
                <span>{matchResult.matchStatus}</span>
              </h2>
            </div>
            <button
              onClick={() => handleRunMatch(selectedInvoiceId)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-run Validation</span>
            </button>
          </div>

          {/* Document Verification Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 rounded-xl">
              <p className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">1. Purchase Order</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">{matchResult.poReference}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Contracted line item prices & terms</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 rounded-xl">
              <p className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">2. Goods Receipt (GRN)</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">{matchResult.grnReference}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Verified warehouse received stock</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 rounded-xl">
              <p className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">3. Supplier Invoice</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">{selectedInvoiceId.slice(0, 8)}...</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Billed quantities and amounts</p>
            </div>
          </div>

          {/* Variance Breakdown */}
          <div className="bg-slate-50 dark:bg-[#071220] p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Match Variance Inspection Results</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${matchResult.hasPriceVariance ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Price Variance Check</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${matchResult.hasPriceVariance ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'}`}>
                    {matchResult.hasPriceVariance ? 'VARIANCE DETECTED' : 'PASS (0.00 Variance)'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                  {matchResult.hasPriceVariance
                    ? 'Unit price or total billing amount differs from approved PO terms. Manager approval required.'
                    : 'Invoice unit prices strictly match approved PO terms.'}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${matchResult.hasQtyVariance ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Quantity Variance Check</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${matchResult.hasQtyVariance ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'}`}>
                    {matchResult.hasQtyVariance ? 'VARIANCE DETECTED' : 'PASS (0.00 Variance)'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
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
