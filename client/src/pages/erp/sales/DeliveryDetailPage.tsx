import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  Building2,
  MapPin,
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

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">Loading delivery order details...</div>;
  if (!delivery) return <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">Delivery order not found.</div>;

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to={`${ERP_BASE_PATH}/sales/deliveries`}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{delivery.delivery_number}</h1>
              <span className="px-3 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-bold uppercase">
                {delivery.status}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Sales Order Ref: <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">{delivery.sales_order_id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Line Items */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Dispatched Line Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Product ID</th>
                  <th className="px-4 py-3 text-right">Dispatched Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {delivery.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white font-mono">{item.product_id}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">{item.quantity} pcs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer & Carrier Details */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Customer Name</span>
            </h3>
            <p className="text-base font-bold text-slate-900 dark:text-white">{delivery.customer_master?.company_name || 'N/A'}</p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center space-x-1 tracking-wider">
                <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Carrier Information</span>
              </p>
              <p className="text-slate-800 dark:text-slate-200 text-xs font-semibold mt-0.5">{delivery.carrier || 'Standard Freight'}</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold mt-0.5">Tracking Ref: {delivery.tracking_reference || 'N/A'}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center space-x-1 tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Shipping Address</span>
              </p>
              <p className="text-slate-800 dark:text-slate-200 text-xs font-semibold mt-0.5">{delivery.delivery_address || 'Customer Main Warehouse'}</p>
            </div>

            {delivery.proof_reference && (
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Proof of Delivery</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold mt-0.5">{delivery.proof_reference}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
