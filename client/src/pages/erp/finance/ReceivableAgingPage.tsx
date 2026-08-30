import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Calendar, AlertCircle, ArrowLeft, Printer } from 'lucide-react';
import { salesInvoiceService } from '../../../services/sales_invoice.service';
import { ReceivableAgingReport } from '../../../types/sales_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';

export const ReceivableAgingPage: React.FC = () => {
  const [data, setData] = useState<ReceivableAgingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAging = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await salesInvoiceService.getReceivableAging();
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to calculate receivable aging report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAging();
  }, []);

  if (loading) return <LoadingState message="Calculating accounts receivable aging buckets..." />;
  if (error || !data) return <ErrorState message={error || 'Failed to load aging report.'} onRetry={fetchAging} />;

  const { summary, by_customer } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-7 h-7 text-indigo-600" />
            Accounts Receivable Aging Analysis
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Categorized outstanding balances by overdue duration: Current, 1-30, 31-60, 61-90, and 90+ days
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Aging Report
        </button>
      </div>

      {/* SUMMARY BUCKETS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase block">Current</span>
          <p className="text-lg font-bold text-slate-900 mt-1">
            ₹{summary.current.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-400">Not due yet</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase block">1 - 30 Days</span>
          <p className="text-lg font-bold text-amber-600 mt-1">
            ₹{summary.days_1_30.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-400">Slightly overdue</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-orange-600 uppercase block">31 - 60 Days</span>
          <p className="text-lg font-bold text-orange-600 mt-1">
            ₹{summary.days_31_60.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-400">Follow-up required</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 uppercase block">61 - 90 Days</span>
          <p className="text-lg font-bold text-rose-600 mt-1">
            ₹{summary.days_61_90.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-400">Urgent collection</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-purple-600 uppercase block">90+ Days</span>
          <p className="text-lg font-bold text-purple-700 mt-1">
            ₹{summary.days_90_plus.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-400">High risk</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl text-white shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase block">Total Outstanding</span>
          <p className="text-lg font-bold text-emerald-400 mt-1">
            ₹{summary.total.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-400">Combined total</span>
        </div>
      </div>

      {/* DETAILED AGING TABLE BY CUSTOMER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Customer Wise Aging Breakdown</h2>
          <span className="text-xs text-slate-500">{by_customer.length} customers with open balances</span>
        </div>

        {by_customer.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No active outstanding receivables. All customer invoices are settled.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 font-semibold text-slate-600 uppercase border-b border-slate-200">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4 text-right">Current</th>
                  <th className="py-3 px-4 text-right">1-30 Days</th>
                  <th className="py-3 px-4 text-right">31-60 Days</th>
                  <th className="py-3 px-4 text-right">61-90 Days</th>
                  <th className="py-3 px-4 text-right">90+ Days</th>
                  <th className="py-3 px-4 text-right font-bold">Total A/R</th>
                  <th className="py-3 px-4 text-right">Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {by_customer.map((cust) => (
                  <tr key={cust.customer_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {cust.customer_name}{' '}
                      {cust.customer_code && <span className="text-[10px] text-slate-400 font-mono">({cust.customer_code})</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-600">
                      ₹{cust.current.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-amber-600">
                      ₹{cust.days_1_30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-orange-600">
                      ₹{cust.days_31_60.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-rose-600">
                      ₹{cust.days_61_90.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-purple-700">
                      ₹{cust.days_90_plus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                      ₹{cust.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`${ERP_BASE_PATH}/finance/receivables/customer/${cust.customer_id}/statement`}
                        className="inline-block text-[11px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded"
                      >
                        Statement
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
