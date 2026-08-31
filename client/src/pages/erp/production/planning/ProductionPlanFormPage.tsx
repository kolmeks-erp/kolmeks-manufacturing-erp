import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Trash2,
  Calendar,
  Save,
  ArrowLeft,
  Package,
  Layers,
} from 'lucide-react';
import ERPPageHeader from '../../../../components/erp/ERPPageHeader';
import { ERP_BASE_PATH } from '../../../../constants/navigation';
import { planningService } from '../../../../services/planning.service';
import api from '../../../../services/api';

const ProductionPlanFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Header State
  const [planName, setPlanName] = useState<string>('');
  const [periodType, setPeriodType] = useState<string>('MONTHLY');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>('');

  // Products & Sales Orders Master Options
  const [products, setProducts] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);

  // Plan Lines State
  const [lines, setLines] = useState<
    {
      product_id: string;
      planned_quantity: number;
      required_date: string;
      demand_source: 'SALES_ORDER' | 'FORECAST' | 'MANUAL';
      sales_order_id: string;
      priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
      notes: string;
    }[]
  >([
    {
      product_id: '',
      planned_quantity: 10,
      required_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      demand_source: 'SALES_ORDER',
      sales_order_id: '',
      priority: 'NORMAL',
      notes: '',
    },
  ]);

  useEffect(() => {
    // Fetch Products list
    api.get('/products').then((res) => {
      if (res.data?.success) setProducts(res.data.data || []);
    }).catch(() => {});

    // Fetch Eligible Sales Orders list
    api.get('/sales/orders', { params: { status: 'CONFIRMED' } }).then((res) => {
      if (res.data?.success) setSalesOrders(res.data.data || []);
    }).catch(() => {});
  }, []);

  const addLine = () => {
    setLines([
      ...lines,
      {
        product_id: '',
        planned_quantity: 1,
        required_date: endDate,
        demand_source: 'MANUAL',
        sales_order_id: '',
        priority: 'NORMAL',
        notes: '',
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) {
      setErrorMsg('Plan Name is required.');
      return;
    }

    const invalidLine = lines.find((l) => !l.product_id || l.planned_quantity <= 0);
    if (invalidLine) {
      setErrorMsg('Please select a valid Product and positive Planned Quantity for all line items.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await planningService.createPlan({
        plan_name: planName,
        period_type: periodType,
        start_date: startDate,
        end_date: endDate,
        description,
        lines,
      });

      if (res.success) {
        navigate(`${ERP_BASE_PATH}/production/planning/plans/${res.data.id}`);
      } else {
        setErrorMsg(res.message || 'Failed to create production plan.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error submitting production plan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ERPPageHeader
        title="Create Master Production Plan"
        subtitle="Define planning window, select products, and allocate sales order demand"
        actions={
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/plans`)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft size={14} /> Back to Plans
          </button>
        }
      />

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Form */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="text-blue-600 dark:text-blue-400" size={18} /> Plan Header Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Plan Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Q3 Motor Assembly Production Plan"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Period Horizon</label>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
                <option value="QUARTERLY">QUARTERLY</option>
                <option value="CUSTOM">CUSTOM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description & Notes</label>
              <textarea
                rows={2}
                placeholder="Optional planning objectives, target delivery notes, or capacity constraints..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="text-emerald-600 dark:text-emerald-400" size={18} /> Planned Production Lines
            </h3>
            <button
              type="button"
              onClick={addLine}
              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-100 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-500/20 flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> Add Line Item
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-4">
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Product</label>
                  <select
                    value={line.product_id}
                    onChange={(e) => updateLine(index, 'product_id', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.product_code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Planned Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={line.planned_quantity}
                    onChange={(e) => updateLine(index, 'planned_quantity', Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Required Date</label>
                  <input
                    type="date"
                    value={line.required_date}
                    onChange={(e) => updateLine(index, 'required_date', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Priority</label>
                  <select
                    value={line.priority}
                    onChange={(e) => updateLine(index, 'priority', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-center justify-end">
                  <button
                    type="button"
                    disabled={lines.length === 1}
                    onClick={() => removeLine(index)}
                    className="p-2 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/plans`)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Save size={16} /> Save Production Plan (DRAFT)
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductionPlanFormPage;
