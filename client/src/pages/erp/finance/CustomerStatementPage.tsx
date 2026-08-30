import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Printer, Calendar, Search } from 'lucide-react';
import { salesInvoiceService } from '../../../services/sales_invoice.service';
import { customerService } from '../../../services/customer.service';
import { CustomerStatementData } from '../../../types/sales_invoice';
import { Customer } from '../../../types/customer';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';

export const CustomerStatementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(id || '');
  const [statementData, setStatementData] = useState<CustomerStatementData | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    customerService.getCustomers({ status: 'active' }).then(setCustomers).catch(console.error);
  }, []);

  const fetchStatement = async (cust: string) => {
    if (!cust) return;
    try {
      setLoading(true);
      setError(null);
      const res = await salesInvoiceService.getCustomerStatement(cust, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setStatementData(res);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to generate customer statement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      fetchStatement(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomerId) fetchStatement(selectedCustomerId);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Receivables
          </button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            Customer Account Statement
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Chronological ledger statement showing invoices, payments, debits, credits, and running balance
          </p>
        </div>

        {statementData && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Statement
          </button>
        )}
      </div>

      {/* FILTER CONTROLS */}
      <form onSubmit={handleFilter} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Select Customer
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Choose Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name} ({c.customer_code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedCustomerId || loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          Generate Statement
        </button>
      </form>

      {/* STATEMENT DOCUMENT */}
      {loading ? (
        <LoadingState message="Generating customer statement..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchStatement(selectedCustomerId)} />
      ) : !statementData ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
          Please select a customer above to view their statement.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* HEADER INFORMATION */}
          <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold">KOLMEKS MANUFACTURING</h2>
              <p className="text-xs text-slate-400 mt-0.5">High-Precision CNC Machining & Motor Components</p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase block">Statement For</span>
              <p className="text-lg font-bold text-emerald-400">{statementData.customer.company_name}</p>
              <p className="text-xs text-slate-400">Code: {statementData.customer.customer_code}</p>
            </div>
          </div>

          {/* LEDGER TABLE */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 font-semibold text-slate-600 uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                    <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                    <th className="py-2.5 px-3 text-right font-bold">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {statementData.statement.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                        No financial transactions recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    statementData.statement.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3">{tx.date}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-500">{tx.type}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-600">{tx.reference}</td>
                        <td className="py-2.5 px-3 text-slate-600">{tx.description}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                          {tx.debit > 0 ? `₹${tx.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-emerald-600">
                          {tx.credit > 0 ? `₹${tx.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          ₹{tx.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CLOSING BALANCE SUMMARY */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
            <div className="w-80 flex justify-between items-center text-base font-bold text-slate-900">
              <span>Closing Outstanding Balance:</span>
              <span className="text-amber-600 text-xl font-bold">
                ₹{statementData.closing_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
