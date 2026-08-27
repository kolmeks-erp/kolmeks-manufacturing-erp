import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Edit,
  Power,
  Users,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  AlertCircle,
  Plus,
  Star,
  FileSpreadsheet,
} from 'lucide-react';
import { Customer, CustomerContact, CustomerStatus, ContactStatus } from '../../../types/customer';
import { CustomerService } from '../../../services/customer.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { ConfirmDialog } from '../../../components/erp/ConfirmDialog';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status Change Dialog State
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);

  // Contact Modal State
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<CustomerContact | null>(null);
  const [contactFormData, setContactFormData] = useState({
    first_name: '',
    last_name: '',
    job_title: '',
    email: '',
    phone: '',
    mobile: '',
    is_primary: false,
    status: 'active' as ContactStatus,
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState<boolean>(false);

  const fetchDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await CustomerService.getCustomerById(id);
      setCustomer(data);
    } catch (err: any) {
      console.error('Error fetching customer details:', err);
      setError(err?.response?.data?.error?.message || 'Failed to load customer profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleConfirmStatusChange = async () => {
    if (!customer) return;
    try {
      const nextStatus: CustomerStatus = customer.status === 'active' ? 'inactive' : 'active';
      const updated = await CustomerService.patchCustomerStatus(customer.id, nextStatus);
      setCustomer((prev) => (prev ? { ...prev, status: updated.status } : null));
      setStatusDialogOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to update status.');
    }
  };

  // Open Create / Edit Contact Modal
  const handleOpenCreateContact = () => {
    setEditingContact(null);
    setContactFormData({
      first_name: '',
      last_name: '',
      job_title: '',
      email: '',
      phone: '',
      mobile: '',
      is_primary: (customer?.contacts || []).length === 0,
      status: 'active',
    });
    setContactModalOpen(true);
  };

  const handleOpenEditContact = (c: CustomerContact) => {
    setEditingContact(c);
    setContactFormData({
      first_name: c.first_name,
      last_name: c.last_name,
      job_title: c.job_title || '',
      email: c.email || '',
      phone: c.phone || '',
      mobile: c.mobile || '',
      is_primary: c.is_primary,
      status: c.status,
    });
    setContactModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setIsSubmittingContact(true);
    try {
      if (editingContact) {
        await CustomerService.updateContact(customer.id, editingContact.id, contactFormData);
      } else {
        await CustomerService.createContact(customer.id, contactFormData);
      }
      setContactModalOpen(false);
      fetchDetails();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to save contact.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleToggleContactStatus = async (contact: CustomerContact) => {
    if (!customer) return;
    try {
      const nextStatus: ContactStatus = contact.status === 'active' ? 'inactive' : 'active';
      await CustomerService.patchContactStatus(customer.id, contact.id, nextStatus);
      fetchDetails();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to update contact status.');
    }
  };

  // Generate initials for avatar placeholder
  const getInitials = (name: string) => {
    if (!name) return 'CU';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3 animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <h3 className="text-lg font-bold">Customer Master Not Found</h3>
          <p className="text-xs">{error || 'The requested customer profile does not exist or has been removed.'}</p>
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/customers`)}
            className="mt-2 px-4 py-2 bg-[#0B1E36] text-white rounded-lg text-xs font-bold hover:bg-[#0F2C59]"
          >
            Back to Customers List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* PAGE HEADER */}
      <PageHeader
        title={`${customer.company_name}`}
        description={`Customer Code: ${customer.customer_code}`}
        badge="Customer Profile"
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

      {/* HERO PROFILE HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* LOGO INITIALS PLACEHOLDER */}
          <div className="w-16 h-16 rounded-xl bg-[#0B1E36] text-white font-mono font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
            {getInitials(customer.company_name)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {customer.customer_code}
              </span>
              <StatusBadge status={customer.status} />
              <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                {customer.industry || 'Industrial'}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900">{customer.company_name}</h1>
            {customer.legal_name && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">Legal Name: {customer.legal_name}</p>
            )}
          </div>
        </div>

        {/* ACTIONS TOOLBAR */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/customers/${customer.id}/edit`)}
            className="flex-1 md:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Customer
          </button>

          <button
            type="button"
            onClick={() => setStatusDialogOpen(true)}
            className={`flex-1 md:flex-initial px-4 py-2 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
              customer.status === 'active'
                ? 'bg-slate-700 hover:bg-slate-800'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {customer.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* INFORMATION CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: GENERAL & CONTACT INFO */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Company & Contact Details
          </h3>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-500 font-medium">Business Email</dt>
              <dd className="font-mono font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{customer.email || '—'}</span>
              </dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Phone</dt>
              <dd className="font-mono font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{customer.phone || '—'}</span>
              </dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Website</dt>
              <dd className="font-semibold text-blue-600 mt-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {customer.website ? (
                  <a href={customer.website} target="_blank" rel="noreferrer" className="hover:underline truncate">
                    {customer.website}
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Industry</dt>
              <dd className="font-semibold text-slate-900 mt-1">{customer.industry || '—'}</dd>
            </div>
          </dl>
        </div>

        {/* CARD 2: ADDRESS & LOCATION */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Address & Location
          </h3>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <dt className="text-slate-500 font-medium">Street Address</dt>
              <dd className="font-semibold text-slate-900 mt-1">{customer.address || '—'}</dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">City</dt>
              <dd className="font-semibold text-slate-900 mt-1">{customer.city || '—'}</dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">State / Province</dt>
              <dd className="font-semibold text-slate-900 mt-1">{customer.state || '—'}</dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Postal Code</dt>
              <dd className="font-mono font-semibold text-slate-900 mt-1">{customer.postal_code || '—'}</dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Country</dt>
              <dd className="font-semibold text-slate-900 mt-1">{customer.country || 'Finland'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* NOTES CARD */}
      {customer.notes && (
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Internal Account Notes
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{customer.notes}</p>
        </div>
      )}

      {/* BUSINESS CONTACTS SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Customer Contacts ({customer.contacts?.length || 0})
          </h3>

          <button
            type="button"
            onClick={handleOpenCreateContact}
            className="px-3 py-1.5 bg-[#0B1E36] hover:bg-[#0F2C59] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Contact
          </button>
        </div>

        {!customer.contacts || customer.contacts.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
            No contacts recorded for this customer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone / Mobile</th>
                  <th className="py-3 px-4">Primary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{c.job_title || '—'}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{c.email || '—'}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {c.mobile || c.phone || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {c.is_primary ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          Primary Contact
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditContact(c)}
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                        title="Edit Contact"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleContactStatus(c)}
                        className={`p-1 rounded transition-colors ${
                          c.status === 'active'
                            ? 'bg-red-50 hover:bg-red-100 text-red-600'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                        title={c.status === 'active' ? 'Deactivate Contact' : 'Activate Contact'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LINKED RFQS SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          Recent Linked RFQs ({customer.rfqs?.length || 0})
        </h3>

        {!customer.rfqs || customer.rfqs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
            No linked RFQs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Request Number</th>
                  <th className="py-3 px-4">Project / Component</th>
                  <th className="py-3 px-4">Requirement Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.rfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{rfq.rfq_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{rfq.component_name || 'Manufacturing Request'}</td>
                    <td className="py-3 px-4 text-slate-600">{rfq.requirement_type || '—'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={rfq.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {new Date(rfq.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRM DIALOG FOR STATUS CHANGE */}
      {statusDialogOpen && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setStatusDialogOpen(false)}
          onConfirm={handleConfirmStatusChange}
          title={`${customer.status === 'active' ? 'Deactivate' : 'Activate'} Customer Master`}
          message={`Are you sure you want to ${
            customer.status === 'active' ? 'deactivate' : 'activate'
          } customer "${customer.company_name}" (${customer.customer_code})?`}
          confirmText={customer.status === 'active' ? 'Deactivate Customer' : 'Activate Customer'}
          isDangerous={customer.status === 'active'}
        />
      )}

      {/* ADD / EDIT CONTACT MODAL */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                {editingContact ? 'Edit Contact Person' : 'Add Business Contact'}
              </h3>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactFormData.first_name}
                    onChange={(e) => setContactFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactFormData.last_name}
                    onChange={(e) => setContactFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Job Title / Position
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Procurement Manager"
                  value={contactFormData.job_title}
                  onChange={(e) => setContactFormData((prev) => ({ ...prev, job_title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. name@company.com"
                  value={contactFormData.email}
                  onChange={(e) => setContactFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Office Phone
                  </label>
                  <input
                    type="text"
                    value={contactFormData.phone}
                    onChange={(e) => setContactFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={contactFormData.mobile}
                    onChange={(e) => setContactFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={contactFormData.is_primary}
                  onChange={(e) => setContactFormData((prev) => ({ ...prev, is_primary: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="is_primary" className="font-semibold text-slate-700 cursor-pointer">
                  Set as Primary Contact Person
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="px-4 py-2 bg-[#0B1E36] hover:bg-[#0F2C59] text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {isSubmittingContact ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
