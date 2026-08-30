import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, CreditCard } from 'lucide-react';
import { purchaseInvoiceService } from '../../../services/purchase_invoice.service';
import { SupplierPayment } from '../../../types/purchase_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { EmptyState } from '../../../components/erp/EmptyState';

export const SupplierPaymentListPage: React.FC = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseInvoiceService.getPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to fetch supplier payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.payment_number.toLowerCase().includes(term) ||
      (p.supplier?.supplier_name || '').toLowerCase().includes(term) ||
      (p.reference_number || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-indigo-600" />
            Supplier Payments Registry
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            History of all outgoing cash & bank disbursements to suppliers with invoice allocation status
          </p>
        </div>

        <Link
          to={`${ERP_BASE_PATH}/finance/supplier-payments/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Record Supplier Payment
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search payment number or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading supplier payment records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPayments} />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          title="No supplier payments recorded"
          description="There are no supplier payment records matching your search."
          actionLabel="Record Supplier Payment"
          onAction={() => navigate(`${ERP_BASE_PATH}/finance/supplier-payments/new`)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-3.5 px-4">Payment #</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Reference #</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Allocated</th>
                  <th className="py-3.5 px-4 text-right">Unallocated</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                      <Link to={`${ERP_BASE_PATH}/finance/supplier-payments/${pay.id}`}>{pay.payment_number}</Link>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{pay.supplier?.supplier_name || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-600">{pay.payment_date}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{pay.payment_method}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{pay.reference_number || '-'}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{pay.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      ₹{pay.allocated_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-amber-600">
                      ₹{pay.unallocated_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={pay.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`${ERP_BASE_PATH}/finance/supplier-payments/${pay.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md transition-colors"
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
