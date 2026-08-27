import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  FileCode,
  Download,
  ExternalLink,
  MessageSquare,
  History,
  CheckCircle2,
  Link2,
  Boxes,
  Send,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { RFQItem, RFQNote, RFQActivity } from '../../../types/rfq';
import { RFQService } from '../../../services/rfq.service';
import { CustomerService } from '../../../services/customer.service';
import { ProductService } from '../../../services/product.service';
import { employeeService } from '../../../services/employee.service';
import { Customer } from '../../../types/customer';
import { Product } from '../../../types/product';
import { Employee } from '../../../types/employee';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { Modal } from '../../../components/erp/Modal';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const RFQDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState<RFQItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status Change State
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState<string | null>(null);

  // Private Internal Notes State
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  // Customer Linking Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [isLinkingCustomer, setIsLinkingCustomer] = useState<boolean>(false);

  // Product Linking Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState<string>('');
  const [isLinkingProduct, setIsLinkingProduct] = useState<boolean>(false);

  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [isUpdatingAssign, setIsUpdatingAssign] = useState<boolean>(false);

  const fetchRFQDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await RFQService.getRFQById(id);
      if (res.success) {
        setRfq(res.data);
      } else {
        setError('RFQ record not found.');
      }
    } catch (err: any) {
      console.error('Error fetching RFQ details:', err);
      setError(err.response?.data?.message || 'Unable to load RFQ record.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRFQDetails();
  }, [fetchRFQDetails]);

  // Handle Status Update
  const handleStatusChange = async (newStatus: string) => {
    if (!id || !rfq || newStatus === rfq.status) return;
    setIsUpdatingStatus(true);
    setStatusSuccessMsg(null);
    try {
      const res = await RFQService.updateStatus(id, newStatus);
      if (res.success) {
        setStatusSuccessMsg(res.message);
        setRfq((prev) => (prev ? { ...prev, status: newStatus } : null));
        fetchRFQDetails(); // Reload activities
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update RFQ status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Post Internal Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNoteText.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await RFQService.addNote(id, newNoteText.trim());
      if (res.success) {
        setNewNoteText('');
        fetchRFQDetails(); // Refresh notes & activity timeline
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to post internal note.');
    } finally {
      setIsAddingNote(false);
    }
  };

  // Open & Load Customer Picker
  const handleOpenCustomerModal = async () => {
    setIsCustomerModalOpen(true);
    try {
      const res = await CustomerService.getCustomers({ limit: 50 });
      if (res.success) setCustomersList(res.data);
    } catch (err) {
      console.error('Failed loading customers list:', err);
    }
  };

  const handleLinkCustomer = async (customerId: string | null) => {
    if (!id) return;
    setIsLinkingCustomer(true);
    try {
      const res = await RFQService.linkCustomer(id, customerId);
      if (res.success) {
        setIsCustomerModalOpen(false);
        fetchRFQDetails();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to link customer.');
    } finally {
      setIsLinkingCustomer(false);
    }
  };

  // Open & Load Product Picker
  const handleOpenProductModal = async () => {
    setIsProductModalOpen(true);
    try {
      const res = await ProductService.getProducts({ limit: 50 });
      if (res.success) setProductsList(res.data);
    } catch (err) {
      console.error('Failed loading products list:', err);
    }
  };

  const handleLinkProduct = async (productId: string | null) => {
    if (!id) return;
    setIsLinkingProduct(true);
    try {
      const res = await RFQService.linkProduct(id, productId);
      if (res.success) {
        setIsProductModalOpen(false);
        fetchRFQDetails();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to link product.');
    } finally {
      setIsLinkingProduct(false);
    }
  };

  // Open & Load Staff Picker
  const handleOpenAssignModal = async () => {
    setIsAssignModalOpen(true);
    try {
      const res = await employeeService.getEmployees({ limit: 50, status: 'active' });
      if (res.success) setEmployeesList(res.data);
    } catch (err) {
      console.error('Failed loading employees list:', err);
    }
  };

  const handleAssignUser = async (userId: string | null) => {
    if (!id) return;
    setIsUpdatingAssign(true);
    try {
      const res = await RFQService.updateAssignment(id, userId);
      if (res.success) {
        setIsAssignModalOpen(false);
        fetchRFQDetails();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update assignment.');
    } finally {
      setIsUpdatingAssign(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading RFQ workspace details...</p>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Unable to load RFQ</h3>
        <p className="text-xs text-slate-500 mb-4">{error || 'RFQ record was not found.'}</p>
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/rfqs`)}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
        >
          Return to RFQs List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TOP BACK BAR & TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/rfqs`)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to RFQs List
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 font-mono tracking-tight">{rfq.rfq_number}</h1>
            <StatusBadge status={rfq.status} />
          </div>
        </div>

        {/* ACTIONS & STATUS SELECTOR */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/quotations/new?rfq_id=${rfq.id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4" />
            Create Quotation from RFQ
          </button>

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500 pl-2">Status:</span>
            <select
              value={rfq.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden disabled:opacity-50"
            >
              <option value="NEW">NEW (Unreviewed)</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="NEED_MORE_INFORMATION">NEED_MORE_INFORMATION</option>
              <option value="QUOTATION_PREPARATION">QUOTATION_PREPARATION</option>
              <option value="QUOTED">QUOTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>
      </div>

      {statusSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusSuccessMsg}</span>
        </div>
      )}

      {/* MAIN TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: CUSTOMER, TECHNICAL REQUIREMENTS, FILES */}
        <div className="lg:col-span-2 space-y-6">
          {/* CUSTOMER INFORMATION CARD */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Customer & Contact Information</h2>
              </div>

              {rfq.customer_master ? (
                <Link
                  to={`${ERP_BASE_PATH}/customers/${rfq.customer_master.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Customer Profile
                </Link>
              ) : (
                <button
                  onClick={handleOpenCustomerModal}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Link to Customer Master
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium mb-1">Company Name</span>
                <span className="font-semibold text-slate-800 text-sm">{rfq.company}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Contact Name</span>
                <span className="font-medium text-slate-800">{rfq.full_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Business Email</span>
                <a href={`mailto:${rfq.email}`} className="text-blue-600 font-medium hover:underline">
                  {rfq.email}
                </a>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Phone Number</span>
                <span className="text-slate-800 font-medium">{rfq.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Country / Region</span>
                <span className="text-slate-800 font-medium">{rfq.country}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Customer Link Status</span>
                {rfq.customer_master ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    Linked ({rfq.customer_master.customer_code})
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                    Customer Not Linked
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* PROJECT & TECHNICAL REQUIREMENTS CARD */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Manufacturing & Project Requirements</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <span className="text-slate-400 block font-medium mb-1">Project / Part Name</span>
                <span className="font-semibold text-slate-900 text-sm">{rfq.component_name}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block font-medium mb-1">Project Description</span>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-800 leading-relaxed font-normal">
                  {rfq.description || 'No description provided.'}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Requirement Type</span>
                <span className="font-medium text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                  {rfq.requirement_type}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Estimated Quantity</span>
                <span className="font-mono font-semibold text-slate-900 text-sm">
                  {rfq.quantity.toLocaleString()} {rfq.unit || 'Pcs'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Target Delivery Date</span>
                <span className="font-medium text-slate-800">
                  {rfq.target_date
                    ? new Date(rfq.target_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Raw Material</span>
                <span className="font-medium text-slate-800">{rfq.material || 'Standard alloy / specified in drawing'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Surface Finish</span>
                <span className="font-medium text-slate-800">{rfq.surface_finish || 'As machined'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Tolerance Requirements</span>
                <span className="font-medium text-slate-800">{rfq.tolerance_requirements || 'Standard ISO 2768-m'}</span>
              </div>
            </div>
          </div>

          {/* OPTIONAL PRODUCT LINK CARD */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">Product Master Relationship (Optional)</h2>
              </div>

              {rfq.product_master ? (
                <Link
                  to={`${ERP_BASE_PATH}/products/${rfq.product_master.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Product Master
                </Link>
              ) : (
                <button
                  onClick={handleOpenProductModal}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Link Product Master
                </button>
              )}
            </div>

            {rfq.product_master ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium mb-1">Product Code</span>
                  <span className="font-mono font-semibold text-slate-900">{rfq.product_master.product_code}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium mb-1">Product Name</span>
                  <span className="font-medium text-slate-800">{rfq.product_master.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium mb-1">Drawing / Rev</span>
                  <span className="font-mono text-slate-700">
                    {rfq.product_master.drawing_number || 'N/A'} ({rfq.product_master.revision || 'R0'})
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No existing product master record is linked to this RFQ. Linking is optional and recommended if this quote matches a standard manufactured component.
              </p>
            )}
          </div>

          {/* UPLOADED CAD & TECHNICAL FILES CARD */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileCode className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">Engineering Documents & CAD Files</h2>
            </div>

            {!rfq.attachments || rfq.attachments.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No technical files or drawings were uploaded by the customer for this RFQ.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {rfq.attachments.map((file) => (
                  <div key={file.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <FileCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{file.file_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'Unknown size'} • {file.mime_type || 'CAD / Document'}
                        </div>
                      </div>
                    </div>

                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Access File
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ASSIGNMENT, PRIVATE NOTES, ACTIVITY TIMELINE */}
        <div className="space-y-6">
          {/* ASSIGNMENT CARD */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">RFQ Assignment</h2>
              </div>
              <button
                onClick={handleOpenAssignModal}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Change
              </button>
            </div>

            <div className="text-xs">
              {rfq.assigned_user ? (
                <div className="flex items-center gap-3 bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    {rfq.assigned_user.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{rfq.assigned_user.full_name}</div>
                    <div className="text-[11px] text-slate-500">{rfq.assigned_user.email}</div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg text-slate-500 italic text-center">
                  This RFQ is currently unassigned. Click 'Change' to assign an engineer or sales manager.
                </div>
              )}
            </div>
          </div>

          {/* PRIVATE INTERNAL TEAM NOTES */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-5 h-5 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Private Team Notes</h2>
            </div>

            {/* ADD NOTE FORM */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add private internal note (not visible to public/customer)..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-hidden transition-all"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingNote || !newNoteText.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Note
                </button>
              </div>
            </form>

            {/* NOTES LIST */}
            <div className="space-y-3 pt-2 max-h-80 overflow-y-auto pr-1">
              {!rfq.notes || rfq.notes.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-2">No internal notes posted yet.</p>
              ) : (
                rfq.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{note.author_name}</span>
                      <span className="text-slate-400">
                        {new Date(note.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-normal whitespace-pre-line">{note.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AUDIT ACTIVITY TIMELINE */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <History className="w-5 h-5 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Audit Activity Timeline</h2>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {!rfq.activities || rfq.activities.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-2">No activity events recorded.</p>
              ) : (
                rfq.activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-800">{act.description}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {act.actor_name} •{' '}
                        {new Date(act.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER LINK PICKER MODAL */}
      <Modal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} title="Link to Customer Master">
        <div className="space-y-4 text-xs">
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="Search customers by company or code..."
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {customersList
              .filter(
                (c) =>
                  c.company_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.customer_code.toLowerCase().includes(customerSearch.toLowerCase())
              )
              .map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => handleLinkCustomer(cust.id)}
                  className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-800">{cust.company_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{cust.customer_code}</div>
                  </div>
                  <span className="text-blue-600 font-medium">Link</span>
                </div>
              ))}
          </div>
          {rfq.customer_id && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => handleLinkCustomer(null)}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-xs transition-colors"
              >
                Unlink Customer
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* PRODUCT LINK PICKER MODAL */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Link to Product Master">
        <div className="space-y-4 text-xs">
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products by name or code..."
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {productsList
              .filter(
                (p) =>
                  p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                  p.product_code.toLowerCase().includes(productSearch.toLowerCase())
              )
              .map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleLinkProduct(prod.id)}
                  className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-800">{prod.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{prod.product_code}</div>
                  </div>
                  <span className="text-purple-600 font-medium">Link</span>
                </div>
              ))}
          </div>
          {rfq.product_id && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => handleLinkProduct(null)}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-xs transition-colors"
              >
                Unlink Product
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* ASSIGNMENT STAFF PICKER MODAL */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign RFQ to Staff">
        <div className="space-y-4 text-xs">
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {employeesList.map((emp) => (
              <div
                key={emp.id}
                onClick={() => handleAssignUser(emp.id)}
                className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-800">{emp.first_name} {emp.last_name}</div>
                  <div className="text-[11px] text-slate-400">{emp.designation} • {emp.email}</div>
                </div>
                <span className="text-blue-600 font-medium">Assign</span>
              </div>
            ))}
          </div>
          {rfq.assigned_to && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => handleAssignUser(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition-colors"
              >
                Unassign
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
