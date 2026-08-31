import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree,
  Plus,
  Edit,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  BookOpen,
  ArrowLeft,
  X,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../../components/erp/LoadingState';
import { ErrorState } from '../../../../components/erp/ErrorState';
import { expenseService, ExpenseCategory } from '../../../../services/expense.service';
import { financeService } from '../../../../services/finance.service';
import { ChartOfAccount } from '../../../../types/finance';

export const ExpenseCategoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [defaultAccountId, setDefaultAccountId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const [catData, accData] = await Promise.all([
        expenseService.getCategories(true),
        financeService.getAccounts(),
      ]);
      setCategories(catData);
      setAccounts(accData || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err?.response?.data?.message || 'Failed to fetch expense categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCode('');
    setName('');
    setDescription('');
    setDefaultAccountId('');
    setIsActive(true);
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (cat: ExpenseCategory) => {
    setEditingCategory(cat);
    setCode(cat.code);
    setName(cat.name);
    setDescription(cat.description || '');
    setDefaultAccountId(cat.default_account_id || '');
    setIsActive(cat.is_active);
    setModalError(null);
    setShowModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setModalError('Category Name is required.');
      return;
    }
    if (!editingCategory && !code.trim()) {
      setModalError('Category Code is required.');
      return;
    }

    try {
      setFormSubmitting(true);
      setModalError(null);

      if (editingCategory) {
        await expenseService.updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
          default_account_id: defaultAccountId || undefined,
          is_active: isActive,
        });
      } else {
        await expenseService.createCategory({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim(),
          default_account_id: defaultAccountId || undefined,
        });
      }

      setShowModal(false);
      await fetchCategories();
    } catch (err: any) {
      console.error('Error saving category:', err);
      setModalError(err?.response?.data?.error?.message || err?.message || 'Failed to save expense category.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ERPLayout activeTab="finance">
      <div className="space-y-6">
        <ERPPageHeader
          title="Expense Categories & Accounting Mapping"
          subtitle="Configure default GL account mappings, business category rules, and active expense codes."
          actions={
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchCategories}
                className="inline-flex items-center px-3 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 shadow-md transition"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>
            </div>
          }
        />

        {/* Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search category code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <span className="text-xs text-slate-400">Total {filteredCategories.length} categories</span>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState message="Loading expense categories..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchCategories} />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Category Name</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Default GL Account</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">{cat.code}</td>
                      <td className="py-3.5 px-4 text-slate-200 font-medium">{cat.name}</td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{cat.description || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {cat.default_account ? (
                          <span className="inline-flex items-center text-xs font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-teal-300">
                            <BookOpen className="w-3 h-3 mr-1 text-teal-400" />
                            {cat.default_account.account_code} - {cat.default_account.account_name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-italic">Default GL 5500</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {cat.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="inline-flex items-center text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded transition font-medium"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <form onSubmit={handleSaveCategory} className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-semibold text-slate-100 flex items-center border-b border-slate-800 pb-3">
              <FolderTree className="w-4 h-4 mr-2 text-emerald-400" />
              {editingCategory ? `Edit Category (${editingCategory.code})` : 'Create Expense Category'}
            </h3>

            {modalError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-lg text-xs">
                {modalError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                disabled={Boolean(editingCategory)}
                placeholder="e.g. TRAVEL, MEALS, SUPPLIES"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Travel & Transport Expenses"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Default GL Account (Chart of Accounts)
              </label>
              <select
                value={defaultAccountId}
                onChange={(e) => setDefaultAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- General Expense GL Account --</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_code} - {acc.account_name} ({acc.account_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Optional summary of category scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm"
              />
            </div>

            {editingCategory && (
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0"
                />
                <label htmlFor="isActiveToggle" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Active Category
                </label>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold"
              >
                {formSubmitting ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}
    </ERPLayout>
  );
};

export default ExpenseCategoryListPage;
