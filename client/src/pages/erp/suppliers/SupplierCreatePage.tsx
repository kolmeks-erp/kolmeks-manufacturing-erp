import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle, Building2, Truck, ShieldAlert } from 'lucide-react';
import { SupplierFormData, Supplier, SupplierType, SupplierStatus } from '../../../types/supplier';
import { SupplierService } from '../../../services/supplier.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const SupplierCreatePage: React.FC = () => {
  const navigate = useNavigate();

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

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Soft Duplicate Warning
  const [duplicates, setDuplicates] = useState<Supplier[]>([]);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState<boolean>(false);

  // Check duplicate vendor on debounced input
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.company_name.trim().length >= 3 || formData.email || formData.website) {
        setIsCheckingDuplicate(true);
        try {
          const dupes = await SupplierService.checkDuplicate(
            formData.company_name.trim(),
            formData.email?.trim(),
            formData.website?.trim()
          );
          setDuplicates(dupes);
        } catch (err) {
          console.error('Failed to check duplicate vendor:', err);
        } finally {
          setIsCheckingDuplicate(false);
        }
      } else {
        setDuplicates([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.company_name, formData.email, formData.website]);

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

    if (!formData.company_name.trim()) {
      setError('Company Name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await SupplierService.createSupplier(formData);
      navigate(`${ERP_BASE_PATH}/suppliers/${created.id}`);
    } catch (err: any) {
      console.error('Error creating supplier:', err);
      setError(err?.response?.data?.error?.message || 'Failed to create supplier master record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* PAGE HEADER */}
      <PageHeader
        title="Add New Supplier"
        description="Register a new B2B supplier, component vendor, raw material provider, or service contractor."
        badge="Procurement Module"
        actions={
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/suppliers`)}
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
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* DUPLICATE VENDOR WARNING BANNER */}
      {duplicates.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Potential Duplicate Supplier Records Detected ({duplicates.length})</span>
          </div>
          <p className="text-[11px] text-amber-800">
            Similar supplier records already exist in the database. Please review existing vendors before creating a duplicate.
          </p>
          <div className="divide-y divide-amber-200/60 bg-white/70 rounded-lg p-2.5 space-y-1 text-slate-800">
            {duplicates.map((d) => (
              <div key={d.id} className="pt-1 first:pt-0 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{d.company_name}</span>{' '}
                  <span className="font-mono text-slate-500">({d.supplier_code})</span> —{' '}
                  <span className="text-slate-600">{d.email || d.website || 'No contact'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/${d.id}`)}
                  className="text-[11px] font-bold text-blue-700 hover:underline"
                >
                  View Existing
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: COMPANY INFORMATION */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            1. Company Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                required
                placeholder="e.g. Outokumpu Stainless Oy"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Legal Registered Name
              </label>
              <input
                type="text"
                name="legal_name"
                placeholder="e.g. Outokumpu Stainless Steel Oy"
                value={formData.legal_name || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Supplier Type <span className="text-red-500">*</span>
              </label>
              <select
                name="supplier_type"
                value={formData.supplier_type}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="RAW_MATERIAL">Raw Material Provider</option>
                <option value="COMPONENT">Component Manufacturer</option>
                <option value="SERVICE">Service Provider / Contractor</option>
                <option value="EQUIPMENT">Equipment & Tooling Supplier</option>
                <option value="LOGISTICS">Logistics & Freight Provider</option>
                <option value="OTHER">Other Supplier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Industry Sector
              </label>
              <select
                name="industry"
                value={formData.industry || 'Raw Materials'}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Raw Materials">Raw Materials</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="CNC Tooling">CNC Tooling & Machining</option>
                <option value="Logistics">Logistics & Freight</option>
                <option value="Industrial Manufacturing">Industrial Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Website URL
              </label>
              <input
                type="text"
                name="website"
                placeholder="e.g. https://www.outokumpu.com"
                value={formData.website || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT INFORMATION */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            2. Business Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Business Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g. sales@supplier.fi"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                placeholder="e.g. +358 20 123 4567"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: ADDRESS */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            3. Address & Location
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                placeholder="e.g. Salmisaarenaukio 1"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                placeholder="e.g. Helsinki"
                value={formData.city || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                State / Province
              </label>
              <input
                type="text"
                name="state"
                placeholder="e.g. Uusimaa"
                value={formData.state || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postal_code"
                placeholder="e.g. 00180"
                value={formData.postal_code || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country || 'Finland'}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: STATUS & NOTES */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            4. Supplier Status & Notes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
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
                <option value="pending_approval">Pending Approval</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Internal Procurement Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Specific manufacturing qualifications, preferred freight carriers, ISO certifications, or payment terms..."
                value={formData.notes || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/suppliers`)}
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
            {isSubmitting ? 'Saving Supplier...' : 'Create Supplier Master'}
          </button>
        </div>
      </form>
    </div>
  );
};
