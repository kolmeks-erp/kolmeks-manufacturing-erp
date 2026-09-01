import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, RefreshCw, AlertTriangle, CheckCircle2, ArrowDownRight, Layers 
} from 'lucide-react';
import { ERPLayout } from '../../../layouts/ERPLayout';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/common/DataTable';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import EmptyState from '../../../components/erp/EmptyState';
import { maintenanceService } from '../../../services/maintenance.service';
import { apiClient } from '../../../services/api';

const SparePartsPage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [selectedWOId, setSelectedWOId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const fetchSparePartLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await maintenanceService.getWorkOrders({ limit: 100 });
      setWorkOrders(res.data || []);
    } catch (err: any) {
      console.error('Failed to load spare parts log:', err);
      setError(err.message || 'Unable to fetch spare parts consumption records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSparePartLogs();
  }, []);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const prodRes = await apiClient.get('/products');
        setProducts(prodRes.data?.data || []);
        const whRes = await apiClient.get('/warehouses');
        setWarehouses(whRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load products/warehouses for spare parts form:', err);
      }
    };
    loadDropdowns();
  }, []);

  const handleIssueSparePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWOId || !productId || !warehouseId || quantity <= 0) {
      alert('Please fill out all required fields with a positive quantity.');
      return;
    }

    try {
      await maintenanceService.addWorkOrderPart(selectedWOId, {
        product_id: productId,
        warehouse_id: warehouseId,
        quantity,
        notes: notes || undefined
      });
      setIsModalOpen(false);
      setQuantity(1);
      setNotes('');
      fetchSparePartLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to issue spare part. Check warehouse stock availability.');
    }
  };

  const columns = [
    {
      header: 'Work Order #',
      accessor: (row: any) => (
        <span className="font-semibold text-slate-900 font-mono text-sm">{row.work_order_number}</span>
      )
    },
    {
      header: 'Title / Equipment',
      accessor: (row: any) => (
        <div>
          <div className="font-medium text-slate-900">{row.title}</div>
          <div className="text-xs text-slate-500">{row.assets?.name || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Assigned Technician',
      accessor: (row: any) => (
        <span className="text-slate-700 text-xs font-medium">
          {row.assigned_profile?.full_name || row.assigned_profile?.email || 'Unassigned'}
        </span>
      )
    },
    {
      header: 'Parts Consumed',
      accessor: (row: any) => (
        <span className="font-mono text-xs font-semibold text-slate-800">
          {row.parts?.length || 0} Parts Issued
        </span>
      )
    },
    {
      header: 'WO Status',
      accessor: (row: any) => (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {row.status}
        </span>
      )
    }
  ];

  return (
    <ERPLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <ERPPageHeader
          title="Maintenance Spare Parts & Inventory Issue"
          subtitle="Issue spare parts directly from plant warehouses for work order repairs with strict stock validation."
          icon={Package}
          actions={
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Issue Spare Part to WO
            </button>
          }
        />

        {loading ? (
          <LoadingState message="Loading work order spare parts consumption..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchSparePartLogs} />
        ) : workOrders.length === 0 ? (
          <EmptyState
            title="No Spare Parts Consumption Logged"
            description="No spare parts have been requested or issued for maintenance work orders."
            actionText="Issue Spare Part"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <DataTable
            data={workOrders}
            columns={columns}
          />
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" /> Issue Spare Part to Work Order
              </h3>

              <form onSubmit={handleIssueSparePart} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Work Order *</label>
                  <select
                    value={selectedWOId}
                    onChange={(e) => setSelectedWOId(e.target.value)}
                    required
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Work Order</option>
                    {workOrders.map(w => (
                      <option key={w.id} value={w.id}>{w.work_order_number} — {w.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Spare Part / Product *</label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select Spare Part Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.product_code || p.code})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Source Warehouse *</label>
                    <select
                      value={warehouseId}
                      onChange={(e) => setWarehouseId(e.target.value)}
                      required
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Quantity *</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                      required
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Replaced worn bearing assembly"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Issue Spare Part
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ERPLayout>
  );
};

export default SparePartsPage;
