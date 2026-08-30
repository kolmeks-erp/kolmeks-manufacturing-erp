import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { GeneralLedgerItem, ChartOfAccount } from '../../../types/finance';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';

const GeneralLedgerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialAccountId = searchParams.get('account_id') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [ledgerItems, setLedgerItems] = useState<GeneralLedgerItem[]>([]);

  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccountId);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [acctList, glData] = await Promise.all([
        financeService.getAccounts({ status: 'ACTIVE' }),
        financeService.getGeneralLedger({
          account_id: selectedAccountId || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          search: searchTerm || undefined,
        }),
      ]);

      setAccounts(acctList);
      setLedgerItems(glData);
    } catch (err: any) {
      console.error('Error fetching general ledger:', err);
      setError(err.response?.data?.message || 'Failed to fetch General Ledger records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedAccountId]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  if (loading) return <LoadingState message="Calculating General Ledger running balances..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

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
              <BookOpen className="w-7 h-7 text-emerald-400" />
              General Ledger Register
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Complete chronological audit book of posted debits, credits, and running balances
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Filter by Account</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            >
              <option value="">-- All Chart of Accounts --</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.account_code} - {a.account_name} ({a.account_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-slate-400 mb-1 font-semibold">Search</label>
              <input
                type="text"
                placeholder="JE # or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* General Ledger Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Journal No</th>
                <th className="p-3.5">Account Code & Name</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5 text-right">Debit (₹)</th>
                <th className="p-3.5 text-right">Credit (₹)</th>
                <th className="p-3.5 text-right">Running Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {ledgerItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No posted ledger transactions found matching selected filters.
                  </td>
                </tr>
              ) : (
                ledgerItems.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/secure-kolmeks-x0y0/finance/journal-entries/${item.journal_entry?.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 text-slate-400 font-mono">{item.journal_entry?.entry_date || '—'}</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">{item.journal_entry?.journal_number || '—'}</td>
                    <td className="p-3.5 font-semibold text-slate-200">
                      <span className="font-mono text-cyan-400 font-bold mr-1.5">[{item.account?.account_code}]</span>
                      {item.account?.account_name}
                    </td>
                    <td className="p-3.5 max-w-xs truncate">{item.description || item.journal_entry?.description || '—'}</td>
                    <td className="p-3.5 text-right font-mono text-cyan-400 font-semibold">
                      {parseFloat(item.debit as any || 0) > 0 ? `₹${parseFloat(item.debit as any).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="p-3.5 text-right font-mono text-purple-400 font-semibold">
                      {parseFloat(item.credit as any || 0) > 0 ? `₹${parseFloat(item.credit as any).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="p-3.5 text-right font-mono text-emerald-400 font-bold text-sm">
                      ₹{item.running_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

export default GeneralLedgerPage;
