import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Package, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Wrench,
  ShieldCheck,
  Plus
} from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import ConfirmDialog from '../../../components/erp/ConfirmDialog';
import { maintenanceService } from '../../../services/maintenance.service';
import { ProductService } from '../../../services/product.service';
import { warehouseService } from '../../../services/warehouse.service';
import { WorkOrder, WorkOrderChecklist, SparePartUsed } from '../../../types/maintenance';
import { Product } from '../../../types/product';
import { Warehouse } from '../../../types/inventory';

const WorkOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);

  // Modal States
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showAddPartModal, setShowAddPartModal] = useState(false);

  // Complete WO Form
  const [completeForm, setCompleteForm] = useState({
    root_cause: '',
    resolution: '',
    notes: ''
  });

  // Spare Parts Form & Dropdowns
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [partForm, setPartForm] = useState({
    product_id: '',
    warehouse_id: '',
    quantity: 1,
    notes: ''
  });
  const [partSubmitting, setPartSubmitting] = useState(false);
  const [partError, setPartError] = useState<string | null>(null);

  const fetchWorkOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await maintenanceService.getWorkOrderById(id);
      setWorkOrder(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load work order details');
    } finally {
      setLoading(false);
    }
  };

  const loadPartDropdowns = async () => {
    try {
      const [pList, wList] = await Promise.all([
        ProductService.getProducts({ limit: 100 }),
        warehouseService.getWarehouses()
      ]);
      setProducts(pList.data || []);
      setWarehouses(wList?.data || []);
    } catch (err) {
      console.error('Failed to load part dropdowns', err);
    }
  };

  useEffect(() => {
    fetchWorkOrder();
    loadPartDropdowns();
  }, [id]);

  const handleStartWorkOrder = async () => {
    if (!id) return;
    try {
      setError(null);
      await maintenanceService.startWorkOrder(id);
      setActionSuccess('Work Order started. Technician in-progress & asset placed in maintenance mode.');
      setShowStartConfirm(false);
      fetchWorkOrder();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start work order');
    }
  };

  const handleToggleChecklist = async (chk: WorkOrderChecklist) => {
    try {
      await maintenanceService.updateChecklistItem(chk.id, {
        completed: !chk.completed
      });
      fetchWorkOrder();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update checklist item');
    }
  };

  const handleAddPartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !partForm.product_id || !partForm.warehouse_id || partForm.quantity <= 0) {
      setPartError('Product, Warehouse, and positive Quantity are required.');
      return;
    }

    try {
      setPartSubmitting(true);
      setPartError(null);
      await maintenanceService.addWorkOrderPart(id, partForm);
      setActionSuccess(`Consumed ${partForm.quantity} spare parts from inventory.`);
      setShowAddPartModal(false);
      setPartForm({ product_id: '', warehouse_id: '', quantity: 1, notes: '' });
      fetchWorkOrder();
    } catch (err: any) {
      setPartError(err.response?.data?.message || 'Failed to deduct spare part from inventory.');
    } finally {
      setPartSubmitting(false);
    }
  };

  const handleCompleteWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setError(null);
      await maintenanceService.completeWorkOrder(id, completeForm);
      setActionSuccess('Work Order completed successfully. Asset returned to Available status.');
      setShowCompleteModal(false);
      fetchWorkOrder();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete work order.');
    }
  };

  if (loading) return <LoadingState message="Loading work order execution workspace..." />;
  if (error || !workOrder) return <ErrorState message={error || 'Work Order not found'} onRetry={fetchWorkOrder} />;

  const isCompleted = workOrder.status === 'COMPLETED';
  const isInProgress = workOrder.status === 'IN_PROGRESS';
  const isOpen = workOrder.status === 'OPEN' || workOrder.status === 'ASSIGNED';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/secure-kolmeks-x0y0/maintenance/work-orders"
          className="p-2 text-slate-600 hover:text-slate-900 bg-white rounded-lg border border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <ERPPageHeader
          title={`${workOrder.work_order_number}: ${workOrder.title}`}
          subtitle={`Asset: ${workOrder.assets?.name || 'N/A'} (${workOrder.assets?.asset_code || ''}) | Assigned: ${
            workOrder.assigned_profile ? `${workOrder.assigned_profile.first_name || ''} ${workOrder.assigned_profile.last_name || ''}` : 'Unassigned'
          }`}
          actions={
            <div className="flex gap-2">
              {isOpen && (
                <button
                  onClick={() => setShowStartConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current" /> Start Maintenance
                </button>
              )}

              {isInProgress && (
                <>
                  <button
                    onClick={() => setShowAddPartModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
                  >
                    <Package className="w-4 h-4" /> Consume Spare Part
                  </button>
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete Work Order
                  </button>
                </>
              )}
            </div>
          }
        />
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" /> {actionSuccess}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Work Order Status</span>
          <div className="mt-1">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              workOrder.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              workOrder.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {workOrder.status}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Priority & Type</span>
          <p className="font-semibold text-slate-900 mt-1">{workOrder.priority} — {workOrder.maintenance_type}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Actual Start</span>
          <p className="font-semibold text-slate-900 mt-1">
            {workOrder.actual_start ? new Date(workOrder.actual_start).toLocaleString() : 'Not Started'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Recorded Downtime</span>
          <p className="font-semibold text-indigo-600 mt-1 font-mono">{workOrder.downtime_minutes || 0} Minutes</p>
        </div>
      </div>

      {/* Main Execution Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checklist Verification */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" /> Maintenance Execution Checklist
            </h3>
            <span className="text-xs text-slate-500 font-medium">Click checkbox to complete item</span>
          </div>

          <div className="space-y-3">
            {workOrder.checklists && workOrder.checklists.length > 0 ? (
              workOrder.checklists.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !isCompleted && handleToggleChecklist(item)}
                  className={`p-3.5 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                    item.completed ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}} // Handled by parent div
                    disabled={isCompleted}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold ${item.completed ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                        {item.title}
                      </p>
                      {item.required && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                          REQUIRED
                        </span>
                      )}
                    </div>
                    {item.completed_at && (
                      <p className="text-xs text-emerald-700 mt-1">
                        Verified at {new Date(item.completed_at).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">No checklist items defined.</p>
            )}
          </div>
        </div>

        {/* Spare Parts Consumed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" /> Spare Parts Used
            </h3>
            {isInProgress && (
              <button
                onClick={() => setShowAddPartModal(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Part
              </button>
            )}
          </div>

          {workOrder.parts && workOrder.parts.length > 0 ? (
            <div className="space-y-3">
              {workOrder.parts.map((p) => (
                <div key={p.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{p.products?.name || 'Spare Part'}</span>
                    <span className="font-mono font-bold text-indigo-600">{p.quantity} Units</span>
                  </div>
                  <p className="text-slate-500">Warehouse: {p.warehouses?.name || 'Main Stock'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center">No spare parts recorded for this WO.</p>
          )}
        </div>
      </div>

      {/* Confirm Start Dialog */}
      <ConfirmDialog
        isOpen={showStartConfirm}
        title="Start Maintenance Work Order"
        message={`Start work on ${workOrder.work_order_number}? This will change the asset status to UNDER_MAINTENANCE and begin tracking repair downtime.`}
        confirmText="Start Maintenance"
        cancelText="Cancel"
        onConfirm={handleStartWorkOrder}
        onCancel={() => setShowStartConfirm(false)}
      />

      {/* Complete WO Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Complete Maintenance Work Order</h3>
            <p className="text-xs text-slate-500">Document the resolution, root cause, and finalize downtime calculation.</p>

            <form onSubmit={handleCompleteWorkOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Root Cause (Where Known)</label>
                <input
                  type="text"
                  placeholder="e.g. Seal wear, coolant filter blockage, vibration failure..."
                  value={completeForm.root_cause}
                  onChange={(e) => setCompleteForm({ ...completeForm, root_cause: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Resolution Summary *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Replaced worn coolant pump impeller, recalibrated spindle & cleared fault alarms."
                  value={completeForm.resolution}
                  onChange={(e) => setCompleteForm({ ...completeForm, resolution: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm"
                >
                  Finalize Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Spare Part Modal */}
      {showAddPartModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Consume Spare Part from Inventory</h3>
            <p className="text-xs text-slate-500">Inventory will be automatically deducted and logged under MAINTENANCE_CONSUMPTION.</p>

            {partError && <ErrorState message={partError} />}

            <form onSubmit={handleAddPartSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Spare Part Product *</label>
                <select
                  required
                  value={partForm.product_id}
                  onChange={(e) => setPartForm({ ...partForm, product_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Spare Part Product...</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>{prod.product_code} - {prod.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Issue Warehouse *</label>
                <select
                  required
                  value={partForm.warehouse_id}
                  onChange={(e) => setPartForm({ ...partForm, warehouse_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Issue Warehouse...</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Quantity to Consume *</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={partForm.quantity}
                  onChange={(e) => setPartForm({ ...partForm, quantity: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPartModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={partSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-60"
                >
                  {partSubmitting ? 'Deducting Stock...' : 'Record Stock Consumption'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderDetailPage;
