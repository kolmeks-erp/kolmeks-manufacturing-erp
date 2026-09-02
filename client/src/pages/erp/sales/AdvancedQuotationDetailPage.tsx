import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle,
  Clock,
  Printer,
  FileCheck,
  Send,
  Building2,
  DollarSign,
  AlertCircle,
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
      <div className="p-8 text-center text-slate-400">
        Loading quotation details...
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-4">
        <p>Quotation record not found.</p>
        <Link to={`${ERP_BASE_PATH}/sales/quotations`} className="text-blue-400 hover:underline">
          Return to Quotations List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div className="flex items-center space-x-4">
          <Link
            to={`${ERP_BASE_PATH}/sales/quotations`}
            className="p-2 bg-slate-700/60 hover:bg-slate-600 text-white rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">{quotation.quotation_number}</h1>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-semibold uppercase">
                {quotation.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Issued on {quotation.quotation_date} • Valid until {quotation.valid_until || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Quotation</span>
          </button>

          {quotation.status === 'DRAFT' && (
            <button
              onClick={() => handleStatusChange('SUBMITTED')}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Commercial Quote</span>
            </button>
          )}

          {['SUBMITTED', 'UNDER_REVIEW'].includes(quotation.status) && (
            <button
              onClick={() => handleStatusChange('APPROVED')}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Quotation</span>
            </button>
          )}

          {['APPROVED', 'SENT'].includes(quotation.status) && (
            <button
              onClick={() => handleStatusChange('ACCEPTED')}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition flex items-center space-x-2"
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
        <div className="lg:col-span-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 shadow-lg space-y-6">
          <h2 className="text-lg font-semibold text-white">Quotation Line Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Discount</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {quotation.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">{item.description}</td>
                    <td className="px-4 py-3 text-right">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-right">€{Number(item.unit_price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">€{Number(item.discount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-white">
                      €{Number(item.line_total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-700/50">
            <div className="w-full sm:w-72 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-white">€{Number(quotation.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Discount:</span>
                <span className="font-semibold text-red-400">- €{Number(quotation.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax:</span>
                <span className="font-semibold text-white">€{Number(quotation.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-700">
                <span>Total Amount:</span>
                <span className="text-emerald-400">{quotation.currency} €{Number(quotation.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Commercial Terms Side Card */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 shadow-lg space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Customer Information</span>
            </h3>
            <p className="text-lg font-bold text-white">{quotation.customer_master?.company_name || 'N/A'}</p>
            {quotation.customer_master?.customer_code && (
              <p className="text-xs text-slate-400 mt-0.5">Code: {quotation.customer_master.customer_code}</p>
            )}
          </div>

          <div className="border-t border-slate-700/50 pt-4 space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Payment Terms</p>
              <p className="text-slate-200 mt-0.5">{quotation.payment_terms || 'Standard 30 Days'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Delivery Terms</p>
              <p className="text-slate-200 mt-0.5">{quotation.delivery_terms || 'EXW Warehouse'}</p>
            </div>
            {quotation.notes && (
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Commercial Notes</p>
                <p className="text-slate-300 italic text-xs mt-0.5">{quotation.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
