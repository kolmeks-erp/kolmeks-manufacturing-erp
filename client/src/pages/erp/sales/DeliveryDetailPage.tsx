import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  CheckCircle,
  Clock,
  Building2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { salesService } from '../../../services/sales.service';
import { DeliveryOrder } from '../../../types/sales';

export const DeliveryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [delivery, setDelivery] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await salesService.getDeliveryById(id);
      setDelivery(data);
    } catch (err) {
      console.error('Failed to load delivery detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading delivery order details...</div>;
  if (!delivery) return <div className="p-8 text-center text-slate-400">Delivery order not found.</div>;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div className="flex items-center space-x-4">
          <Link
            to={`${ERP_BASE_PATH}/sales/deliveries`}
            className="p-2 bg-slate-700/60 hover:bg-slate-600 text-white rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">{delivery.delivery_number}</h1>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase">
                {delivery.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Sales Order Ref: <span className="text-indigo-400 font-semibold">{delivery.sales_order_id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Line Items */}
        <div className="lg:col-span-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-lg font-semibold text-white">Dispatched Line Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Product ID</th>
                  <th className="px-4 py-3 text-right">Dispatched Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {delivery.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3 font-medium text-white">{item.product_id}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">{item.quantity} pcs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer & Carrier Details */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 shadow-lg space-y-6">
          <div>
            <h3 className="text-xs uppercase font-semibold text-slate-400 mb-2 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Customer Name</span>
            </h3>
            <p className="text-lg font-bold text-white">{delivery.customer_master?.company_name || 'N/A'}</p>
          </div>

          <div className="border-t border-slate-700/50 pt-4 space-y-3">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-400 flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Carrier Information</span>
              </p>
              <p className="text-slate-200 text-sm mt-0.5">{delivery.carrier || 'Standard Freight'}</p>
              <p className="text-xs text-indigo-400 font-mono mt-0.5">Tracking Ref: {delivery.tracking_reference || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs uppercase font-semibold text-slate-400 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Shipping Address</span>
              </p>
              <p className="text-slate-200 text-sm mt-0.5">{delivery.delivery_address || 'Customer Main Warehouse'}</p>
            </div>

            {delivery.proof_reference && (
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Proof of Delivery</p>
                <p className="text-emerald-400 text-xs font-mono mt-0.5">{delivery.proof_reference}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
