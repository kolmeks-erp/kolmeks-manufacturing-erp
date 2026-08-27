import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  Edit,
  Power,
  Layers,
  FileText,
  AlertCircle,
  Ruler,
} from 'lucide-react';
import { Product, ProductStatus } from '../../../types/product';
import { ProductService } from '../../../services/product.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { ConfirmDialog } from '../../../components/erp/ConfirmDialog';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status Change Modal State
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await ProductService.getProductById(id);
        setProduct(data);
      } catch (err: any) {
        console.error('Error loading product details:', err);
        setError(err?.response?.data?.error?.message || 'Failed to load product details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const handleConfirmStatusChange = async () => {
    if (!product) return;
    try {
      const nextStatus: ProductStatus = product.status === 'active' ? 'inactive' : 'active';
      const updated = await ProductService.patchProductStatus(product.id, nextStatus);
      setProduct((prev) => (prev ? { ...prev, status: updated.status } : null));
      setStatusModalOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to update product status.');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3 animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <h3 className="text-lg font-bold">Product Master Record Not Found</h3>
          <p className="text-xs">{error || 'The requested product profile does not exist or has been removed.'}</p>
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/products`)}
            className="mt-2 px-4 py-2 bg-[#0B1E36] text-white rounded-lg text-xs font-bold hover:bg-[#0F2C59]"
          >
            Back to Products List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* PAGE HEADER */}
      <PageHeader
        title={`${product.name}`}
        description={`Product Code: ${product.product_code}`}
        badge="Product Detail"
        actions={
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/products`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>
        }
      />

      {/* HERO HEADER CARD */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Package className="w-8 h-8 text-blue-600" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {product.product_code}
              </span>
              <StatusBadge status={product.status} />
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                REV: {product.revision || 'R0'}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Category: {product.category?.name || 'Unassigned'} • Type: {product.product_type}
            </p>
          </div>
        </div>

        {/* HERO QUICK ACTIONS */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/products/${product.id}/edit`)}
            className="flex-1 md:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Product
          </button>

          <button
            type="button"
            onClick={() => setStatusModalOpen(true)}
            className={`flex-1 md:flex-initial px-4 py-2 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
              product.status === 'active'
                ? 'bg-slate-700 hover:bg-slate-800'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {product.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* DETAILED INFORMATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: TECHNICAL SPECIFICATIONS */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-blue-600" />
            Technical Specifications
          </h3>

          <dl className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-500 font-medium">Material Grade / Alloy</dt>
              <dd className="font-semibold text-slate-900 mt-1">{product.material || '—'}</dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Drawing / Part Number</dt>
              <dd className="font-mono font-semibold text-slate-900 mt-1">{product.part_number || '—'}</dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Unit of Measure</dt>
              <dd className="font-mono uppercase font-semibold text-slate-900 mt-1">{product.unit}</dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Revision Level</dt>
              <dd className="font-mono font-semibold text-slate-900 mt-1">{product.revision || 'R0'}</dd>
            </div>
          </dl>
        </div>

        {/* CARD 2: CLASSIFICATION & LIFECYCLE */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Classification & System Info
          </h3>

          <dl className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-500 font-medium">Category</dt>
              <dd className="font-semibold text-slate-900 mt-1">{product.category?.name || 'Unassigned'}</dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Product Type</dt>
              <dd className="font-semibold text-slate-900 capitalize mt-1">{product.product_type.replace('_', ' ')}</dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Created Date</dt>
              <dd className="font-medium text-slate-800 mt-1">{formatDate(product.created_at)}</dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Last Modified</dt>
              <dd className="font-medium text-slate-800 mt-1">{formatDate(product.updated_at)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* DESCRIPTION CARD */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          Technical Notes & Description
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
          {product.description || 'No description or technical notes provided for this product master record.'}
        </p>
      </div>

      {/* CONFIRM STATUS MODAL */}
      {statusModalOpen && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setStatusModalOpen(false)}
          onConfirm={handleConfirmStatusChange}
          title={`${product.status === 'active' ? 'Deactivate' : 'Activate'} Product Master`}
          message={`Are you sure you want to ${
            product.status === 'active' ? 'deactivate' : 'activate'
          } product "${product.name}" (${product.product_code})?`}
          confirmText={product.status === 'active' ? 'Deactivate Product' : 'Activate Product'}
          isDangerous={product.status === 'active'}
        />
      )}
    </div>
  );
};
