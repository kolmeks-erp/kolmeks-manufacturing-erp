import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Filter, Printer, ArrowLeft } from 'lucide-react';
import { purchaseInvoiceService } from '../../../services/purchase_invoice.service';
import { PayableAgingReport } from '../../../types/purchase_invoice';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';

export const PayableAgingPage: React.FC = () => {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<PayableAgingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAging = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseInvoiceService.getPayableAging(reportDate);
      setReport(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to generate aging report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAging();
  }, [reportDate]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Accounts Payable
          </button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-indigo-600" />
            Accounts Payable Aging Analysis
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Categorize outstanding supplier liabilities into standard aging buckets based on due dates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>As of Date:</span>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="border-0 p-0 text-xs font-bold text-indigo-600 focus:ring-0"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Export
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Calculating accounts payable aging buckets..." />
      ) : error || !report ? (
        <ErrorState message={error || 'Failed to calculate aging report.'} onRetry={fetchAging} />
      ) : (
        <div className="space-y-6">
          {/* SUMMARY CARDS BUCKETS */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="block text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Current</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">
                ₹{report.summary.current.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="block text-[11px] font-bold text-amber-600 uppercase tracking-wider">1 – 30 Days</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">
                ₹{report.summary.days_1_30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="block text-[11px] font-bold text-orange-600 uppercase tracking-wider">31 – 60 Days</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">
                ₹{report.summary.days_31_60.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="block text-[11px] font-bold text-rose-600 uppercase tracking-wider">61 – 90 Days</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">
                ₹{report.summary.days_61_90.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="block text-[11px] font-bold text-purple-600 uppercase tracking-wider">90+ Days</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">
                ₹{report.summary.days_90_plus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl shadow-xs text-white">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">Total Payable</span>
              <span className="text-lg font-bold text-indigo-400 mt-1 block">
                ₹{report.summary.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* SUPPLIER AGING TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Payable Breakdown by Supplier</h3>
              <span className="text-xs text-slate-500 font-medium">Report Date: {report.as_of_date}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 font-semibold text-slate-600 uppercase border-b border-slate-200">
                    <th className="py-3 px-4">Supplier Name</th>
                    <th className="py-3 px-4 text-right">Current</th>
                    <th className="py-3 px-4 text-right">1–30 Days</th>
                    <th className="py-3 px-4 text-right">31–60 Days</th>
                    <th className="py-3 px-4 text-right">61–90 Days</th>
                    <th className="py-3 px-4 text-right">90+ Days</th>
                    <th className="py-3 px-4 text-right font-bold">Total Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.by_supplier.map((supp) => (
                    <tr key={supp.supplier_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <Link
                          to={`${ERP_BASE_PATH}/finance/payables/supplier/${supp.supplier_id}/statement`}
                          className="hover:underline text-indigo-600"
                        >
                          {supp.supplier_name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-emerald-600">
                        ₹{supp.current.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-amber-600">
                        ₹{supp.days_1_30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-orange-600">
                        ₹{supp.days_31_60.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-rose-600">
                        ₹{supp.days_61_90.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-purple-600">
                        ₹{supp.days_90_plus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                        ₹{supp.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
