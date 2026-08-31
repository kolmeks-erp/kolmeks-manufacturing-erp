import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, FileText, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { purchaseInvoiceService } from '../../../services/purchase_invoice.service';
import { PurchaseInvoice, PurchaseInvoiceStatus, MatchStatus } from '../../../types/purchase_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { EmptyState } from '../../../components/erp/EmptyState';

export const PurchaseInvoiceListPage: React.FC = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [matchFilter, setMatchFilter] = useState<string>('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseInvoiceService.getInvoices({
        search: search || undefined,
        status: statusFilter || undefined,
        match_status: matchFilter || undefined,
      });
      setInvoices(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to fetch purchase invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, matchFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  const getMatchBadge = (match: MatchStatus) => {
    switch (match) {
      case 'MATCHED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">3-Way Matched</span>;
      case 'QUANTITY_VARIANCE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">Qty Variance</span>;
      case 'PRICE_VARIANCE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-100 dark:bg-orange-500/10 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">Price Variance</span>;
      case 'BOTH_VARIANCE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">Qty & Price Variance</span>;
      case 'APPROVED_EXCEPTION':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">Approved Exception</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{match}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Purchase Invoices Registry
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Record supplier bills, perform 3-way matching against GRNs, and post accounts payable
          </p>
        </div>

        <Link
          to={`${ERP_BASE_PATH}/purchases/invoices/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Record Supplier Invoice
        </Link>
      </div>

      {/* TOOLBAR / FILTERS */}
      <div className="bg-white dark:bg-[#0F2647] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="POSTED">Posted</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="VOIDED">Voided</option>
          </select>

          <select
            value={matchFilter}
            onChange={(e) => setMatchFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Match Statuses</option>
            <option value="MATCHED">Matched</option>
            <option value="QUANTITY_VARIANCE">Quantity Variance</option>
            <option value="PRICE_VARIANCE">Price Variance</option>
            <option value="BOTH_VARIANCE">Both Variances</option>
            <option value="APPROVED_EXCEPTION">Approved Exception</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <LoadingState message="Loading supplier purchase invoices..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchInvoices} />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No purchase invoices found"
          description="There are no supplier invoices recorded in the system matching your criteria."
          actionLabel="Record Supplier Invoice"
          onAction={() => navigate(`${ERP_BASE_PATH}/purchases/invoices/new`)}
        />
      ) : (
        <div className="bg-white dark:bg-[#0F2647] rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3.5 px-4">Internal PINV #</th>
                  <th className="py-3.5 px-4">Supplier Bill #</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Invoice Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-center">3-Way Match</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-right">Outstanding</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm text-slate-800 dark:text-slate-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      <Link to={`${ERP_BASE_PATH}/purchases/invoices/${inv.id}`}>
                        {inv.internal_invoice_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{inv.supplier_invoice_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {inv.supplier?.supplier_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{inv.invoice_date}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{inv.due_date}</td>
                    <td className="py-3 px-4 text-center">{getMatchBadge(inv.match_status)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                      ₹{inv.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                      ₹{inv.outstanding_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`${ERP_BASE_PATH}/purchases/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 px-2.5 py-1.5 rounded-md transition-colors"
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
