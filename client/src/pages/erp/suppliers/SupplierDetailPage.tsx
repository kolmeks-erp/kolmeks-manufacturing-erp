import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  Edit,
  Power,
  Users,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  AlertCircle,
  Plus,
  Star,
} from 'lucide-react';
import { Supplier, SupplierStatus } from '../../../types/supplier';
import { SupplierService } from '../../../services/supplier.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { ConfirmDialog } from '../../../components/erp/ConfirmDialog';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const SupplierDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status toggle dialog
  const [confirmStatusOpen, setConfirmStatusOpen] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const loadSupplier = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await SupplierService.getSupplierById(id);
      setSupplier(data);
    } catch (err: any) {
      console.error('Error loading supplier profile:', err);
      setError(err?.response?.data?.error?.message || 'Failed to load supplier details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSupplier();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!supplier) return;
    setIsUpdatingStatus(true);
    try {
      const nextStatus: SupplierStatus = supplier.status === 'active' ? 'inactive' : 'active';
      await SupplierService.patchSupplierStatus(supplier.id, nextStatus);
      setConfirmStatusOpen(false);
      loadSupplier();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to toggle supplier status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3 animate-pulse" />
        <div className="h-44 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-xl border border-slate-200 text-center space-y-4 shadow-xs">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Supplier Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'The requested supplier record does not exist.'}</p>
        <button
          type="button"
          onClick={() => navigate(`${ERP_BASE_PATH}/suppliers`)}
          className="px-4 py-2 bg-[#0B1E36] text-white rounded-lg text-xs font-bold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Suppliers Directory
        </button>
      </div>
    );
  }

  const initials = supplier.company_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const primaryContact = supplier.contacts?.find((c) => c.is_primary) || supplier.contacts?.[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* PAGE HEADER */}
      <PageHeader
        title={`Supplier Profile: ${supplier.company_name}`}
        description={`Master procurement record for ${supplier.supplier_code}.`}
        badge="Procurement Module"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`${ERP_BASE_PATH}/suppliers`)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/${supplier.id}/contacts`)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Manage Contacts</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/${supplier.id}/edit`)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Supplier</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmStatusOpen(true)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
                supplier.status === 'active'
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{supplier.status === 'active' ? 'Deactivate' : 'Activate'}</span>
            </button>
          </div>
        }
      />

      {/* HEADER HERO CARD */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-[#0B1E36] text-white flex items-center justify-center font-bold text-xl font-mono tracking-wider shadow-inner shrink-0">
            {initials}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">{supplier.company_name}</h2>
              <StatusBadge status={supplier.status} />
            </div>
            {supplier.legal_name && (
              <p className="text-xs text-slate-500 italic mt-0.5">{supplier.legal_name}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2 font-mono">
              <span className="bg-slate-100 px-2.5 py-0.5 rounded font-bold text-blue-700">
                {supplier.supplier_code}
              </span>
              <span>•</span>
              <span className="uppercase text-slate-700 font-semibold">
                {supplier.supplier_type.replace('_', ' ')}
              </span>
              <span>•</span>
              <span>{supplier.industry || 'General Industry'}</span>
            </div>
          </div>
        </div>

        <div className="text-right text-xs space-y-1 text-slate-500 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 w-full md:w-auto">
          <div>
            Created: <span className="font-mono text-slate-800">{new Date(supplier.created_at).toLocaleDateString()}</span>
          </div>
          <div>
            Updated: <span className="font-mono text-slate-800">{new Date(supplier.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COLUMN 1: CORPORATE & CONTACT INFO */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Corporate & Communication Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-500 uppercase text-[10px]">Business Email</div>
                <div className="font-mono text-slate-900">{supplier.email || 'Not provided'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-500 uppercase text-[10px]">Phone Number</div>
                <div className="font-mono text-slate-900">{supplier.phone || 'Not provided'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-500 uppercase text-[10px]">Website</div>
                {supplier.website ? (
                  <a
                    href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-mono"
                  >
                    {supplier.website}
                  </a>
                ) : (
                  <div className="text-slate-400">Not provided</div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-500 uppercase text-[10px]">Address / Location</div>
                <div className="text-slate-900">
                  {supplier.address || ''}
                  {supplier.city && `, ${supplier.city}`}
                  {supplier.state && `, ${supplier.state}`}
                  {supplier.postal_code && ` ${supplier.postal_code}`}
                </div>
                <div className="font-bold text-slate-800">{supplier.country}</div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: PRIMARY CONTACT & INTERNAL NOTES */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Primary Contact & Classification
          </h3>

          {primaryContact ? (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {primaryContact.first_name} {primaryContact.last_name}
                </span>
                {primaryContact.is_primary && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    Primary Contact
                  </span>
                )}
              </div>
              <div className="text-slate-600 font-medium">{primaryContact.job_title || 'Contact Person'}</div>
              <div className="font-mono text-slate-700">{primaryContact.email || 'No email'}</div>
              <div className="font-mono text-slate-600">{primaryContact.mobile || primaryContact.phone || ''}</div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-xs text-center">
              No contacts recorded for this supplier yet.
            </div>
          )}

          <div className="pt-2 space-y-2">
            <div className="font-bold text-slate-500 uppercase text-[10px]">Internal Procurement Notes</div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 min-h-[80px] whitespace-pre-wrap font-sans">
              {supplier.notes || 'No internal procurement notes recorded.'}
            </div>
          </div>
        </div>
      </div>

      {/* SUPPLIER CONTACTS SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Supplier Contacts Directory ({supplier.contacts?.length || 0})
            </h3>
            <p className="text-xs text-slate-500">
              Key account managers, sales reps, quality engineers, and logistics contacts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/suppliers/${supplier.id}/contacts`)}
            className="px-3 py-1.5 bg-[#0B1E36] hover:bg-[#0F2C59] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Manage Contacts
          </button>
        </div>

        {!supplier.contacts || supplier.contacts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No contact persons listed. Click "Manage Contacts" to add business contacts.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Name</th>
                  <th className="py-3 px-5">Job Title</th>
                  <th className="py-3 px-5">Email</th>
                  <th className="py-3 px-5">Phone / Mobile</th>
                  <th className="py-3 px-5">Primary</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplier.contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-5 font-bold text-slate-900">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="py-3 px-5 text-slate-700">{c.job_title || '—'}</td>
                    <td className="py-3 px-5 font-mono text-slate-700">{c.email || '—'}</td>
                    <td className="py-3 px-5 font-mono text-slate-600">{c.mobile || c.phone || '—'}</td>
                    <td className="py-3 px-5">
                      {c.is_primary ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          Primary
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-5">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRM STATUS TOGGLE DIALOG */}
      <ConfirmDialog
        isOpen={confirmStatusOpen}
        title="Change Supplier Status?"
        message={`Are you sure you want to change the operational status for supplier "${supplier.company_name}" from ${supplier.status} to ${supplier.status === 'active' ? 'inactive' : 'active'}?`}
        confirmText={supplier.status === 'active' ? 'Deactivate Supplier' : 'Activate Supplier'}
        onConfirm={handleToggleStatus}
        onClose={() => setConfirmStatusOpen(false)}
      />
    </div>
  );
};
