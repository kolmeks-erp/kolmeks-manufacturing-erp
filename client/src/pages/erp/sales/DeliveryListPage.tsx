import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Plus,
  CheckCircle,
  Clock,
  Eye,
  X,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { salesService } from '../../../services/sales.service';
import { DeliveryOrder } from '../../../types/sales';
import api from '../../../services/api';

export const DeliveryListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [selectedDeliveryId, setSelectedDeliveryId] = useState('');
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Create form state
  const [selectedSO, setSelectedSO] = useState('');
  const [selectedCust, setSelectedCust] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [carrier, setCarrier] = useState('DHL Express');
  const [trackingRef, setTrackingRef] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [creating, setCreating] = useState(false);

  // Dispatch/Confirm state
  const [proofRef, setProofRef] = useState('');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const data = await salesService.getDeliveries();
      setDeliveries(data || []);
    } catch (err) {
      console.error('Failed to load delivery orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [soRes, custRes] = await Promise.all([
        api.get('/sales-orders?limit=50'),
        api.get('/customers?limit=50'),
      ]);
      setSalesOrders(soRes.data.data || []);
      setCustomers(custRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dependencies:', err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleOpenCreateModal = () => {
    fetchDependencies();
    setShowCreateModal(true);
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSO || !selectedCust) return;
    setCreating(true);
    try {
      await salesService.createDelivery({
        sales_order_id: selectedSO,
        customer_id: selectedCust,
        delivery_address: deliveryAddress,
        carrier,
        tracking_reference: trackingRef,
        expected_delivery_date: expectedDate || undefined,
      });
      setShowCreateModal(false);
      fetchDeliveries();
    } catch (err) {
      console.error('Failed to create delivery:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliveryId) return;
    setActionLoading(true);
    try {
      await salesService.dispatchDelivery(selectedDeliveryId, carrier, trackingRef);
      setShowDispatchModal(false);
      fetchDeliveries();
    } catch (err) {
      console.error('Failed to dispatch delivery:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliveryId) return;
    setActionLoading(true);
    try {
      await salesService.confirmDelivery(selectedDeliveryId, proofRef, notes);
      setShowConfirmModal(false);
      fetchDeliveries();
    } catch (err) {
      console.error('Failed to confirm delivery:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const norm = (status || '').toUpperCase();
    if (norm === 'DELIVERED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1 w-fit">
          <CheckCircle className="w-3 h-3" />
          <span>DELIVERED</span>
        </span>
      );
    }
    if (norm === 'DISPATCHED' || norm === 'IN_TRANSIT') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center space-x-1 w-fit">
          <Truck className="w-3 h-3" />
          <span>{norm}</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center space-x-1 w-fit">
        <Clock className="w-3 h-3" />
        <span>{norm}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Delivery Orders & Shipment Tracking
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Dispatch shipments, record carrier tracking numbers, log estimated arrival times, and confirm delivery completion.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-2 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Delivery Order</span>
        </button>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Delivery No.</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Carrier & Tracking</th>
                <th className="px-6 py-4">Dispatch Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    Loading delivery orders...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                    No delivery orders created yet.
                  </td>
                </tr>
              ) : (
                deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400 font-mono">
                      <Link to={`${ERP_BASE_PATH}/sales/deliveries/${d.id}`} className="hover:underline">
                        {d.delivery_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{d.customer_master?.company_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      <div className="font-semibold">{d.carrier || 'Unassigned Carrier'}</div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">{d.tracking_reference || 'No Tracking Ref'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">
                      {d.dispatch_date ? new Date(d.dispatch_date).toLocaleDateString() : 'Pending'}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(d.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {d.status === 'READY' && (
                          <button
                            onClick={() => {
                              setSelectedDeliveryId(d.id);
                              setShowDispatchModal(true);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                          >
                            Dispatch
                          </button>
                        )}
                        {d.status === 'DISPATCHED' && (
                          <button
                            onClick={() => {
                              setSelectedDeliveryId(d.id);
                              setShowConfirmModal(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                          >
                            Confirm Delivered
                          </button>
                        )}
                        <Link
                          to={`${ERP_BASE_PATH}/sales/deliveries/${d.id}`}
                          className="p-2 bg-slate-100 hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-600 dark:text-slate-300 hover:text-white rounded-lg transition shadow-xs"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Delivery Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Delivery Order</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDelivery} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Sales Order *</label>
                <select
                  required
                  value={selectedSO}
                  onChange={(e) => setSelectedSO(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Sales Order --</option>
                  {salesOrders.map((so) => (
                    <option key={so.id} value={so.id}>
                      {so.order_number} ({so.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Customer *</label>
                <select
                  required
                  value={selectedCust}
                  onChange={(e) => setSelectedCust(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Carrier & Tracking</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Carrier (e.g. DHL)"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Tracking Ref No."
                    value={trackingRef}
                    onChange={(e) => setTrackingRef(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Shipping Destination Address</label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street, City, Country..."
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  {creating ? 'Creating...' : 'Create Delivery Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dispatch Shipment</h3>
            <form onSubmit={handleDispatch} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Carrier Name</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingRef}
                  onChange={(e) => setTrackingRef(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delivery Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Customer Delivery</h3>
            <form onSubmit={handleConfirmDelivery} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">Proof of Delivery / Receiver Name</label>
                <input
                  type="text"
                  placeholder="Signed POD #, Receiver signature..."
                  value={proofRef}
                  onChange={(e) => setProofRef(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Mark DELIVERED
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
