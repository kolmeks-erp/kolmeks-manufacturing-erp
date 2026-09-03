import React, { useEffect, useState } from 'react';
import { Scale, ArrowLeft, Filter, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { financeService } from '../../../services/finance.service';
import { TrialBalanceData } from '../../../types/finance';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import { FinancialIntegrityAlert } from '../../../components/erp/finance/FinancialIntegrityAlert';

const TrialBalancePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrialBalanceData | null>(null);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeService.getTrialBalance({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setData(res);
    } catch (err: any) {
      console.error('Error fetching Trial Balance:', err);
      setError(err.response?.data?.message || 'Failed to calculate Trial Balance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrialBalance();
  };

  if (loading) return <LoadingState message="Aggregating account debit and credit balances for Trial Balance..." />;
  if (error) return <ErrorState message={error} onRetry={fetchTrialBalance} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance')}
            className="p-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-7 h-7 text-emerald-600" />
              Trial Balance Statement
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Double-entry arithmetic balance verification across all active accounts
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          Print / Export Report
        </button>
      </div>

      {/* Financial Integrity Alert Component */}
      {data && (
        <FinancialIntegrityAlert
          isBalanced={data.isBalanced}
          difference={data.difference}
          type="debit_credit"
        />
      )}

      {/* Date Filter Bar */}
      <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="block text-slate-700 mb-1 font-semibold">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-semibold">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1 mt-5 shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Trial Balance Statement Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200/80 tracking-wider">
              <tr>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Account Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5 text-center">Normal</th>
                <th className="p-3.5 text-right font-mono">Total Debit (₹)</th>
                <th className="p-3.5 text-right font-mono">Total Credit (₹)</th>
                <th className="p-3.5 text-right font-mono">Net Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {!data?.items || data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No account movements recorded for the selected period.
                  </td>
                </tr>
              ) : (
                data.items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-emerald-700 font-bold">{item.account_code}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{item.account_name}</td>
                    <td className="p-3.5 text-slate-600">{item.account_type}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${item.normal_balance === 'DEBIT' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                        {item.normal_balance}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-cyan-700 font-semibold">
                      {item.total_debit > 0 ? `₹${item.total_debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="p-3.5 text-right font-mono text-purple-700 font-semibold">
                      {item.total_credit > 0 ? `₹${item.total_credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="p-3.5 text-right font-mono text-emerald-700 font-bold">
                      ₹{item.net_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {data && (
              <tfoot className="bg-slate-50 font-mono text-xs border-t-2 border-slate-200 font-bold text-slate-900">
                <tr>
                  <td colSpan={4} className="p-4 text-right uppercase text-slate-600">Total Trial Balance:</td>
                  <td className="p-4 text-right text-cyan-700 text-sm">
                    ₹{data.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right text-purple-700 text-sm">
                    ₹{data.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right text-emerald-700 text-sm">
                    {data.isBalanced ? 'BALANCED' : `DIFF: ₹${data.difference.toFixed(2)}`}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrialBalancePage;
