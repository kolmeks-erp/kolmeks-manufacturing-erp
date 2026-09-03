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
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <FolderTree className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Expense Categories & Accounting Mapping
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure default GL account mappings, business category rules, and active expense codes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCategories}
            className="inline-flex items-center px-3 py-2 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Category
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search category code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">Total {filteredCategories.length} categories</span>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState message="Loading expense categories..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCategories} />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-5">Code</th>
                  <th className="py-3.5 px-5">Category Name</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5">Default GL Account</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-emerald-600 font-bold">{cat.code}</td>
                    <td className="py-3.5 px-5 text-slate-900 font-semibold">{cat.name}</td>
                    <td className="py-3.5 px-5 text-slate-500 max-w-xs truncate">{cat.description || '-'}</td>
                    <td className="py-3.5 px-5 text-slate-700">
                      {cat.default_account ? (
                        <span className="inline-flex items-center text-[11px] font-mono bg-slate-100 px-2.5 py-1 rounded border border-slate-200/80 text-slate-700 font-semibold">
                          <BookOpen className="w-3 h-3 mr-1 text-emerald-600" />
                          {cat.default_account.account_code} - {cat.default_account.account_name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Default GL 5500</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {cat.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="inline-flex items-center text-xs text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3 py-1 rounded-lg transition-all font-semibold cursor-pointer"
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

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveCategory} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center border-b border-slate-100 pb-3">
              <FolderTree className="w-4 h-4 mr-2 text-emerald-600" />
              {editingCategory ? `Edit Category (${editingCategory.code})` : 'Create Expense Category'}
            </h3>

            {modalError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium">
                {modalError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={Boolean(editingCategory)}
                placeholder="e.g. TRAVEL, MEALS, SUPPLIES"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Travel & Transport Expenses"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default GL Account (Chart of Accounts)
              </label>
              <select
                value={defaultAccountId}
                onChange={(e) => setDefaultAccountId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Optional summary of category scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {editingCategory && (
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-slate-50 border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Active Category
                </label>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                {formSubmitting ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategoryListPage;
