import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  X,
} from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { ChartOfAccount, AccountType } from '../../../types/finance';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import StatusBadge from '../../../components/common/StatusBadge';

const ChartOfAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: 'ASSET' as AccountType,
    parent_account_id: '',
    category: 'Current Assets',
    description: '',
    is_control_account: false,
    normal_balance: 'DEBIT',
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getAccounts({ type: filterType, search: searchTerm });
      setAccounts(data);
    } catch (err: any) {
      console.error('Error fetching CoA:', err);
      setError(err.response?.data?.message || 'Failed to fetch Chart of Accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAccounts();
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.account_code || !formData.account_name) {
      setModalError('Account Code and Account Name are required.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);

      // Auto set normal balance if default
      const normalBal = ['ASSET', 'EXPENSE'].includes(formData.account_type) ? 'DEBIT' : 'CREDIT';

      await financeService.createAccount({
        ...formData,
        normal_balance: normalBal as any,
      });

      setIsModalOpen(false);
      setFormData({
        account_code: '',
        account_name: '',
        account_type: 'ASSET',
        parent_account_id: '',
        category: 'Current Assets',
        description: '',
        is_control_account: false,
        normal_balance: 'DEBIT',
      });
      fetchAccounts();
    } catch (err: any) {
      console.error('Error creating account:', err);
      setModalError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (type: AccountType) => {
    switch (type) {
      case 'ASSET': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'LIABILITY': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'EQUITY': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'REVENUE': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'EXPENSE': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  if (loading) return <LoadingState message="Fetching Chart of Accounts hierarchy..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAccounts} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-emerald-400" />
            Chart of Accounts (CoA)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Hierarchical ledger account structure, control accounts & normal balances
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-emerald-900/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Account
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Account Type Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterType === '' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            All Types
          </button>
          {['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterType === type ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Accounts Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Account Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">Normal Balance</th>
                <th className="p-3.5 text-center">Control Acct</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No accounts found matching your query.
                  </td>
                </tr>
              ) : (
                accounts.map(acc => (
                  <tr
                    key={acc.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">{acc.account_code}</td>
                    <td className="p-3.5 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        {acc.parent_account && (
                          <span className="text-slate-500 text-[10px]">↳</span>
                        )}
                        <span>{acc.account_name}</span>
                      </div>
                      {acc.description && (
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5 truncate max-w-xs">{acc.description}</p>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getTypeColor(acc.account_type)}`}>
                        {acc.account_type}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{acc.category}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${acc.normal_balance === 'DEBIT' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-500/10 text-purple-400'}`}>
                        {acc.normal_balance}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {acc.is_control_account ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-semibold">
                          <CheckCircle className="w-3 h-3" /> Control
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <StatusBadge status={acc.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => navigate(`/secure-kolmeks-x0y0/finance/accounts/${acc.id}`)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="View Account Detail & Ledger"
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-emerald-400" />
                Add Chart of Account
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Account Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. 1140"
                    value={formData.account_code}
                    onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Account Type *</label>
                  <select
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value as AccountType })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ASSET">ASSET</option>
                    <option value="LIABILITY">LIABILITY</option>
                    <option value="EQUITY">EQUITY</option>
                    <option value="REVENUE">REVENUE</option>
                    <option value="EXPENSE">EXPENSE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Account Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Prepaid Factory Insurance"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Current Assets"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Parent Account</label>
                  <select
                    value={formData.parent_account_id}
                    onChange={(e) => setFormData({ ...formData, parent_account_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">None (Top-Level Header)</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.account_code} - {a.account_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe purpose of account..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_control_account"
                  checked={formData.is_control_account}
                  onChange={(e) => setFormData({ ...formData, is_control_account: e.target.checked })}
                  className="w-4 h-4 rounded accent-emerald-500 bg-slate-800 border-slate-700"
                />
                <label htmlFor="is_control_account" className="text-slate-300 font-semibold cursor-pointer">
                  Mark as Control Account (Subledger Control)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccountsPage;
