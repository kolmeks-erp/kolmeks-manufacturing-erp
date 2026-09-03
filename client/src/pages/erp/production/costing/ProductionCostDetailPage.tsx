import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calculator,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  IndianRupee,
  Layers,
  Wrench,
  Clock,
  Send,
  BookOpen,
} from 'lucide-react';
import { costingService, CostComponent } from '../../../../services/costing.service';

export const ProductionCostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [posting, setPosting] = useState<boolean>(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await costingService.getProductionCostOrderById(id);
      if (res.success) {
        setDetailData(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching cost details:', err);
      setMessage({ type: 'error', text: err.message || 'Unable to load costing details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleCalculate = async () => {
    if (!id) return;
    try {
      setCalculating(true);
      setMessage(null);
      const res = await costingService.calculateCost(id);
      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Cost calculation updated successfully.' });
        fetchDetail();
      }
    } catch (err: any) {
      console.error('Calculation error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Calculation failed.' });
    } finally {
      setCalculating(false);
    }
  };

  const handlePostGL = async () => {
    if (!id) return;
    try {
      setPosting(true);
      setMessage(null);
      const res = await costingService.postCost(id);
      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Journal entry posted successfully to General Ledger.' });
        fetchDetail();
      }
    } catch (err: any) {
      console.error('GL Post error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to post GL journal entry.' });
    } finally {
      setPosting(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading manufacturing costing telemetry for production order...
      </div>
    );
  }

  const order = detailData?.order;
  const costing = detailData?.costing;
  const components: CostComponent[] = detailData?.components || [];
  const wip = detailData?.wip;
  const config = detailData?.config;

  const matComponents = components.filter((c) => c.component_type === 'MATERIAL');
  const labComponents = components.filter((c) => c.component_type === 'LABOR');
  const ovhComponents = components.filter((c) => c.component_type === 'OVERHEAD');

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/secure-kolmeks-x0y0/production/costing/orders')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Costing Orders
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
            {calculating ? 'Calculating...' : 'Recalculate Cost'}
          </button>

          {costing && costing.status !== 'POSTED' && (
            <button
              onClick={handlePostGL}
              disabled={posting}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              <Send className={`w-4 h-4 ${posting ? 'animate-spin' : ''}`} />
              {posting ? 'Posting to GL...' : 'Post to General Ledger'}
            </button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {order?.production_order_number || order?.production_number}
            </h1>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                costing?.status === 'POSTED'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              {costing?.status || 'NOT CALCULATED'}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Product: <span className="text-slate-900 dark:text-white font-medium">{order?.product?.name}</span> ({order?.product?.product_code})
          </p>
        </div>

        {/* Header Key Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Planned Qty</div>
            <div className="text-slate-900 dark:text-white font-bold">{order?.planned_quantity} {order?.product?.unit}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completed Qty</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold">{order?.completed_quantity || 0} {order?.product?.unit}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Cost</div>
            <div className="text-slate-900 dark:text-white font-bold">{formatCurrency(costing?.total_cost)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Unit Cost</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(costing?.unit_cost)}</div>
          </div>
        </div>
      </div>

      {/* Baseline Comparison Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Direct Material Cost</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(costing?.material_cost)}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">BOM Planned: {formatCurrency(costing?.planned_material_cost)}</div>
        </div>

        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Direct Labor Cost</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(costing?.labor_cost)}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Routing Planned: {formatCurrency(costing?.planned_labor_cost)}</div>
        </div>

        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Manufacturing Overhead</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(costing?.overhead_cost)}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Config Rate: {formatCurrency(costing?.planned_overhead_cost)}</div>
        </div>

        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Cost Variance</div>
          <div className={`text-xl font-bold mt-1 ${(costing?.total_variance || 0) >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatCurrency(costing?.total_variance)}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Variance %: {costing?.total_variance_pct || 0}%</div>
        </div>
      </div>

      {/* Itemized Components Breakdown */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Itemized Manufacturing Cost Components
        </h3>

        {/* Material Components Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">1. Direct Material Consumptions</h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3">Planned Qty</th>
                  <th className="p-3">Actual Issued Qty</th>
                  <th className="p-3">Unit Cost Rate</th>
                  <th className="p-3">Actual Extended Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {matComponents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">No material consumptions recorded yet.</td>
                  </tr>
                ) : (
                  matComponents.map((c, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium text-slate-900 dark:text-white">{c.description}</td>
                      <td className="p-3">{c.planned_quantity} {c.unit_of_measure}</td>
                      <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{c.actual_quantity} {c.unit_of_measure}</td>
                      <td className="p-3">{formatCurrency(c.unit_rate)}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{formatCurrency(c.actual_cost)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Labor Components Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">2. Direct Labor Foundation</h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Operation / Work Center</th>
                  <th className="p-3">Planned Hours</th>
                  <th className="p-3">Actual Hours</th>
                  <th className="p-3">Hourly Rate</th>
                  <th className="p-3">Actual Labor Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {labComponents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">No labor operations recorded yet.</td>
                  </tr>
                ) : (
                  labComponents.map((c, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium text-slate-900 dark:text-white">{c.description}</td>
                      <td className="p-3">{c.planned_quantity} hrs</td>
                      <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">{c.actual_quantity} hrs</td>
                      <td className="p-3">{formatCurrency(c.unit_rate)}/hr</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{formatCurrency(c.actual_cost)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overhead Components Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">3. Manufacturing Overhead Allocation</h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Overhead Category</th>
                  <th className="p-3">Planned Allocation</th>
                  <th className="p-3">Actual Allocation</th>
                  <th className="p-3">Allocation Rate</th>
                  <th className="p-3">Actual Overhead Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {ovhComponents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">No overhead allocation calculated yet.</td>
                  </tr>
                ) : (
                  ovhComponents.map((c, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium text-slate-900 dark:text-white">{c.description}</td>
                      <td className="p-3">{c.planned_quantity} hrs</td>
                      <td className="p-3 font-semibold text-purple-600 dark:text-purple-400">{c.actual_quantity} hrs</td>
                      <td className="p-3">{formatCurrency(c.unit_rate)}/hr</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{formatCurrency(c.actual_cost)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionCostDetailPage;
