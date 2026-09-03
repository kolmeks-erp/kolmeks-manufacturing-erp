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
    <div className="space-y-5">
      {/* Header & Quick Action Buttons */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <IndianRupee className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Finance & Accounting Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              General Ledger, Double-Entry Accounting, Trial Balance & Financial Statements
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/journal-entries/new')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Journal Entry
          </button>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/general-ledger')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cyan-600" />
            View Ledger
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 font-mono tracking-tight">
              ₹{(kpis?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Recognized credit entries</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600 border border-rose-100">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600 font-mono tracking-tight">
              ₹{(kpis?.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Operating & material costs</p>
          </div>
        </div>

        {/* Net Profit / Loss */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Profit / Loss</span>
            <div className={`p-2 rounded-lg ${(kpis?.netProfitLoss || 0) >= 0 ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold font-mono tracking-tight ${(kpis?.netProfitLoss || 0) >= 0 ? 'text-cyan-600' : 'text-amber-600'}`}>
              ₹{(kpis?.netProfitLoss || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Revenue minus Expenses</p>
          </div>
        </div>

        {/* Cash & Bank Balances */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cash & Bank Assets</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-600 font-mono tracking-tight">
              ₹{(kpis?.cashBankBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Liquid working capital</p>
          </div>
        </div>
      </div>

      {/* Sub-KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Receivables */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Accounts Receivable</div>
            <div className="text-lg font-bold text-emerald-600 font-mono mt-1">
              ₹{(kpis?.accountsReceivable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Payables */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Accounts Payable</div>
            <div className="text-lg font-bold text-amber-600 font-mono mt-1">
              ₹{(kpis?.accountsPayable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Financial Period */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Active Fiscal Period</div>
            <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
              {kpis?.activePeriod ? kpis.activePeriod.period_name : 'No Active Period'}
              {kpis?.activePeriod && (
                <StatusBadge status={kpis.activePeriod.status} />
              )}
            </div>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Reports Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/trial-balance')}
          className="p-5 bg-white border border-slate-200/80 hover:border-blue-400 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Scale className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-4">Trial Balance</h3>
          <p className="text-xs text-slate-500 mt-1">Verify that total debits equal total credits across all accounts.</p>
        </div>

        <div
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/profit-loss')}
          className="p-5 bg-white border border-slate-200/80 hover:border-blue-400 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-100">
              <TrendingUp className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-4">Profit & Loss Statement</h3>
          <p className="text-xs text-slate-500 mt-1">Operating revenue, direct costs, and net income performance.</p>
        </div>

        <div
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/balance-sheet')}
          className="p-5 bg-white border border-slate-200/80 hover:border-blue-400 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <PieChart className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-4">Balance Sheet</h3>
          <p className="text-xs text-slate-500 mt-1">Assets, Liabilities, and Shareholder Equity accounting equation.</p>
        </div>
      </div>

      {/* Recent Posted Journals */}
      <div className="p-5 sm:p-6 bg-white border border-slate-200/80 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Posted Journals</h3>
            <p className="text-xs text-slate-500">Latest double-entry postings committed to General Ledger</p>
          </div>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/journal-entries')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            View All Entries
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {!kpis?.recentPostedJournals || kpis.recentPostedJournals.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No posted journal entries found yet. Create your first double-entry journal!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">Journal No</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5 text-right">Debit (₹)</th>
                  <th className="px-5 py-3.5 text-right">Credit (₹)</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kpis.recentPostedJournals.map(j => (
                  <tr
                    key={j.id}
                    onClick={() => navigate(`/secure-kolmeks-x0y0/finance/journal-entries/${j.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-blue-600 font-bold">{j.journal_number}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono">{j.entry_date}</td>
                    <td className="px-5 py-3.5 max-w-xs truncate font-medium text-slate-900">{j.description}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-emerald-600 font-bold">
                      ₹{parseFloat(j.total_debit as any || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-cyan-600 font-bold">
                      ₹{parseFloat(j.total_credit as any || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-center">
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
