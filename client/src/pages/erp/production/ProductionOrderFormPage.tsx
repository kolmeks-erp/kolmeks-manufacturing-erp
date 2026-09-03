import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Layers,
  Save,
  Calendar,
  AlertTriangle,
  FolderTree,
  GitFork,
  FileText,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { productionService } from '../../../services/production.service';
import { apiClient } from '../../../services/api';
import { ProductionPriority } from '../../../types/production';

export const ProductionOrderFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledSOId = searchParams.get('so_id') || '';

  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [boms, setBOMs] = useState<any[]>([]);
  const [routings, setRoutings] = useState<any[]>([]);

  const [salesOrderId, setSalesOrderId] = useState<string>(prefilledSOId);
  const [productId, setProductId] = useState<string>('');
  const [bomId, setBomId] = useState<string>('');
  const [routingId, setRoutingId] = useState<string>('');
  const [plannedQuantity, setPlannedQuantity] = useState<string>('100');
  const [priority, setPriority] = useState<ProductionPriority>('MEDIUM');
  const [plannedStart, setPlannedStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [plannedEnd, setPlannedEnd] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    fetchInitialOptions();
  }, []);

  useEffect(() => {
    if (productId) {
      fetchBOMsAndRoutings(productId);
    } else {
      setBOMs([]);
      setRoutings([]);
      setBomId('');
      setRoutingId('');
    }
  }, [productId]);

  const fetchInitialOptions = async () => {
    try {
      setFetchingData(true);
      const [soRes, prodRes] = await Promise.all([
        apiClient.get('/sales-orders'),
        apiClient.get('/products'),
      ]);

      const fetchedSOs = soRes.data?.data || [];
      const fetchedProds = prodRes.data?.data || [];

      setSalesOrders(fetchedSOs);
      setProducts(fetchedProds);

      if (prefilledSOId) {
        const foundSO = fetchedSOs.find((s: any) => s.id === prefilledSOId);
        if (foundSO && foundSO.items && foundSO.items.length > 0) {
          const firstItem = foundSO.items[0];
          setProductId(firstItem.product_id);
          setPlannedQuantity(String(firstItem.quantity || '100'));
        }
      }
    } catch (err) {
      console.error('Failed to load initial options:', err);
      setErrorMsg('Failed to load Sales Orders or Products data.');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchBOMsAndRoutings = async (prodId: string) => {
    try {
      const [bomList, rtgList] = await Promise.all([
        productionService.getBOMs({ product_id: prodId }),
        productionService.getRoutings({ product_id: prodId }),
      ]);

      setBOMs(bomList);
      setRoutings(rtgList);

      const activeBom = bomList.find((b) => b.status === 'ACTIVE');
      if (activeBom) setBomId(activeBom.id);
      else if (bomList.length > 0) setBomId(bomList[0].id);
      else setBomId('');

      const activeRtg = rtgList.find((r) => r.status === 'ACTIVE');
      if (activeRtg) setRoutingId(activeRtg.id);
      else if (rtgList.length > 0) setRoutingId(rtgList[0].id);
      else setRoutingId('');
    } catch (err) {
      console.error('Failed to load BOMs/Routings:', err);
    }
  };

  const handleSalesOrderSelect = (soId: string) => {
    setSalesOrderId(soId);
    if (!soId) return;

    const foundSO = salesOrders.find((s) => s.id === soId);
    if (foundSO && foundSO.items && foundSO.items.length > 0) {
      const firstItem = foundSO.items[0];
      setProductId(firstItem.product_id);
      setPlannedQuantity(String(firstItem.quantity || '100'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const qty = parseFloat(plannedQuantity);
    if (!productId) {
      setErrorMsg('Please select a Product to manufacture.');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Planned Quantity must be greater than zero.');
      return;
    }

    try {
      setLoading(true);
      const created = await productionService.createOrder({
        sales_order_id: salesOrderId || undefined,
        product_id: productId,
        bom_id: bomId || undefined,
        routing_id: routingId || undefined,
        planned_quantity: qty,
        priority,
        planned_start: plannedStart || undefined,
        planned_end: plannedEnd || undefined,
        notes: notes || undefined,
      });

      navigate(`${ERP_BASE_PATH}/production/orders/${created.id}`);
    } catch (err: any) {
      console.error('Create production order error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create Production Order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/production/orders`)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Production Order</h1>
            <p className="text-slate-500 text-sm">Instruction to manufacture products on the shop floor.</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm font-medium">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Manufacturing Order Specifications</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sales Order Reference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sales Order Reference (Optional)
              </label>
              <select
                value={salesOrderId}
                onChange={(e) => handleSalesOrderSelect(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
              >
                <option value="">Standalone Production Order</option>
                {salesOrders.map((so) => (
                  <option key={so.id} value={so.id}>
                    {so.order_number} ({so.customer?.company_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Product Master <span className="text-rose-600">*</span>
              </label>
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
              >
                <option value="">Select Product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_code} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bill of Materials (BOM) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-amber-600" />
                <span>Bill of Materials (BOM)</span>
              </label>
              <select
                value={bomId}
                onChange={(e) => setBomId(e.target.value)}
                disabled={!productId || boms.length === 0}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 disabled:opacity-50"
              >
                {boms.length === 0 ? (
                  <option value="">No BOM found for this product</option>
                ) : (
                  boms.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bom_number} ({b.version}) [{b.status}]
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Manufacturing Routing */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-cyan-600" />
                <span>Manufacturing Routing</span>
              </label>
              <select
                value={routingId}
                onChange={(e) => setRoutingId(e.target.value)}
                disabled={!productId || routings.length === 0}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 disabled:opacity-50"
              >
                {routings.length === 0 ? (
                  <option value="">No Routing found for this product</option>
                ) : (
                  routings.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.routing_number} ({r.version}) [{r.status}]
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Planned Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Planned Quantity <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={plannedQuantity}
                onChange={(e) => setPlannedQuantity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Production Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProductionPriority)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            {/* Planned Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Planned Start Date</label>
              <input
                type="date"
                value={plannedStart}
                onChange={(e) => setPlannedStart(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Planned End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Planned Completion Date</label>
              <input
                type="date"
                value={plannedEnd}
                onChange={(e) => setPlannedEnd(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Production Instructions & Notes</label>
            <textarea
              rows={3}
              placeholder="Special manufacturing guidelines, tolerances, or shop floor instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/production/orders`)}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Creating...' : 'Create Production Order'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
