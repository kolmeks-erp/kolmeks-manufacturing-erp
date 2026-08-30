import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderTree,
  ArrowLeft,
  BookOpen,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { ChartOfAccount } from '../../../types/finance';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import StatusBadge from '../../../components/common/StatusBadge';

const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<ChartOfAccount | null>(null);

  const fetchAccountDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getAccountById(id);
      setAccount(data);
    } catch (err: any) {
      console.error('Error loading account detail:', err);
      setError(err.response?.data?.message || 'Failed to load account detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountDetail();
  }, [id]);

  if (loading) return <LoadingState message="Calculating account running balances & movement logs..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAccountDetail} />;
  if (!account) return <ErrorState message="Account record not found." />;

  return (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/accounts')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-emerald-400">[{account.account_code}]</span>
              <h1 className="text-2xl font-bold text-slate-100">{account.account_name}</h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {account.category} • Normal Balance: <span className="font-mono font-bold text-cyan-400">{account.normal_balance}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/secure-kolmeks-x0y0/finance/general-ledger?account_id=${account.id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-emerald-900/30 self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          Full General Ledger
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Current Account Balance</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              ₹{(account.currentBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Net accumulated running balance</p>
          </div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Debits</span>
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-cyan-400 font-mono">
              ₹{(account.totalDebit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sum of posted debit lines</p>
          </div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Credits</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-purple-400 font-mono">
              ₹{(account.totalCredit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sum of posted credit lines</p>
          </div>
        </div>
      </div>

      {/* Account Info Details Card */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Account Specifications</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Type</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">{account.account_type}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Category</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">{account.category}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Control Account</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">
              {account.is_control_account ? 'Yes (Subledger Control)' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Status</span>
            <div className="mt-0.5">
              <StatusBadge status={account.status} />
            </div>
          </div>
        </div>

        {account.description && (
          <div className="pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-500 block">Description / Notes:</span>
            <p className="text-slate-300 mt-1">{account.description}</p>
          </div>
        )}
      </div>

      {/* Recent Ledger Activity Table */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Recent Posted Ledger Transactions</h3>

        {!account.recentActivity || account.recentActivity.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No posted transactions recorded for this account yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Journal No</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Line Description</th>
                  <th className="p-3 text-right">Debit (₹)</th>
                  <th className="p-3 text-right">Credit (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {account.recentActivity.map((line: any) => (
                  <tr
                    key={line.id}
                    onClick={() => navigate(`/secure-kolmeks-x0y0/finance/journal-entries/${line.journal_entry?.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono text-emerald-400 font-bold">
                      {line.journal_entry?.journal_number || 'JE-N/A'}
                    </td>
                    <td className="p-3 text-slate-400">{line.journal_entry?.entry_date || '—'}</td>
                    <td className="p-3">{line.description || line.journal_entry?.description || '—'}</td>
                    <td className="p-3 text-right font-mono text-cyan-400">
                      {parseFloat(line.debit || 0) > 0 ? `₹${parseFloat(line.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="p-3 text-right font-mono text-purple-400">
                      {parseFloat(line.credit || 0) > 0 ? `₹${parseFloat(line.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
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

export default AccountDetailPage;
