import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Power,
  Package,
  XCircle,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';
import { ProductCategory, CategoryFormData, CategoryStatus } from '../../../types/product';
import { ProductService } from '../../../services/product.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { EmptyState } from '../../../components/erp/EmptyState';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const ProductCategoryListPage: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State for Add / Edit Category
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    status: 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Status Change Confirmation Dialog State
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [targetCategory, setTargetCategory] = useState<ProductCategory | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusWarningError, setStatusWarningError] = useState<string | null>(null);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ProductService.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err?.response?.data?.error?.message || 'Failed to load product categories.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter Categories by search term
  const filteredCategories = categories.filter((cat) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      cat.name.toLowerCase().includes(term) ||
      (cat.description && cat.description.toLowerCase().includes(term))
    );
  });

  // Open Create Category Modal
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', status: 'active' });
    setModalError(null);
    setModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditModal = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      status: cat.status,
    });
    setModalError(null);
    setModalOpen(true);
  };

  // Save Category (Create or Update)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      if (editingCategory) {
        await ProductService.updateCategory(editingCategory.id, formData);
      } else {
        await ProductService.createCategory(formData);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error('Error saving category:', err);
      setModalError(err?.response?.data?.error?.message || 'Failed to save product category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Status Toggle Modal
  const handleOpenStatusModal = (cat: ProductCategory) => {
    setTargetCategory(cat);
    setStatusWarningError(null);
    setStatusModalOpen(true);
  };

  // Execute Status Toggle
  const handleConfirmStatusChange = async () => {
    if (!targetCategory) return;
    setIsUpdatingStatus(true);
    setStatusWarningError(null);
    try {
      const nextStatus: CategoryStatus = targetCategory.status === 'active' ? 'inactive' : 'active';
      await ProductService.patchCategoryStatus(targetCategory.id, nextStatus);
      setStatusModalOpen(false);
      setTargetCategory(null);
      fetchCategories();
    } catch (err: any) {
      console.error('Error toggling category status:', err);
      setStatusWarningError(
        err?.response?.data?.error?.message || 'Category cannot be deactivated while active products are assigned to it.'
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800 dark:text-slate-100">
      {/* Modern Header Banner */}
      <div className="bg-white dark:bg-[#0F2647] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800 shrink-0">
            <FolderTree className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Product Categories</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                Products Module
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Organize engineered products and components into structured manufacturing categories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/products`)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Products Master</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* SEARCH TOOLBAR */}
      <div className="bg-white dark:bg-[#0F2647] p-4 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search categories by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={fetchCategories}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* MAIN ERROR ALERT */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* DATA TABLE */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#0F2647] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-2" />
          Loading product categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Get started by adding your first product category."
          icon={<FolderTree className="w-8 h-8 text-slate-400" />}
          actionText="Add Category"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white dark:bg-[#0F2647] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B1E36] text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5 whitespace-nowrap font-bold">Category Name</th>
                  <th className="py-3.5 px-5 whitespace-nowrap font-bold">Assigned Products</th>
                  <th className="py-3.5 px-5 whitespace-nowrap font-bold">Status</th>
                  <th className="py-3.5 px-5 whitespace-nowrap font-bold">Updated Date</th>
                  <th className="py-3.5 px-5 text-right whitespace-nowrap font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans text-slate-800 dark:text-slate-200">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-[#163761]/50 transition-colors">
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white block">{cat.name}</span>
                      {cat.description && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{cat.description}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-xs text-slate-700 dark:text-slate-300">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cat.product_count ?? 0} Products</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <StatusBadge status={cat.status} />
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                      {cat.updated_at
                        ? new Date(cat.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cat)}
                        className="inline-flex items-center gap-1 p-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(cat)}
                        className={`inline-flex items-center gap-1 p-1.5 rounded-lg transition-colors cursor-pointer ${
                          cat.status === 'active'
                            ? 'bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400'
                            : 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                        }`}
                        title={cat.status === 'active' ? 'Deactivate Category' : 'Activate Category'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-600" />
                {editingCategory ? 'Edit Product Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNC Shafts & Rotors"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter optional description of this category..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as CategoryStatus }))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#0B1E36] hover:bg-[#0F2C59] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM STATUS TOGGLE MODAL WITH SAFETY WARNING */}
      {statusModalOpen && targetCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {targetCategory.status === 'active' ? 'Deactivate Category' : 'Activate Category'}
            </h3>

            {statusWarningError ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{statusWarningError}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Are you sure you want to {targetCategory.status === 'active' ? 'deactivate' : 'activate'} category{' '}
                <span className="font-semibold text-slate-900">"{targetCategory.name}"</span>?
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStatusModalOpen(false);
                  setTargetCategory(null);
                  setStatusWarningError(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              {!statusWarningError && (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={handleConfirmStatusChange}
                  className={`px-4 py-2 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 ${
                    targetCategory.status === 'active'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {isUpdatingStatus ? 'Updating...' : targetCategory.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
