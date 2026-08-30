import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DollarSign, Clock, FileCheck, Plus, Search, Eye, AlertTriangle, ShieldAlert } from 'lucide-react';
import { purchaseInvoiceService } from '../../../services/purchase_invoice.service';
import { PayablesSummary, PurchaseInvoice } from '../../../types/purchase_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { EmptyState } from '../../../components/erp/EmptyState';

export const SupplierPayablesPage: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<PayablesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchPayables = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await purchaseInvoiceService.getPayables();
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to fetch accounts payable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayables();
  }, []);

  if (loading) return <LoadingState message="Loading Accounts Payable dashboard..." />;
  if (error || !data) return <ErrorState message={error || 'Failed to load payables.'} onRetry={fetchPayables} />;

  const filteredInvoices = (data.invoices || []).filter((inv) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      inv.internal_invoice_number.toLowerCase().includes(term) ||
      inv.supplier_invoice_number.toLowerCase().includes(term) ||
      (inv.supplier?.supplier_name || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-indigo-600" />
            Accounts Payable Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track total outstanding liabilities, overdue supplier bills, and record outgoing disbursements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`${ERP_BASE_PATH}/finance/payables/aging`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            <Clock className="w-4 h-4 text-slate-500" /> Payable Aging Report
          </Link>

          <Link
            to={`${ERP_BASE_PATH}/finance/supplier-payments/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Record Supplier Payment
          </Link>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Payable</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            ₹{data.summary.total_payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Outstanding supplier liabilities</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Overdue</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">
            ₹{data.summary.total_overdue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-rose-500 mt-1 font-medium">Past due payment terms</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Bills Count</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{data.summary.open_invoices_count}</div>
          <p className="text-xs text-slate-500 mt-1">Pending full settlement</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Variance Review</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{data.summary.pending_approval_count}</div>
          <p className="text-xs text-amber-600 mt-1 font-medium">Requires manager approval</p>
        </div>
      </div>

      {/* FILTER & TABLE */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search open payables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <EmptyState
          title="No open payables"
          description="There are currently no outstanding supplier purchase invoices requiring payment."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-3.5 px-4">PINV #</th>
                  <th className="py-3.5 px-4">Supplier Bill #</th>
                  <th className="py-3.5 px-4">Supplier Name</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Total Bill</th>
                  <th className="py-3.5 px-4 text-right">Paid Amount</th>
                  <th className="py-3.5 px-4 text-right">Outstanding</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                      <Link to={`${ERP_BASE_PATH}/purchases/invoices/${inv.id}`}>{inv.internal_invoice_number}</Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{inv.supplier_invoice_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <Link
                        to={`${ERP_BASE_PATH}/finance/payables/supplier/${inv.supplier_id}/statement`}
                        className="hover:underline text-indigo-600"
                      >
                        {inv.supplier?.supplier_name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium text-rose-600">{inv.due_date}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      ₹{inv.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      ₹{inv.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{inv.outstanding_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`${ERP_BASE_PATH}/finance/supplier-payments/new?supplier_id=${inv.supplier_id}&invoice_id=${inv.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md transition-colors"
                      >
                        Pay Bill
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
