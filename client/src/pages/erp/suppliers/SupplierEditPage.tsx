import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, AlertCircle } from 'lucide-react';
import { SupplierFormData, SupplierStatus, SupplierType } from '../../../types/supplier';
import { SupplierService } from '../../../services/supplier.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const SupplierEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [supplierCode, setSupplierCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SupplierFormData>({
    company_name: '',
    legal_name: '',
    email: '',
    phone: '',
    website: '',
    country: 'Finland',
    state: '',
    city: '',
    postal_code: '',
    address: '',
    industry: 'Raw Materials',
    supplier_type: 'COMPONENT',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    const loadSupplier = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const sup = await SupplierService.getSupplierById(id);
        setSupplierCode(sup.supplier_code);
        setFormData({
          company_name: sup.company_name || '',
          legal_name: sup.legal_name || '',
          email: sup.email || '',
          phone: sup.phone || '',
          website: sup.website || '',
          country: sup.country || 'Finland',
          state: sup.state || '',
          city: sup.city || '',
          postal_code: sup.postal_code || '',
          address: sup.address || '',
          industry: sup.industry || 'Raw Materials',
          supplier_type: sup.supplier_type || 'COMPONENT',
          status: sup.status || 'active',
          notes: sup.notes || '',
        });
      } catch (err: any) {
        console.error('Error loading supplier for edit:', err);
        setError(err?.response?.data?.error?.message || 'Failed to load supplier details.');
      } finally {
        setIsLoading(false);
      }
    };
    loadSupplier();
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

    if (!formData.company_name.trim()) {
      setError('Company Name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await SupplierService.updateSupplier(id, formData);
      navigate(`${ERP_BASE_PATH}/suppliers/${id}`);
    } catch (err: any) {
      console.error('Error updating supplier:', err);
      setError(err?.response?.data?.error?.message || 'Failed to update supplier record.');
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
    <div className="space-y-6 max-w-4xl mx-auto text-slate-800 dark:text-slate-100">
      {/* PAGE HEADER */}
      <PageHeader
        title={`Edit Supplier: ${supplierCode}`}
        description="Update corporate details, business contact info, address, or internal procurement notes for this vendor."
        badge="Procurement Module"
        actions={
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/${id}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        }
      />

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: COMPANY INFORMATION */}
        <div className="bg-white dark:bg-[#0F2647] p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            1. Company Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Supplier Code (Locked)
              </label>
              <input
                type="text"
                disabled
                value={supplierCode}
                className="w-full px-3.5 py-2 text-xs bg-slate-100 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-mono cursor-not-allowed font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                required
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Legal Registered Name
              </label>
              <input
                type="text"
                name="legal_name"
                value={formData.legal_name || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Supplier Type <span className="text-red-500">*</span>
              </label>
              <select
                name="supplier_type"
                value={formData.supplier_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium text-slate-900 dark:text-white"
              >
                <option value="RAW_MATERIAL" className="bg-white dark:bg-[#0F2647]">Raw Material Provider</option>
                <option value="COMPONENT" className="bg-white dark:bg-[#0F2647]">Component Manufacturer</option>
                <option value="SERVICE" className="bg-white dark:bg-[#0F2647]">Service Provider / Contractor</option>
                <option value="EQUIPMENT" className="bg-white dark:bg-[#0F2647]">Equipment & Tooling Supplier</option>
                <option value="LOGISTICS" className="bg-white dark:bg-[#0F2647]">Logistics & Freight Provider</option>
                <option value="OTHER" className="bg-white dark:bg-[#0F2647]">Other Supplier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Industry Sector
              </label>
              <select
                name="industry"
                value={formData.industry || 'Raw Materials'}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              >
                <option value="Raw Materials" className="bg-white dark:bg-[#0F2647]">Raw Materials</option>
                <option value="Electrical & Electronics" className="bg-white dark:bg-[#0F2647]">Electrical & Electronics</option>
                <option value="CNC Tooling" className="bg-white dark:bg-[#0F2647]">CNC Tooling & Machining</option>
                <option value="Logistics" className="bg-white dark:bg-[#0F2647]">Logistics & Freight</option>
                <option value="Industrial Manufacturing" className="bg-white dark:bg-[#0F2647]">Industrial Manufacturing</option>
                <option value="Other" className="bg-white dark:bg-[#0F2647]">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Website URL
              </label>
              <input
                type="text"
                name="website"
                value={formData.website || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT INFORMATION */}
        <div className="bg-white dark:bg-[#0F2647] p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            2. Business Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Business Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: ADDRESS */}
        <div className="bg-white dark:bg-[#0F2647] p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            3. Address & Location
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                State / Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country || 'Finland'}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: STATUS & NOTES */}
        <div className="bg-white dark:bg-[#0F2647] p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            4. Supplier Status & Notes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Master Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              >
                <option value="active" className="bg-white dark:bg-[#0F2647]">Active</option>
                <option value="inactive" className="bg-white dark:bg-[#0F2647]">Inactive</option>
                <option value="pending_approval" className="bg-white dark:bg-[#0F2647]">Pending Approval</option>
                <option value="blocked" className="bg-white dark:bg-[#0F2647]">Blocked</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Internal Procurement Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#071220] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white resize-y"
              />
            </div>
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/${id}`)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Updating Supplier...' : 'Update Supplier Master'}
          </button>
        </div>
      </form>
    </div>
  );
};
