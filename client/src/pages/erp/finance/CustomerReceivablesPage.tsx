import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Clock, AlertTriangle, FileText, CreditCard, BarChart2 } from 'lucide-react';
import { salesInvoiceService } from '../../../services/sales_invoice.service';
import { ReceivablesSummary } from '../../../types/sales_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { StatusBadge } from '../../../components/erp/StatusBadge';

export const CustomerReceivablesPage: React.FC = () => {
  const [data, setData] = useState<ReceivablesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceivables = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await salesInvoiceService.getReceivables();
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to fetch customer receivables summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivables();
  }, []);

  if (loading) return <LoadingState message="Loading Accounts Receivable summary..." />;
  if (error || !data) return <ErrorState message={error || 'Failed to load receivables.'} onRetry={fetchReceivables} />;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            Accounts Receivable Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time customer outstanding receivables, payment tracking, and collection management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`${ERP_BASE_PATH}/finance/receivables/aging`}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors"
          >
            <BarChart2 className="w-4 h-4" /> View Aging Report
          </Link>
          <Link
            to={`${ERP_BASE_PATH}/finance/payments/new`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
          >
            <CreditCard className="w-4 h-4" /> Record Payment
          </Link>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Outstanding A/R</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ₹{data.summary.total_outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Active unpaid balances</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Overdue Receivables</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            ₹{data.summary.total_overdue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Past due date</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Open Invoices Count</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-2">{data.summary.open_invoices_count}</p>
          <span className="text-xs text-slate-500 mt-1 block">Invoices pending full settlement</span>
        </div>
      </div>

      {/* OPEN RECEIVABLES TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Open Customer Invoices</h2>
          <span className="text-xs text-slate-500">{data.invoices.length} invoices listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Invoice Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {data.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                    <Link to={`${ERP_BASE_PATH}/sales/invoices/${inv.id}`}>{inv.invoice_number}</Link>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {inv.customer?.company_name}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{inv.invoice_date}</td>
                  <td className="py-3 px-4 text-rose-600 font-semibold">{inv.due_date}</td>
                  <td className="py-3 px-4 text-right">
                    ₹{inv.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-amber-600">
                    ₹{inv.outstanding_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-3 px-4 text-right flex justify-end gap-2">
                    <Link
                      to={`${ERP_BASE_PATH}/finance/receivables/customer/${inv.customer?.id}/statement`}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors"
                    >
                      Statement
                    </Link>
                    <Link
                      to={`${ERP_BASE_PATH}/finance/payments/new?customer_id=${inv.customer?.id}&invoice_id=${inv.id}`}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition-colors"
                    >
                      Pay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
