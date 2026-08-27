import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { CustomerFormData, Customer } from '../../../types/customer';
import { CustomerService } from '../../../services/customer.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const CustomerCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Duplicate match warning state
  const [duplicateMatches, setDuplicateMatches] = useState<Customer[]>([]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Check duplicate on blur of company name or email
  const handleCheckDuplicate = async () => {
    if (!formData.company_name.trim() && !formData.email?.trim()) return;
    try {
      const matches = await CustomerService.checkDuplicate(
        formData.company_name,
        formData.email,
        formData.website
      );
      setDuplicateMatches(matches);
    } catch (err) {
      console.error('Failed checking duplicate customer:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.company_name.trim()) {
      setError('Company Name is required.');
      return;
    }

    if (formData.company_name.trim().length < 2) {
      setError('Company Name must be at least 2 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await CustomerService.createCustomer(formData);
      navigate(`${ERP_BASE_PATH}/customers/${created.id}`);
    } catch (err: any) {
      console.error('Error creating customer:', err);
      setError(err?.response?.data?.error?.message || 'Failed to create customer master record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* PAGE HEADER */}
      <PageHeader
        title="Add New Customer Master"
        description="Register a new client organization in the Kolmeks Manufacturing ERP database."
        badge="Sales Module"
        actions={
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/customers`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Customers</span>
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

      {/* DUPLICATE DETECTION WARNING */}
      {duplicateMatches.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Potential Duplicate Customer Detected ({duplicateMatches.length} match)</span>
          </div>
          <p className="text-[11px] text-amber-700">
            Existing customer records match your entered company name or business email:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px] font-medium text-amber-900">
            {duplicateMatches.map((match) => (
              <li key={match.id}>
                <span className="font-bold">{match.company_name}</span> ({match.customer_code}) — {match.email || 'No email'}
              </li>
            ))}
          </ul>
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
                placeholder="e.g. Wärtsilä Corporation"
                value={formData.company_name}
                onChange={handleChange}
                onBlur={handleCheckDuplicate}
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
                placeholder="e.g. Wärtsilä Finland Oy"
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
                value={formData.industry}
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Website URL
              </label>
              <input
                type="text"
                name="website"
                placeholder="e.g. https://www.wartsila.com"
                value={formData.website || ''}
                onChange={handleChange}
                onBlur={handleCheckDuplicate}
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
                placeholder="e.g. procurement@wartsila.com"
                value={formData.email || ''}
                onChange={handleChange}
                onBlur={handleCheckDuplicate}
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
                placeholder="e.g. +358 10 709 0000"
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
                placeholder="e.g. Hiililaitoranta 1"
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
                placeholder="e.g. Finland"
                value={formData.country}
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
                <option value="active">Active (Available for RFQs & Planning)</option>
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
                placeholder="Enter internal account notes, key client preferences, or operational instructions..."
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
            onClick={() => navigate(`${ERP_BASE_PATH}/customers`)}
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
            {isSubmitting ? 'Saving Client Master...' : 'Save Customer Master'}
          </button>
        </div>
      </form>
    </div>
  );
};
