import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, AlertCircle } from 'lucide-react';
import { ProductCategory, ProductFormData } from '../../../types/product';
import { ProductService } from '../../../services/product.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    product_code: '',
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
    const loadCategories = async () => {
      try {
        const catData = await ProductService.getCategories();
        setCategories(catData.filter((c) => c.status === 'active'));
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

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
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await ProductService.createProduct(formData);
      navigate(`${ERP_BASE_PATH}/products/${created.id}`);
    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err?.response?.data?.error?.message || 'Failed to create product record. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* PAGE HEADER */}
      <PageHeader
        title="Add New Product Master"
        description="Register a new engineered component, sub-assembly, or manufactured item in the Kolmeks ERP database."
        badge="Products Module"
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
                Product Code (Auto-Generated if empty)
              </label>
              <input
                type="text"
                name="product_code"
                placeholder="e.g. PRD-000101"
                value={formData.product_code}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Leave blank to automatically assign the next sequence code (PRD-XXXXXX).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Hydraulic Pump Casting Shaft"
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
                placeholder="Enter detailed technical description, functional role, or manufacturing specs..."
                value={formData.description}
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
                value={formData.category_id}
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
                placeholder="e.g. EN-GJL-250 / AISI 316L"
                value={formData.material}
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
                placeholder="e.g. DWG-8820-A"
                value={formData.part_number}
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
                placeholder="e.g. R0, Rev B"
                value={formData.revision}
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
              Initial Master Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active (Available for RFQs & Planning)</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/products`)}
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
            {isSubmitting ? 'Saving Master Record...' : 'Save Product Master'}
          </button>
        </div>
      </form>
    </div>
  );
};
