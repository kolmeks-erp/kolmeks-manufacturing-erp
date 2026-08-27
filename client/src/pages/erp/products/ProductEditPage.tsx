import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, AlertCircle } from 'lucide-react';
import { ProductCategory, ProductFormData } from '../../../types/product';
import { ProductService } from '../../../services/product.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productCode, setProductCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category_id: '',
    product_type: 'component',
    unit: 'pcs',
    material: '',
    part_number: '',
    revision: 'R0',
    description: '',
    minimum_stock: 0,
    status: 'active',
  });

  useEffect(() => {
    const loadInitialData = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const [productData, catData] = await Promise.all([
          ProductService.getProductById(id),
          ProductService.getCategories(),
        ]);

        setCategories(catData);
        setProductCode(productData.product_code);
        setFormData({
          name: productData.name || '',
          category_id: productData.category_id || '',
          product_type: productData.product_type || 'component',
          unit: productData.unit || 'pcs',
          material: productData.material || '',
          part_number: productData.part_number || '',
          revision: productData.revision || 'R0',
          description: productData.description || '',
          minimum_stock: productData.minimum_stock || 0,
          status: productData.status || 'active',
        });
      } catch (err: any) {
        console.error('Error loading product for edit:', err);
        setError(err?.response?.data?.error?.message || 'Failed to load product record for editing.');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);

    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await ProductService.updateProduct(id, formData);
      navigate(`${ERP_BASE_PATH}/products/${id}`);
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err?.response?.data?.error?.message || 'Failed to update product master record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3 animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* PAGE HEADER */}
      <PageHeader
        title={`Edit Product: ${productCode}`}
        description="Update technical specifications, material, classification, or lifecycle status for this product master record."
        badge="Product Master"
        actions={
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/products/${id}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        }
      />

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            1. Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product Code (Locked)
              </label>
              <input
                type="text"
                disabled
                value={productCode}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description / Technical Summary
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CLASSIFICATION */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            2. Classification & Units
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product Category
              </label>
              <select
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product Type <span className="text-red-500">*</span>
              </label>
              <select
                name="product_type"
                required
                value={formData.product_type}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="component">Component</option>
                <option value="assembly">Assembly</option>
                <option value="finished_product">Finished Product</option>
                <option value="raw_material">Raw Material</option>
                <option value="service">Service</option>
                <option value="motor_part">Motor Part</option>
                <option value="custom">Custom</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Unit of Measure <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                required
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
              >
                <option value="pcs">PCS (Pieces)</option>
                <option value="kg">KG (Kilograms)</option>
                <option value="m">M (Meters)</option>
                <option value="set">SET (Sets)</option>
                <option value="other">OTHER</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: TECHNICAL INFORMATION */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            3. Technical Details & Revisions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Material Grade / Alloy
              </label>
              <input
                type="text"
                name="material"
                value={formData.material || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Part / Drawing Number
              </label>
              <input
                type="text"
                name="part_number"
                value={formData.part_number || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Revision Level
              </label>
              <input
                type="text"
                name="revision"
                value={formData.revision || 'R0'}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: STATUS */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            4. Lifecycle Status
          </h3>

          <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Master Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/products/${id}`)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-[#0B1E36] hover:bg-[#0F2C59] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Updating...' : 'Update Product Master'}
          </button>
        </div>
      </form>
    </div>
  );
};
