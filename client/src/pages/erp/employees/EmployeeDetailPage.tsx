import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Edit, UserX, Mail, Phone, MapPin, Calendar, Briefcase, AlertCircle,
  Clock, ShieldCheck, Award, FileText, CheckCircle2, AlertTriangle, Layers, Lock,
  TrendingUp, RefreshCw, UserCheck, Plus, Building2, Package
} from 'lucide-react';

import { employeeService } from '../../../services/employee.service';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { ErrorState } from '../../../components/erp/ErrorState';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ConfirmDialog } from '../../../components/erp/ConfirmDialog';

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'skills' | 'certifications' | 'documents' | 'assets' | 'notes'>('overview');
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  // Lifecycle Action Modal States
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResignOpen, setIsResignOpen] = useState(false);

  // Sub-resource Modal States
  const [isSkillOpen, setIsSkillOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  // Form Inputs
  const [skillForm, setSkillForm] = useState({ skill_name: '', proficiency_level: 'INTERMEDIATE', years_of_experience: 1 });
  const [certForm, setCertForm] = useState({ certification_name: '', issuing_organization: '', issue_date: '', expiry_date: '' });
  const [docForm, setDocForm] = useState({ document_type: 'OFFER_LETTER', document_name: '', file_url: '', notes: '', expiry_date: '' });
  const [noteText, setNoteText] = useState('');

  const [transferForm, setTransferForm] = useState({ new_department_id: '', new_manager_id: '', new_location: '', reason: '' });
  const [promoteForm, setPromoteForm] = useState({ new_designation: '', reason: '' });

  const {
    data: employee,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getEmployeeById(id!),
    enabled: !!id,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => employeeService.getDepartments(),
  });

  const { data: employeesList } = useQuery({
    queryKey: ['employees_list_simple'],
    queryFn: () => employeeService.getEmployees({ limit: 100 }),
  });

  const statusMutation = useMutation({
    mutationFn: () => employeeService.patchStatus(id!, 'INACTIVE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      setIsDeactivateOpen(false);
    },
  });

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employeeService.addSkill(id!, skillForm);
      setIsSkillOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to add skill');
    }
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employeeService.addCertification(id!, certForm);
      setIsCertOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to add certification');
    }
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employeeService.addDocument(id!, docForm);
      setIsDocOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employeeService.addHRNote(id!, { note: noteText });
      setIsNoteOpen(false);
      setNoteText('');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employeeService.transferEmployee(id!, transferForm);
      setIsTransferOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Transfer failed');
    }
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employeeService.promoteEmployee(id!, promoteForm);
      setIsPromoteOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Promotion failed');
    }
  };

  if (isLoading) return <LoadingState label="Fetching employee profile..." rows={8} />;
  if (isError || !employee) return <ErrorState title="Employee Not Found" message="The requested record does not exist or you do not have permission." onRetry={() => refetch()} />;

  const initials = `${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`.toUpperCase();
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* TOP BACK BAR */}
      <div className="flex items-center justify-between">
        <Link
          to={`${ERP_BASE_PATH}/employees`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200"
          >
            Transfer
          </button>
          <button
            onClick={() => setIsPromoteOpen(true)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200"
          >
            Promote
          </button>
          <Link
            to={`${ERP_BASE_PATH}/employees/${employee.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Profile
          </Link>
          {employee.status === 'ACTIVE' && (
            <button
              onClick={() => setIsDeactivateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg"
            >
              <UserX className="w-3.5 h-3.5" /> Deactivate
            </button>
          )}
        </div>
      </div>

      {/* PROFILE HEADER CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-[#0B1E36] text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#0B1E36]">
                {employee.first_name} {employee.last_name}
              </h1>
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {employee.employee_code}
              </span>
              <StatusBadge status={employee.status} />
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {employee.designation} &bull; <span className="font-bold text-slate-800">{employee.department?.name || 'Unassigned'}</span> &bull; Location: <span className="font-semibold">{employee.location || 'Plant 1'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="border-b border-slate-200 flex gap-6 text-sm font-semibold text-slate-600 overflow-x-auto">
        {(['overview', 'history', 'skills', 'certifications', 'documents', 'assets', 'notes'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-[#0B1E36] text-sm border-b pb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" /> Employment & Organizational Placement
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Reporting Manager</span><span className="font-bold text-slate-900">{employee.manager ? `${employee.manager.first_name} ${employee.manager.last_name}` : 'None'}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Employment Type</span><span className="font-mono font-bold text-slate-800">{employee.employment_type}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Joining Date</span><span className="font-mono">{formatDate(employee.joining_date)}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Cost Center</span><span className="font-mono font-semibold text-slate-700">{employee.cost_center?.name || 'Unassigned'}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-[#0B1E36] text-sm border-b pb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> Contact & Emergency Details
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Email Address</span><span className="font-mono text-blue-900 font-bold">{employee.email}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Phone</span><span className="font-mono">{employee.phone || 'N/A'}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Emergency Contact</span><span className="font-bold text-slate-900">{employee.emergency_contact_name || 'N/A'} ({employee.emergency_contact_phone || 'N/A'})</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Employee Lifecycle & Audit Timeline
          </h3>
          {!employee.history || employee.history.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No lifecycle events recorded.</p>
          ) : (
            <div className="space-y-4 border-l-2 border-slate-200 ml-3 pl-4">
              {employee.history.map(item => (
                <div key={item.id} className="relative text-xs space-y-1">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                  <span className="font-bold uppercase text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{item.event_type}</span>
                  <span className="text-slate-500 ml-2 font-mono">{formatDate(item.event_date)}</span>
                  <p className="text-slate-700 mt-1">{item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Award className="w-4 h-4 text-emerald-600" /> Technical Skills & Competencies</h3>
            <button onClick={() => setIsSkillOpen(true)} className="px-3 py-1.5 text-xs bg-emerald-600 text-white font-bold rounded-lg flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Skill</button>
          </div>
          {!employee.skills || employee.skills.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No skills registered for this employee.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {employee.skills.map(s => (
                <div key={s.id} className="p-3 border rounded-lg bg-slate-50 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{s.skill_name}</div>
                    <div className="text-slate-500">{s.years_of_experience} yrs experience</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{s.proficiency_level}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'certifications' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-600" /> Certifications & Compliance</h3>
            <button onClick={() => setIsCertOpen(true)} className="px-3 py-1.5 text-xs bg-amber-600 text-white font-bold rounded-lg flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Certification</button>
          </div>
          {!employee.certifications || employee.certifications.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No certifications registered.</p>
          ) : (
            <div className="space-y-3">
              {employee.certifications.map(c => (
                <div key={c.id} className="p-3 border rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{c.certification_name}</div>
                    <div className="text-slate-500">{c.issuing_organization} &bull; Issued: {formatDate(c.issue_date)}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold ${c.status === 'VALID' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /> Private Employee Documents</h3>
            <button onClick={() => setIsDocOpen(true)} className="px-3 py-1.5 text-xs bg-blue-600 text-white font-bold rounded-lg flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Upload Document</button>
          </div>
          {!employee.documents || employee.documents.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No employee documents uploaded.</p>
          ) : (
            <div className="space-y-2">
              {employee.documents.map(d => (
                <div key={d.id} className="p-3 border rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{d.document_name}</div>
                    <div className="text-slate-500 uppercase">{d.document_type} &bull; Uploaded {formatDate(d.uploaded_at)}</div>
                  </div>
                  <a href={d.file_url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">View File</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Package className="w-4 h-4 text-purple-600" /> Assigned Company Fixed Assets</h3>
          {!employee.assets || employee.assets.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No company assets currently assigned to this employee.</p>
          ) : (
            <div className="space-y-2">
              {employee.assets.map((a: any) => (
                <div key={a.id} className="p-3 border rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{a.name}</div>
                    <div className="text-slate-500 font-mono">{a.asset_code} | Category: {a.category}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-red-600" /> Private HR Internal Notes</h3>
            <button onClick={() => setIsNoteOpen(true)} className="px-3 py-1.5 text-xs bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Private Note</button>
          </div>
          {!employee.notes || employee.notes.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No internal HR notes logged.</p>
          ) : (
            <div className="space-y-3">
              {employee.notes.map(n => (
                <div key={n.id} className="p-3 border border-red-100 bg-red-50/40 rounded-lg text-xs space-y-1">
                  <div className="text-slate-900">{n.note}</div>
                  <div className="text-slate-500 text-[10px] font-mono">By: {n.created_by_profile?.full_name || 'HR Admin'} on {formatDate(n.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900">Transfer Employee</h3>
            <form onSubmit={handleTransfer} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">New Department</label>
                <select value={transferForm.new_department_id} onChange={e => setTransferForm({...transferForm, new_department_id: e.target.value})} className="w-full border p-2 rounded mt-1">
                  <option value="">Select Department</option>
                  {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold">Reason</label>
                <input type="text" value={transferForm.reason} onChange={e => setTransferForm({...transferForm, reason: e.target.value})} className="w-full border p-2 rounded mt-1" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsTransferOpen(false)} className="px-3 py-1.5 bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded">Submit Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeactivateOpen && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setIsDeactivateOpen(false)}
          onConfirm={() => statusMutation.mutate()}
          title="Deactivate Employee"
          message={`Deactivate ${employee.first_name} ${employee.last_name}? Historical data will be preserved.`}
          confirmText="Deactivate"
          cancelText="Cancel"
          isDangerous={true}
        />
      )}
    </div>
  );
};
