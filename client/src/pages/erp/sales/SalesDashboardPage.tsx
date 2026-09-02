import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  FileSpreadsheet,
  FileCheck,
  Truck,
  RotateCcw,
  IndianRupee,
  PackageCheck,
  Plus,
  ArrowRight,
  RefreshCw,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { salesService } from '../../../services/sales.service';
import { SalesDashboardData } from '../../../types/sales';

export const SalesDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SalesDashboardData | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await salesService.getDashboardData();
      setData(res);
    } catch (err) {
      console.error('Failed to load Sales Dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const kpis = data?.kpis;
  const funnel = data?.funnel;

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-400/30 uppercase tracking-wider">
              Order-to-Cash Hub
            </span>
            <span className="text-slate-400 text-sm">• Live Commercial Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1.5">Sales & Distribution ERP</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Streamlined order-to-cash workflow — Quotation approval, Order reservation, Pick & Pack fulfillment, Dispatch tracking, Returns, and Credit management.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center border border-white/10"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to={`${ERP_BASE_PATH}/sales/quotations/new`}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs transition flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </Link>
          <Link
            to={`${ERP_BASE_PATH}/sales/orders/new`}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs transition flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Sales Order</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Quotations */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-blue-500 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Commercial Quotations</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {loading ? '...' : kpis?.totalQuotationCount || 0}
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-bold">
                Value: ₹{loading ? '0.00' : (kpis?.totalQuotationValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>
          <Link
            to={`${ERP_BASE_PATH}/sales/quotations`}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 pt-3 border-t border-slate-100 dark:border-slate-800 transition"
          >
            <span>View All Quotations</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Open Sales Orders */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-emerald-500 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Open Sales Orders</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {loading ? '...' : kpis?.openOrdersCount || 0}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                Pipeline: ₹{loading ? '0.00' : (kpis?.openOrdersValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
          <Link
            to={`${ERP_BASE_PATH}/sales/orders`}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 pt-3 border-t border-slate-100 dark:border-slate-800 transition"
          >
            <span>Manage Orders</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Pending & Today's Deliveries */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-indigo-500 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Dispatches & Deliveries</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {loading ? '...' : kpis?.pendingDeliveries || 0}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-bold">
                Dispatched Today: {loading ? '0' : kpis?.deliveriesToday || 0}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <Truck className="w-6 h-6" />
            </div>
          </div>
          <Link
            to={`${ERP_BASE_PATH}/sales/deliveries`}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 pt-3 border-t border-slate-100 dark:border-slate-800 transition"
          >
            <span>Delivery Orders</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-amber-500 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Accounts Receivable</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                ₹{loading ? '0.00' : (kpis?.outstandingReceivables || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-bold">
                Returns Logged: {loading ? '0' : kpis?.totalReturnsCount || 0}
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <Link
            to={`${ERP_BASE_PATH}/sales/invoices`}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 pt-3 border-t border-slate-100 dark:border-slate-800 transition"
          >
            <span>Sales Invoices</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Order-to-Cash Workflow Funnel & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order-to-Cash Funnel Visualizer */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Order-to-Cash Workflow Funnel</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live operational lifecycle tracking across quotation, reservation, and fulfillment</p>
            </div>
            <span className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full font-bold">
              Active Workflow
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            {/* Step 1: Draft Quotation */}
            <div className="bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Draft Quotes</p>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">{funnel?.draftQuotations || 0}</span>
            </div>

            {/* Step 2: Approved Quote */}
            <div className="bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Approved Quotes</p>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">{funnel?.approvedQuotations || 0}</span>
            </div>

            {/* Step 3: Confirmed Sales Order */}
            <div className="bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Confirmed SOs</p>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">{funnel?.confirmedOrders || 0}</span>
            </div>

            {/* Step 4: Pick & Pack */}
            <div className="bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Total Orders</p>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">{funnel?.totalOrders || 0}</span>
            </div>

            {/* Step 5: Delivered & Invoiced */}
            <div className="bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Delivered</p>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">{funnel?.deliveredOrders || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Module Navigation */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sales & Distribution Modules</h2>
          <div className="space-y-2">
            <Link
              to={`${ERP_BASE_PATH}/sales/fulfillment`}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#071220] hover:bg-blue-50/60 dark:hover:bg-[#132d54]/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition text-xs font-bold"
            >
              <div className="flex items-center space-x-3">
                <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Order Fulfillment & Reservations</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to={`${ERP_BASE_PATH}/sales/picking`}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#071220] hover:bg-blue-50/60 dark:hover:bg-[#132d54]/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition text-xs font-bold"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Picking Lists & Dispatching</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to={`${ERP_BASE_PATH}/sales/packing`}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#071220] hover:bg-blue-50/60 dark:hover:bg-[#132d54]/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition text-xs font-bold"
            >
              <div className="flex items-center space-x-3">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Packing Slips & Packages</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to={`${ERP_BASE_PATH}/sales/returns`}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#071220] hover:bg-blue-50/60 dark:hover:bg-[#132d54]/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition text-xs font-bold"
            >
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Sales Returns & Credit Notes</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to={`${ERP_BASE_PATH}/sales/pricing`}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#071220] hover:bg-blue-50/60 dark:hover:bg-[#132d54]/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition text-xs font-bold"
            >
              <div className="flex items-center space-x-3">
                <IndianRupee className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Customer & Product Pricing</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
