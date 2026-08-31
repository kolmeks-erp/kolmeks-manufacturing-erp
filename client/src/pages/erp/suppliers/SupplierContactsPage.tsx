import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Plus, Edit, Power, Star, AlertCircle } from 'lucide-react';
import { Supplier, SupplierContact, ContactFormData, ContactStatus } from '../../../types/supplier';
import { SupplierService } from '../../../services/supplier.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const SupplierContactsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [contacts, setContacts] = useState<SupplierContact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<SupplierContact | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    first_name: '',
    last_name: '',
    job_title: '',
    email: '',
    phone: '',
    mobile: '',
    is_primary: false,
    status: 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [sup, contactList] = await Promise.all([
        SupplierService.getSupplierById(id),
        SupplierService.getContacts(id),
      ]);
      setSupplier(sup);
      setContacts(contactList);
    } catch (err: any) {
      console.error('Error loading supplier contacts:', err);
      setError(err?.response?.data?.error?.message || 'Failed to load contacts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleOpenCreateModal = () => {
    setEditingContact(null);
    setFormData({
      first_name: '',
      last_name: '',
      job_title: '',
      email: '',
      phone: '',
      mobile: '',
      is_primary: contacts.length === 0,
      status: 'active',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (c: SupplierContact) => {
    setEditingContact(c);
    setFormData({
      first_name: c.first_name,
      last_name: c.last_name,
      job_title: c.job_title || '',
      email: c.email || '',
      phone: c.phone || '',
      mobile: c.mobile || '',
      is_primary: c.is_primary,
      status: c.status,
    });
    setModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!formData.first_name.trim() || !formData.last_name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingContact) {
        await SupplierService.updateContact(id, editingContact.id, formData);
      } else {
        await SupplierService.createContact(id, formData);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to save contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (c: SupplierContact) => {
    if (!id) return;
    try {
      const nextStatus: ContactStatus = c.status === 'active' ? 'inactive' : 'active';
      await SupplierService.patchContactStatus(id, c.id, nextStatus);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to change contact status.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3 animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-800 dark:text-slate-100">
      {/* PAGE HEADER */}
      <PageHeader
        title={`Supplier Contacts — ${supplier?.company_name || 'Supplier'}`}
        description={`Manage key corporate representatives, procurement managers, and technical contacts for ${supplier?.supplier_code || 'Supplier'}.`}
        badge="Procurement Module"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/${id}`)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Supplier</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        }
      />

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-rose-950/60 border border-red-200 dark:border-rose-800/60 rounded-xl text-red-700 dark:text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CONTACTS TABLE */}
      {contacts.length === 0 ? (
        <div className="bg-white dark:bg-[#0F2647] p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
          <Users className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No contact persons recorded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Add supplier representatives for sales management, quality assurance, or logistics coordination.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F2647] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B1E36] text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Contact Person</th>
                  <th className="py-3.5 px-5">Job Title</th>
                  <th className="py-3.5 px-5">Email</th>
                  <th className="py-3.5 px-5">Phone / Mobile</th>
                  <th className="py-3.5 px-5">Primary</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans text-slate-800 dark:text-slate-200 bg-white dark:bg-[#0F2647]">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-[#163761]/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 font-medium">{c.job_title || '—'}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-700 dark:text-slate-300">{c.email || '—'}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-600 dark:text-slate-400">
                      {c.mobile || c.phone || '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      {c.is_primary ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-[10px]">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          Primary Contact
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                        title="Edit Contact"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c)}
                        className={`p-1.5 rounded-lg transition-colors border ${
                          c.status === 'active'
                            ? 'bg-red-50 dark:bg-rose-950/60 hover:bg-red-100 dark:hover:bg-rose-900/60 text-red-600 dark:text-rose-300 border-red-200 dark:border-rose-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
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
        </div>
      )}

      {/* ADD / EDIT CONTACT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F2647] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1E36] flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {editingContact ? 'Edit Contact Representative' : 'Add Supplier Representative'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Job Title / Position
                </label>
                <input
                  type="text"
                  placeholder="e.g. Key Account Manager"
                  value={formData.job_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, job_title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. rep@supplier.fi"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Office Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071220] border border-slate-300 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modal_supplier_is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_primary: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-slate-100 dark:bg-[#071220] border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="modal_supplier_is_primary" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Set as Primary Supplier Contact
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Representative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
