import React, { useEffect, useState } from 'react';
import { TrendingUp, ArrowLeft, Filter, Printer, DollarSign, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { financeService } from '../../../services/finance.service';
import { ProfitLossData } from '../../../types/finance';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';

const ProfitLossPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProfitLossData | null>(null);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchProfitLoss = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeService.getProfitLoss({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setData(res);
    } catch (err: any) {
      console.error('Error fetching P&L:', err);
      setError(err.response?.data?.message || 'Failed to calculate Profit & Loss.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitLoss();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfitLoss();
  };

  if (loading) return <LoadingState message="Generating Profit & Loss financial statement..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProfitLoss} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-cyan-400" />
              Profit & Loss Statement (P&L)
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Statement of financial performance: Revenue minus Expenses
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          Print P&L Report
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-1 mt-5"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Net Income Summary Header Card */}
      {data && (
        <div className={`p-6 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${data.netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Net Financial Income / (Loss)</span>
            <div className={`text-3xl font-extrabold font-mono mt-1 ${data.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{data.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Total Revenue (₹{data.totalRevenue.toLocaleString('en-IN')}) minus Expenses (₹{data.totalExpenses.toLocaleString('en-IN')})
            </p>
          </div>
          <div className={`p-4 rounded-xl ${data.netProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {data.netProfit >= 0 ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
          </div>
        </div>
      )}

      {/* Revenue Section */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Operating & Services Revenue
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3">Account Code</th>
                <th className="p-3">Revenue Category</th>
                <th className="p-3 text-right">Recognized Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {!data?.revenueItems || data.revenueItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500">
                    No sales revenue posted in this period.
                  </td>
                </tr>
              ) : (
                data.revenueItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-emerald-400 font-bold">{item.account_code}</td>
                    <td className="p-3 font-medium text-slate-200">{item.account_name}</td>
                    <td className="p-3 text-right font-mono text-emerald-400 font-bold text-sm">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-800/60 font-mono text-xs border-t border-slate-700 font-bold text-slate-100">
              <tr>
                <td colSpan={2} className="p-3 text-right uppercase text-slate-400">Total Operating Revenue:</td>
                <td className="p-3 text-right text-emerald-400 text-sm">
                  ₹{(data?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
        <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <TrendingDown className="w-4 h-4" />
          Direct Production & Operating Expenses
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3">Account Code</th>
                <th className="p-3">Expense Category</th>
                <th className="p-3 text-right">Incurred Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {!data?.expenseItems || data.expenseItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500">
                    No operating expenses posted in this period.
                  </td>
                </tr>
              ) : (
                data.expenseItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-rose-400 font-bold">{item.account_code}</td>
                    <td className="p-3 font-medium text-slate-200">{item.account_name}</td>
                    <td className="p-3 text-right font-mono text-rose-400 font-bold text-sm">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-800/60 font-mono text-xs border-t border-slate-700 font-bold text-slate-100">
              <tr>
                <td colSpan={2} className="p-3 text-right uppercase text-slate-400">Total Operating Expenses:</td>
                <td className="p-3 text-right text-rose-400 text-sm">
                  ₹{(data?.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossPage;
