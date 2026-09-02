import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Printer,
  Send,
  Building2,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { salesService } from '../../../services/sales.service';
import { AdvancedQuotation } from '../../../types/sales';

export const AdvancedQuotationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<AdvancedQuotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await salesService.getQuotationById(id);
      setQuotation(data);
    } catch (err) {
      console.error('Failed to load quotation detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await salesService.updateQuotationStatus(id, status);
      fetchDetail();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
        Loading quotation details...
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-4">
        <p>Quotation record not found.</p>
        <Link to={`${ERP_BASE_PATH}/sales/quotations`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
          Return to Quotations List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-[#0F2647] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to={`${ERP_BASE_PATH}/sales/quotations`}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{quotation.quotation_number}</h1>
              <span className="px-3 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-bold uppercase">
                {quotation.status}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Issued on {quotation.quotation_date} • Valid until {quotation.valid_until || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Quotation</span>
          </button>

          {quotation.status === 'DRAFT' && (
            <button
              onClick={() => handleStatusChange('SUBMITTED')}
              disabled={actionLoading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Submit Commercial Quote</span>
            </button>
          )}

          {['SUBMITTED', 'UNDER_REVIEW'].includes(quotation.status) && (
            <button
              onClick={() => handleStatusChange('APPROVED')}
              disabled={actionLoading}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Quotation</span>
            </button>
          )}

          {['APPROVED', 'SENT'].includes(quotation.status) && (
            <button
              onClick={() => handleStatusChange('ACCEPTED')}
              disabled={actionLoading}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark as Customer Accepted</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quotation Line Items & Financial Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Quotation Line Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Discount</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {quotation.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{item.description}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">₹{Number(item.unit_price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">₹{Number(item.discount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                      ₹{Number(item.line_total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">₹{Number(quotation.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Discount:</span>
                <span className="font-bold text-red-600 dark:text-red-400 font-mono">- ₹{Number(quotation.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tax:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">₹{Number(quotation.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Amount:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">{quotation.currency} ₹{Number(quotation.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Commercial Terms Side Card */}
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Customer Information</span>
            </h3>
            <p className="text-base font-bold text-slate-900 dark:text-white">{quotation.customer_master?.company_name || 'N/A'}</p>
            {quotation.customer_master?.customer_code && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Code: {quotation.customer_master.customer_code}</p>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-xs">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Payment Terms</p>
              <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{quotation.payment_terms || 'Standard 30 Days'}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Delivery Terms</p>
              <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{quotation.delivery_terms || 'EXW Warehouse'}</p>
            </div>
            {quotation.notes && (
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Commercial Notes</p>
                <p className="text-slate-600 dark:text-slate-300 italic text-xs mt-0.5">{quotation.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
