import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Eye, DollarSign, Calendar, Filter } from 'lucide-react';
import { salesInvoiceService } from '../../../services/sales_invoice.service';
import { CustomerPayment } from '../../../types/sales_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { EmptyState } from '../../../components/erp/EmptyState';

export const PaymentListPage: React.FC = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await salesInvoiceService.getPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to fetch customer payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalCollected = payments
    .filter((p) => p.status === 'POSTED')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-emerald-600" />
            Customer Payments Registry
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manual customer receipts, payment allocation tracking, and double-entry accounting integration
          </p>
        </div>

        <Link
          to={`${ERP_BASE_PATH}/finance/payments/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Record Customer Payment
        </Link>
      </div>

      {/* METRICS */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-slate-500">Total Posted Receipts</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      {loading ? (
        <LoadingState message="Loading customer payments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPayments} />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payment records found"
          description="There are no recorded customer payments in the ERP."
          actionLabel="Record Customer Payment"
          onAction={() => navigate(`${ERP_BASE_PATH}/finance/payments/new`)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-3.5 px-4">Payment #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Allocated</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-600">
                      <Link to={`${ERP_BASE_PATH}/finance/payments/${pay.id}`}>{pay.payment_number}</Link>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {pay.customer?.company_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{pay.payment_date}</td>
                    <td className="py-3 px-4 text-xs font-semibold uppercase text-slate-500">
                      {pay.payment_method}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">
                      {pay.reference_number || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{pay.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      ₹{pay.allocated_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={pay.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`${ERP_BASE_PATH}/finance/payments/${pay.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
