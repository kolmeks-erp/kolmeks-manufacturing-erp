import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Power,
  XCircle,
  FolderTree,
  AlertCircle,
} from 'lucide-react';
import { Product, ProductCategory, ProductFilters, ProductType, ProductStatus } from '../../../types/product';
import { ProductService } from '../../../services/product.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { ConfirmDialog } from '../../../components/erp/ConfirmDialog';
import { EmptyState } from '../../../components/erp/EmptyState';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();

  // State Management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const limit = 10;

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Confirmation Modal State for Status Toggle
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Categories for dropdown filter
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catData = await ProductService.getCategories();
        setCategories(catData);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch Products List
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: ProductFilters = {
        page,
        limit,
        search: debouncedSearch,
        category_id: selectedCategory,
        product_type: selectedType,
        status: selectedStatus,
        sortBy: 'updated_at',
        sortOrder: 'desc',
      };

      const response = await ProductService.getProducts(filters);
      setProducts(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalRecords(response.pagination.totalRecords);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err?.response?.data?.error?.message || 'Failed to load products master list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedCategory, selectedType, selectedStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset Filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedStatus('');
    setPage(1);
  };

  // Open Status Toggle Modal
  const handleOpenStatusModal = (product: Product) => {
    setTargetProduct(product);
    setStatusModalOpen(true);
  };

  // Execute Status Toggle
  const handleConfirmStatusChange = async () => {
    if (!targetProduct) return;
    try {
      const nextStatus: ProductStatus = targetProduct.status === 'active' ? 'inactive' : 'active';
      await ProductService.patchProductStatus(targetProduct.id, nextStatus);
      setStatusModalOpen(false);
      setTargetProduct(null);
      fetchProducts();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to change product status.');
    }
  };

  const formatTypeLabel = (type: ProductType): string => {
    const labels: Record<ProductType, string> = {
      component: 'Component',
      assembly: 'Assembly',
      finished_product: 'Finished Product',
      raw_material: 'Raw Material',
      service: 'Service',
      other: 'Other',
      motor_part: 'Motor Part',
      custom: 'Custom Engineered',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Product Master Directory"
        description="Manage engineered products, sub-assemblies, and manufactured components used throughout the Kolmeks ERP."
        badge="Products Module"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`${ERP_BASE_PATH}/product-categories`)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
            >
              <FolderTree className="w-4 h-4" />
              <span>Categories</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`${ERP_BASE_PATH}/products/new`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1E36] hover:bg-[#0F2C59] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        }
      />

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, name, part number, or material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Product Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="">All Types</option>
              <option value="component">Component</option>
              <option value="assembly">Assembly</option>
              <option value="finished_product">Finished Product</option>
              <option value="raw_material">Raw Material</option>
              <option value="service">Service</option>
              <option value="motor_part">Motor Part</option>
              <option value="custom">Custom</option>
              <option value="other">Other</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>

            {/* Clear & Refresh */}
            {(selectedCategory || selectedType || selectedStatus || debouncedSearch) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={fetchProducts}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
              title="Refresh List"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* DATA TABLE & EMPTY STATE */}
      {isLoading ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
          Loading products master directory...
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="No products match your filters. Register a new product to get started."
          icon={<Package className="w-8 h-8 text-slate-400" />}
          actionText="Add Product"
          onAction={() => navigate(`${ERP_BASE_PATH}/products/new`)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Code</th>
                  <th className="py-3.5 px-5">Product Name</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Material</th>
                  <th className="py-3.5 px-5">Unit</th>
                  <th className="py-3.5 px-5">Revision</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-slate-800">
                {products.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-blue-900">
                      {row.product_code}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">{row.name}</div>
                      {row.part_number && (
                        <div className="text-[11px] text-slate-500 font-mono">P/N: {row.part_number}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700">
                      {row.category?.name || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {formatTypeLabel(row.product_type)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">{row.material || '—'}</td>
                    <td className="py-3.5 px-5 uppercase font-mono font-medium text-slate-600">{row.unit}</td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-700">{row.revision || 'R0'}</td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => navigate(`${ERP_BASE_PATH}/products/${row.id}`)}
                        className="inline-flex items-center gap-1 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`${ERP_BASE_PATH}/products/${row.id}/edit`)}
                        className="inline-flex items-center gap-1 p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(row)}
                        className={`inline-flex items-center gap-1 p-1.5 rounded-lg transition-colors ${
                          row.status === 'active'
                            ? 'bg-red-50 hover:bg-red-100 text-red-600'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                        title={row.status === 'active' ? 'Deactivate Product' : 'Activate Product'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION BAR */}
          {totalRecords > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 text-xs text-slate-600">
              <div>
                Showing <span className="font-semibold text-slate-900">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-semibold text-slate-900">{Math.min(page * limit, totalRecords)}</span> of{' '}
                <span className="font-semibold text-slate-900">{totalRecords}</span> records
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="font-medium text-slate-700 px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONFIRM STATUS CHANGE MODAL */}
      {statusModalOpen && targetProduct && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => {
            setStatusModalOpen(false);
            setTargetProduct(null);
          }}
          onConfirm={handleConfirmStatusChange}
          title={`${targetProduct.status === 'active' ? 'Deactivate' : 'Activate'} Product`}
          message={`Are you sure you want to ${
            targetProduct.status === 'active' ? 'deactivate' : 'activate'
          } product "${targetProduct.name}" (${targetProduct.product_code})?`}
          confirmText={targetProduct.status === 'active' ? 'Deactivate Product' : 'Activate Product'}
          isDangerous={targetProduct.status === 'active'}
        />
      )}
    </div>
  );
};
