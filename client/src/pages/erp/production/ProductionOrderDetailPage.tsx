import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Layers,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PauseCircle,
  XCircle,
  FolderTree,
  GitFork,
  Boxes,
  Plus,
  UserCheck,
  Building2,
  FileText,
  Activity,
  PackageCheck,
  Send,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { productionService } from '../../../services/production.service';
import { warehouseService } from '../../../services/warehouse.service';
import { ProductionOrder, ProductionOrderStatus } from '../../../types/production';
import { Warehouse, StorageLocation } from '../../../types/inventory';

export const ProductionOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<ProductionOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Modals state
  const [showConsumptionModal, setShowConsumptionModal] = useState<boolean>(false);
  const [showOutputModal, setShowOutputModal] = useState<boolean>(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<StorageLocation[]>([]);

  // Consumption Form state
  const [consumeProductId, setConsumeProductId] = useState<string>('');
  const [consumeWarehouseId, setConsumeWarehouseId] = useState<string>('');
  const [consumeLocationId, setConsumeLocationId] = useState<string>('');
  const [consumeQty, setConsumeQty] = useState<string>('');
  const [consumeNotes, setConsumeNotes] = useState<string>('');

  // Output Form state
  const [outputWarehouseId, setOutputWarehouseId] = useState<string>('');
  const [outputLocationId, setOutputLocationId] = useState<string>('');
  const [outputQty, setOutputQty] = useState<string>('');
  const [rejectedQty, setRejectedQty] = useState<string>('0');
  const [outputNotes, setOutputNotes] = useState<string>('');

  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    if (id) fetchOrder();
    fetchWarehouses();
  }, [id]);

  useEffect(() => {
    if (consumeWarehouseId) {
      fetchLocations(consumeWarehouseId);
    }
  }, [consumeWarehouseId]);

  useEffect(() => {
    if (outputWarehouseId) {
      fetchLocations(outputWarehouseId);
    }
  }, [outputWarehouseId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await productionService.getOrderById(id!);
      setOrder(data);
    } catch (err: any) {
      console.error('Fetch order error:', err);
      setErrorMsg('Failed to load Production Order details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await warehouseService.getWarehouses({ status: 'active' });
      const list = res.data || [];
      setWarehouses(list as any);
      if (list.length > 0) {
        setConsumeWarehouseId(list[0].id);
        setOutputWarehouseId(list[0].id);
      }
    } catch (err) {
      console.error('Fetch warehouses error:', err);
    }
  };

  const fetchLocations = async (whId: string) => {
    try {
      const res = await warehouseService.getWarehouseLocations(whId);
      setLocations((res.data || []) as any);
    } catch (err) {
      console.error('Fetch locations error:', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      setActionLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const updated = await productionService.updateOrderStatus(order.id, newStatus);
      setOrder(updated);
      setSuccessMsg(`Production Order status set to ${newStatus}.`);
      fetchOrder();
    } catch (err: any) {
      console.error('Status change error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOperationStepStatus = async (opId: string, st: string) => {
    try {
      setActionLoading(true);
      await productionService.updateOperationStatus(opId, { status: st });
      fetchOrder();
    } catch (err: any) {
      console.error('Operation step error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update operation status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordConsumption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    try {
      setActionLoading(true);
      setErrorMsg('');
      await productionService.recordMaterialConsumption(order.id, {
        product_id: consumeProductId,
        warehouse_id: consumeWarehouseId,
        location_id: consumeLocationId || undefined,
        quantity: parseFloat(consumeQty),
        notes: consumeNotes || undefined,
      });

      setShowConsumptionModal(false);
      setSuccessMsg('Material consumption recorded and stock updated.');
      fetchOrder();
    } catch (err: any) {
      console.error('Consumption error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to record material consumption.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordOutput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    try {
      setActionLoading(true);
      setErrorMsg('');
      await productionService.recordProductionOutput(order.id, {
        warehouse_id: outputWarehouseId,
        location_id: outputLocationId || undefined,
        quantity: parseFloat(outputQty),
        rejected_quantity: parseFloat(rejectedQty || '0'),
        notes: outputNotes || undefined,
      });

      setShowOutputModal(false);
      setSuccessMsg('Production output posted to finished goods inventory!');
      fetchOrder();
    } catch (err: any) {
      console.error('Output error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to record production output.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
        Production Order not found.
      </div>
    );
  }

  const planned = typeof order.planned_quantity === 'number' ? order.planned_quantity : parseFloat(String(order.planned_quantity || '0'));
  const completed = typeof order.completed_quantity === 'number' ? order.completed_quantity : parseFloat(String(order.completed_quantity || '0'));
  const rejected = typeof order.rejected_quantity === 'number' ? order.rejected_quantity : parseFloat(String(order.rejected_quantity || '0'));
  const pct = planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : 0;

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/production/orders`)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-indigo-400">{order.production_order_number}</span>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {order.priority} PRIORITY
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Target Product: <span className="text-white font-medium">{order.product?.name}</span> ({order.product?.product_code})
            </p>
          </div>
        </div>

        {/* Status Workflow Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {order.status === 'DRAFT' && (
            <button
              disabled={actionLoading}
              onClick={() => handleStatusChange('PLANNED')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-all"
            >
              Plan Order
            </button>
          )}

          {(order.status === 'DRAFT' || order.status === 'PLANNED') && (
            <button
              disabled={actionLoading}
              onClick={() => handleStatusChange('RELEASED')}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-600/20"
            >
              Release for Production
            </button>
          )}

          {order.status === 'RELEASED' && (
            <button
              disabled={actionLoading}
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/25"
            >
              Start Production
            </button>
          )}

          {order.status === 'IN_PROGRESS' && (
            <>
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('PAUSED')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium text-sm transition-all border border-slate-700"
              >
                Pause Job
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('COMPLETED')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-600/25"
              >
                Mark Completed
              </button>
            </>
          )}

          {order.status === 'PAUSED' && (
            <button
              disabled={actionLoading}
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all"
            >
              Resume Job
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Progress & Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Card */}
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Production Progress</h3>
            <span className="text-2xl font-bold text-indigo-400 font-mono">{pct}%</span>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all"
              style={{ width: `${pct}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-4 text-center">
            <div>
              <div className="text-xs text-slate-400">Planned Qty</div>
              <div className="text-lg font-bold text-white font-mono">{planned} {order.product?.unit}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Completed Qty</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">{completed} {order.product?.unit}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Rejected Qty</div>
              <div className="text-lg font-bold text-rose-400 font-mono">{rejected} {order.product?.unit}</div>
            </div>
          </div>
        </div>

        {/* Order Details Summary Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">Order Context</h3>
          
          <div className="text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Sales Order:</span>
              {order.sales_order ? (
                <span className="text-indigo-400 font-mono font-semibold">{order.sales_order.order_number}</span>
              ) : (
                <span className="text-slate-400">N/A</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="text-white font-medium">{order.sales_order?.customer?.company_name || 'Internal Stock'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Active BOM:</span>
              <span className="text-amber-400 font-mono">{order.bom?.bom_number || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Active Routing:</span>
              <span className="text-cyan-400 font-mono">{order.routing?.routing_number || 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Material Requirements & Shortage Check */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-400" />
              <span>Material Requirements & Stock Availability</span>
            </h3>
            <p className="text-xs text-slate-400">Calculated based on Active BOM × Planned Quantity.</p>
          </div>

          <div className="flex items-center gap-3">
            {order.has_material_shortage && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5" /> Material Shortage Detected
              </span>
            )}
            <button
              onClick={() => setShowConsumptionModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Material Consumption</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Component Material</th>
                <th className="px-4 py-3 text-right">Qty Per Unit</th>
                <th className="px-4 py-3 text-right">Scrap %</th>
                <th className="px-4 py-3 text-right">Total Required</th>
                <th className="px-4 py-3 text-right">Available Stock</th>
                <th className="px-4 py-3 text-right">Shortage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {order.material_requirements?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    No Bill of Materials linked to this order.
                  </td>
                </tr>
              ) : (
                order.material_requirements?.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/20">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{req.component_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{req.component_code}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{req.quantity_per} {req.unit}</td>
                    <td className="px-4 py-3 text-right font-mono">{req.scrap_percentage}%</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">{req.required_quantity} {req.unit}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">{req.available_quantity} {req.unit}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      {req.shortage_quantity > 0 ? (
                        <span className="text-rose-400">+{req.shortage_quantity} {req.unit}</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manufacturing Operations Execution Board */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitFork className="w-5 h-5 text-cyan-400" />
              <span>Shop Floor Operations Sequence</span>
            </h3>
            <p className="text-xs text-slate-400">Work center sequence steps generated from Manufacturing Routing.</p>
          </div>
        </div>

        <div className="space-y-3">
          {order.operations?.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs border border-slate-800 rounded-xl">
              No routing operations configured for this order.
            </div>
          ) : (
            order.operations?.map((op) => (
              <div key={op.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                    {op.sequence}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{op.operation_name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>Work Center: <strong className="text-slate-200">{op.work_center?.name || 'Unassigned'}</strong></span>
                      <span>Machine: <strong className="text-slate-200">{op.machine?.name || 'Unassigned'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  <div className="text-xs text-right">
                    <div className="text-slate-400 font-mono">Status: <strong className="text-white">{op.status}</strong></div>
                  </div>

                  <div className="flex items-center gap-2">
                    {op.status !== 'IN_PROGRESS' && op.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleOperationStepStatus(op.id, 'IN_PROGRESS')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all"
                      >
                        Start Step
                      </button>
                    )}
                    {op.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleOperationStepStatus(op.id, 'COMPLETED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all"
                      >
                        Complete Step
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Finished Goods Output Posting Section */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-400" />
              <span>Finished Goods Output Posting</span>
            </h3>
            <p className="text-xs text-slate-400">Post completed manufactured items directly into Warehouse Inventory.</p>
          </div>

          <button
            onClick={() => setShowOutputModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Finished Output</span>
          </button>
        </div>

        {/* Output History List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Accepted Goods</th>
                <th className="px-4 py-3">Rejected Quantity</th>
                <th className="px-4 py-3">Target Warehouse</th>
                <th className="px-4 py-3">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {order.outputs?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    No output records posted yet.
                  </td>
                </tr>
              ) : (
                order.outputs?.map((out) => (
                  <tr key={out.id} className="hover:bg-slate-800/20">
                    <td className="px-4 py-3 text-slate-400">{new Date(out.produced_at).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">+{out.quantity} {order.product?.unit}</td>
                    <td className="px-4 py-3 font-mono text-rose-400">{out.rejected_quantity || 0} {order.product?.unit}</td>
                    <td className="px-4 py-3 text-white">{out.warehouse?.name}</td>
                    <td className="px-4 py-3 text-slate-400">{out.produced_by_profile?.full_name || 'Operator'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD MATERIAL CONSUMPTION MODAL */}
      {showConsumptionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-400" />
              <span>Record Material Consumption</span>
            </h3>

            <form onSubmit={handleRecordConsumption} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Select Component Material</label>
                <select
                  required
                  value={consumeProductId}
                  onChange={(e) => setConsumeProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Material...</option>
                  {order.material_requirements?.map((req) => (
                    <option key={req.component_id} value={req.component_id}>
                      {req.component_name} (Avail: {req.available_quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Source Warehouse</label>
                <select
                  required
                  value={consumeWarehouseId}
                  onChange={(e) => setConsumeWarehouseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>

              {locations.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Storage Location (Bin/Rack)</label>
                  <select
                    value={consumeLocationId}
                    onChange={(e) => setConsumeLocationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Default Location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.location_code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Consumption Quantity</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={consumeQty}
                  onChange={(e) => setConsumeQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Material lot number or notes..."
                  value={consumeNotes}
                  onChange={(e) => setConsumeNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConsumptionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-all shadow-md"
                >
                  {actionLoading ? 'Recording...' : 'Deduct Inventory Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD FINISHED GOODS OUTPUT MODAL */}
      {showOutputModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-400" />
              <span>Record Manufactured Output</span>
            </h3>

            <form onSubmit={handleRecordOutput} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Destination Warehouse</label>
                <select
                  required
                  value={outputWarehouseId}
                  onChange={(e) => setOutputWarehouseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Accepted Output Quantity</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={outputQty}
                  onChange={(e) => setOutputQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Rejected Quantity (Scrap)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rejectedQty}
                  onChange={(e) => setRejectedQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Batch number, inspector name..."
                  value={outputNotes}
                  onChange={(e) => setOutputNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOutputModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all shadow-md"
                >
                  {actionLoading ? 'Posting...' : 'Post Goods to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
