import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, AlertCircle } from 'lucide-react';
import { CustomerFormData, CustomerStatus } from '../../../types/customer';
import { CustomerService } from '../../../services/customer.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const CustomerEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customerCode, setCustomerCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CustomerFormData>({
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
    industry: 'Industrial Manufacturing',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const cust = await CustomerService.getCustomerById(id);
        setCustomerCode(cust.customer_code);
        setFormData({
          company_name: cust.company_name || '',
          legal_name: cust.legal_name || '',
          email: cust.email || '',
          phone: cust.phone || '',
          website: cust.website || '',
          country: cust.country || 'Finland',
          state: cust.state || '',
          city: cust.city || '',
          postal_code: cust.postal_code || '',
          address: cust.address || '',
          industry: cust.industry || 'Other',
          status: cust.status || 'active',
          notes: cust.notes || '',
        });
      } catch (err: any) {
        console.error('Error loading customer for edit:', err);
        setError(err?.response?.data?.error?.message || 'Failed to load customer profile.');
      } finally {
        setIsLoading(false);
      }
    };
    loadCustomer();
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
      await CustomerService.updateCustomer(id, formData);
      navigate(`${ERP_BASE_PATH}/customers/${id}`);
    } catch (err: any) {
      console.error('Error updating customer:', err);
      setError(err?.response?.data?.error?.message || 'Failed to update customer master record.');
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
        title={`Edit Customer: ${customerCode}`}
        description="Update corporate identity, contact details, address, or business notes for this client master record."
        badge="Sales Module"
        actions={
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/customers/${id}`)}
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
                Customer Code (Locked)
              </label>
              <input
                type="text"
                disabled
                value={customerCode}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                required
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
                value={formData.legal_name || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Industry Sector
              </label>
              <select
                name="industry"
                value={formData.industry || 'Other'}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Industrial Manufacturing">Industrial Manufacturing</option>
                <option value="Automotive">Automotive</option>
                <option value="Electrical">Electrical & Motors</option>
                <option value="Engineering">Engineering & Machinery</option>
                <option value="Aerospace">Aerospace & Marine</option>
                <option value="Energy">Energy & Utilities</option>
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
            4. Business Status & Notes
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
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Internal Business Notes
              </label>
              <textarea
                name="notes"
                rows={3}
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
            onClick={() => navigate(`${ERP_BASE_PATH}/customers/${id}`)}
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
            {isSubmitting ? 'Updating Master...' : 'Update Customer Master'}
          </button>
        </div>
      </form>
    </div>
  );
};
