import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { salesInvoiceService } from '../../../services/sales_invoice.service';
import { customerService } from '../../../services/customer.service';
import { SalesInvoice, InvoiceStatus } from '../../../types/sales_invoice';
import { Customer } from '../../../types/customer';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { EmptyState } from '../../../components/erp/EmptyState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { LoadingState } from '../../../components/erp/LoadingState';

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('ALL');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedCustomer !== 'ALL') params.customer_id = selectedCustomer;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const [invData, custData] = await Promise.all([
        salesInvoiceService.getInvoices(params),
        customerService.getCustomers({ status: 'active' }),
      ]);

      setInvoices(invData);
      setCustomers(custData);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load sales invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [selectedStatus, selectedCustomer]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  // Metrics
  const totalInvoiced = invoices.reduce((acc, i) => acc + (i.total_amount || 0), 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + (i.outstanding_amount || 0), 0);
  const overdueCount = invoices.filter((i) => i.status === 'OVERDUE').length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            Sales Invoicing Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate, issue, and manage commercial sales invoices linked to customers & sales orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`${ERP_BASE_PATH}/sales/invoices/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create Sales Invoice
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Invoiced</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ₹{totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Across listed invoices</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Outstanding</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Receivable balance</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Overdue Invoices</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">{overdueCount}</p>
          <span className="text-xs text-slate-500 mt-1 block">Requires payment collection</span>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by invoice # or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="VOIDED">Voided</option>
            </select>

            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white max-w-[200px]"
            >
              <option value="ALL">All Customers</option>
              {customers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.company_name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* INVOICE TABLE */}
      {loading ? (
        <LoadingState message="Loading sales invoices..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchInvoices} />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No sales invoices found"
          description="There are no invoices matching your filter criteria."
          actionLabel="Create Sales Invoice"
          onAction={() => navigate(`${ERP_BASE_PATH}/sales/invoices/new`)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">SO Ref</th>
                  <th className="py-3.5 px-4">Invoice Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-right">Outstanding</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                      <Link to={`${ERP_BASE_PATH}/sales/invoices/${inv.id}`}>{inv.invoice_number}</Link>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {inv.customer?.company_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      {inv.sales_order?.order_number || 'Direct'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{inv.invoice_date}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.due_date}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      ₹{inv.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-600">
                      ₹{inv.outstanding_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`${ERP_BASE_PATH}/sales/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
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
