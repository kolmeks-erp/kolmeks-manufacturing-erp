import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  FileCheck,
  Award,
  Truck,
  RotateCcw,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { procurementP2PService } from '../../../services/procurement_p2p.service';
import { ProcurementTelemetry } from '../../../types/procurement_p2p';

export const ProcurementDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<ProcurementTelemetry | null>(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const data = await procurementP2PService.getTelemetry();
      setTelemetry(data);
    } catch (err) {
      console.error('Failed to load procurement telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 dark:from-[#0F2647] dark:via-[#071220] dark:to-[#0F2647] p-6 sm:p-8 rounded-2xl border border-blue-800/40 shadow-xs text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-400/30">
              Procurement & Purchase-to-Pay (P2P)
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-2.5 flex items-center space-x-3 tracking-tight">
              <ShoppingBag className="w-7 h-7 text-blue-400" />
              <span>Purchase-to-Pay Operational Telemetry</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
              End-to-end strategic procurement oversight: Purchase Requisitions, RFQs, Supplier Quotations, PO Approvals, Goods Receipts, Quality Holds, Returns, and 3-Way Invoice Matching.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              to="/secure-kolmeks-x0y0/procurement/reports"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-2 text-xs"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Executive Reports</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Requisitions */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Open Requisitions</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{loading ? '...' : telemetry?.openRequisitionsCount || 0}</h3>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Pending Review/Approval</span>
          </div>
        </div>

        {/* Open RFQs */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100 dark:border-purple-800">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Active RFQs & Quotes</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{loading ? '...' : (telemetry?.openRFQsCount || 0) + (telemetry?.pendingQuotesCount || 0)}</h3>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Awaiting Supplier Quotes</span>
          </div>
        </div>

        {/* Open POs & Pending Receipts */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Open POs / GRNs</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{loading ? '...' : (telemetry?.openPOsCount || 0)}</h3>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{telemetry?.pendingReceiptsCount || 0} Receipts In Progress</span>
          </div>
        </div>

        {/* Quality Holds & Returns */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-800">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Quality Holds & RMAs</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{loading ? '...' : (telemetry?.qualityHoldsCount || 0) + (telemetry?.supplierReturnsCount || 0)}</h3>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Supplier Returns & Quarantines</span>
          </div>
        </div>
      </div>

      {/* P2P Flow & Quick Navigation Matrix */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-6">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Purchase-to-Pay (P2P) Standard Operating Workflow</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1: Supplier & RFQ */}
          <Link
            to="/secure-kolmeks-x0y0/procurement/comparison"
            className="p-5 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl transition group flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Step 1 • Strategic Sourcing</span>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">RFQ & Quotation Comparison</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-2">Compare supplier quotes by price, lead time, ratings, and execute authorized selection decisions.</p>
            </div>
            <div className="mt-4 flex items-center text-xs text-blue-600 dark:text-blue-400 font-bold">
              <span>View Quote Matrix</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Step 2: PO Management */}
          <Link
            to="/secure-kolmeks-x0y0/procurement/orders"
            className="p-5 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl transition group flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Step 2 • Procurement Orders</span>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Purchase Orders & Amendments</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-2">Issue POs, handle approval workflows, controlled field amendments, and price validation.</p>
            </div>
            <div className="mt-4 flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              <span>Manage POs</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Step 3: Goods Receipt & Returns */}
          <Link
            to="/secure-kolmeks-x0y0/procurement/returns"
            className="p-5 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-xl transition group flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Step 3 • Receiving & RMAs</span>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">GRN & Supplier Returns</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-2">Process partial/over-receipt tolerances, quality hold inspections, and log supplier RMAs.</p>
            </div>
            <div className="mt-4 flex items-center text-xs text-amber-600 dark:text-amber-400 font-bold">
              <span>Manage Returns</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Step 4: Three-Way Match */}
          <Link
            to="/secure-kolmeks-x0y0/procurement/three-way-match"
            className="p-5 bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl transition group flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Step 4 • Accounts Payable</span>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">Three-Way Matching</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-2">Match PO + GRN + Supplier Invoice, evaluate price & quantity variances before payment authorization.</p>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Verify Invoices</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
