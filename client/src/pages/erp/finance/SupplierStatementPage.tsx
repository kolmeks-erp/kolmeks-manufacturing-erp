import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Printer, ArrowLeft, Calendar } from 'lucide-react';
import { purchaseInvoiceService } from '../../../services/purchase_invoice.service';
import { SupplierStatementData } from '../../../types/purchase_invoice';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';

export const SupplierStatementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<SupplierStatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatement = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await purchaseInvoiceService.getSupplierStatement(id, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to generate supplier statement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement();
  }, [id, startDate, endDate]);

  if (loading) return <LoadingState message="Generating supplier statement of account..." />;
  if (error || !data) return <ErrorState message={error || 'Failed to load statement.'} onRetry={fetchStatement} />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Payables
          </button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            Supplier Statement of Account
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Chronological ledger of debits, credits, and running balance for {data.supplier.supplier_name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-0 p-0 text-xs font-semibold focus:ring-0"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-0 p-0 text-xs font-semibold focus:ring-0"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Statement
          </button>
        </div>
      </div>

      {/* STATEMENT CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{data.supplier.supplier_name}</h2>
            <p className="text-xs text-slate-500 font-mono">Code: {data.supplier.supplier_code}</p>
            {data.supplier.email && <p className="text-xs text-slate-500">Email: {data.supplier.email}</p>}
            {data.supplier.payment_terms && (
              <p className="text-xs text-slate-600 font-semibold mt-1">Payment Terms: {data.supplier.payment_terms}</p>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Closing Balance Owed</span>
            <span className="text-2xl font-extrabold text-indigo-600">
              ₹{data.closing_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* LEDGER TABLE */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 font-semibold text-slate-500 uppercase border-b border-slate-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Debit (Payment)</th>
                <th className="py-3 px-4 text-right">Credit (Bill)</th>
                <th className="py-3 px-4 text-right font-bold">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.statement.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs italic">
                    No transactions found for this supplier within the specified date range.
                  </td>
                </tr>
              ) : (
                data.statement.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-700">{t.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.type === 'INVOICE' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">{t.reference}</td>
                    <td className="py-3 px-4 text-slate-600">{t.description}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      {t.debit > 0 ? `₹${t.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {t.credit > 0 ? `₹${t.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-600 text-sm">
                      ₹{t.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
