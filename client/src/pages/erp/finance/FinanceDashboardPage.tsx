import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building2,
  Calendar,
  Plus,
  ArrowRight,
  BookOpen,
  Scale,
  PieChart,
} from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { FinanceDashboardKPIs } from '../../../types/finance';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import StatusBadge from '../../../components/common/StatusBadge';

const FinanceDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<FinanceDashboardKPIs | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getDashboardKPIs();
      setKpis(data);
    } catch (err: any) {
      console.error('Error loading finance dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load finance dashboard KPIs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingState message="Calculating financial metrics & ledger summaries..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboardData} />;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <IndianRupee className="w-7 h-7 text-emerald-400" />
            Finance & Accounting Control Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            General Ledger, Double-Entry Accounting, Trial Balance & Financial Statements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/journal-entries/new')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" />
            New Journal Entry
          </button>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/general-ledger')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm transition-colors"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            View Ledger
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              ₹{(kpis?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">Recognized credit entries</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="p-2.5 bg-rose-500/10 rounded-lg text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-400 font-mono">
              ₹{(kpis?.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">Operating & material costs</p>
          </div>
        </div>

        {/* Net Profit / Loss */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Profit / Loss</span>
            <div className={`p-2.5 rounded-lg ${(kpis?.netProfitLoss || 0) >= 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold font-mono ${(kpis?.netProfitLoss || 0) >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
              ₹{(kpis?.netProfitLoss || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">Revenue minus Expenses</p>
          </div>
        </div>

        {/* Cash & Bank Balances */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cash & Bank Assets</span>
            <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-400 font-mono">
              ₹{(kpis?.cashBankBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">Liquid working capital</p>
          </div>
        </div>
      </div>

      {/* Sub-KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Receivables */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Accounts Receivable</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
              ₹{(kpis?.accountsReceivable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Payables */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Accounts Payable</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-1">
              ₹{(kpis?.accountsPayable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Financial Period */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Active Fiscal Period</div>
            <div className="text-base font-bold text-slate-200 mt-1 flex items-center gap-2">
              {kpis?.activePeriod ? kpis.activePeriod.period_name : 'No Active Period'}
              {kpis?.activePeriod && (
                <StatusBadge status={kpis.activePeriod.status} />
              )}
            </div>
          </div>
          <div className="p-2 bg-slate-800 rounded-lg text-cyan-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Reports Navigation Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/trial-balance')}
          className="p-5 bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Scale className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mt-4">Trial Balance</h3>
          <p className="text-xs text-slate-400 mt-1">Verify that total debits equal total credits across all accounts.</p>
        </div>

        <div
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/profit-loss')}
          className="p-5 bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mt-4">Profit & Loss Statement</h3>
          <p className="text-xs text-slate-400 mt-1">Operating revenue, direct costs, and net income performance.</p>
        </div>

        <div
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/balance-sheet')}
          className="p-5 bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <PieChart className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mt-4">Balance Sheet</h3>
          <p className="text-xs text-slate-400 mt-1">Assets, Liabilities, and Shareholder Equity accounting equation.</p>
        </div>
      </div>

      {/* Recent Posted Journals */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Recent Posted Journals</h3>
            <p className="text-xs text-slate-400">Latest double-entry postings committed to General Ledger</p>
          </div>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/journal-entries')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            View All Entries
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {!kpis?.recentPostedJournals || kpis.recentPostedJournals.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            No posted journal entries found yet. Create your first double-entry journal!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Journal No</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Debit (₹)</th>
                  <th className="p-3 text-right">Credit (₹)</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {kpis.recentPostedJournals.map(j => (
                  <tr
                    key={j.id}
                    onClick={() => navigate(`/secure-kolmeks-x0y0/finance/journal-entries/${j.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono text-emerald-400 font-semibold">{j.journal_number}</td>
                    <td className="p-3 text-slate-400">{j.entry_date}</td>
                    <td className="p-3 max-w-xs truncate">{j.description}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      ₹{parseFloat(j.total_debit as any || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-cyan-400">
                      ₹{parseFloat(j.total_credit as any || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={j.status} />
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

export default FinanceDashboardPage;
