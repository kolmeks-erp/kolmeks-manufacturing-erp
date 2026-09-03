import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Send,
  Globe,
  Archive,
  ArrowLeft,
  Calendar,
  User,
  Shield,
  Tag,
  History,
  Link as LinkIcon,
  MessageSquare,
  FileCheck,
  Trash2,
} from 'lucide-react';
import { documentService } from '../../../services/document.service';
import { DocumentItem } from '../../../types/document';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [showDecisionModal, setShowDecisionModal] = useState<boolean>(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string>('');

  const [versionForm, setVersionForm] = useState({ version_number: '', change_summary: '' });
  const [versionFile, setVersionFile] = useState<File | null>(null);

  const [approvalForm, setApprovalForm] = useState({
    target_role: 'DEPARTMENT_MANAGER',
    priority: 'MEDIUM',
    due_date: '',
    message: '',
  });

  const [decisionForm, setDecisionForm] = useState({ decision: 'APPROVED', comments: '' });

  const fetchDocumentDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await documentService.getDocumentById(id);
      setDoc(data);
    } catch (err) {
      console.error('Failed to fetch document detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentDetail();
  }, [id]);

  const handleNewVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !versionForm.change_summary.trim()) {
      alert('Change summary is required for a new revision.');
      return;
    }
    try {
      const fd = new FormData();
      if (versionFile) fd.append('file', versionFile);
      fd.append('version_number', versionForm.version_number);
      fd.append('change_summary', versionForm.change_summary);

      await documentService.uploadNewVersion(id, fd);
      setShowVersionModal(false);
      setVersionFile(null);
      setVersionForm({ version_number: '', change_summary: '' });
      fetchDocumentDetail();
    } catch (err) {
      console.error('Failed to upload new version:', err);
      alert('Failed to create new revision.');
    }
  };

  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await documentService.submitForApproval(id, approvalForm);
      setShowApprovalModal(false);
      fetchDocumentDetail();
    } catch (err) {
      console.error('Failed to submit for approval:', err);
      alert('Failed to submit document for approval.');
    }
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApprovalId) return;
    if ((decisionForm.decision === 'REJECTED' || decisionForm.decision === 'CHANGES_REQUESTED') && !decisionForm.comments.trim()) {
      alert('Comments are strictly required for Rejection or Request Changes.');
      return;
    }
    try {
      await documentService.processApprovalDecision(selectedApprovalId, decisionForm);
      setShowDecisionModal(false);
      setDecisionForm({ decision: 'APPROVED', comments: '' });
      fetchDocumentDetail();
    } catch (err) {
      console.error('Failed to record approval decision:', err);
      alert('Failed to record approval decision.');
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    if (window.confirm('Publish this approved document for company-wide access?')) {
      try {
        await documentService.publishDocument(id);
        fetchDocumentDetail();
      } catch (err) {
        console.error('Failed to publish:', err);
        alert('Failed to publish document.');
      }
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    if (window.confirm('Move this document into historical archive vault?')) {
      try {
        await documentService.archiveDocument(id);
        fetchDocumentDetail();
      } catch (err) {
        console.error('Failed to archive:', err);
        alert('Failed to archive document.');
      }
    }
  };

  const handleDelete = async () => {
    if (!id || !doc) return;
    if (window.confirm(`Are you sure you want to permanently delete document "${doc.title}" (${doc.document_number})? This action cannot be undone.`)) {
      try {
        await documentService.deleteDocument(id);
        alert('Document deleted successfully.');
        navigate(`${ERP_BASE_PATH}/documents/library`);
      } catch (err) {
        console.error('Failed to delete document:', err);
        alert('Failed to delete document.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-700 border-slate-200/80',
      SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200/80',
      UNDER_REVIEW: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      PUBLISHED: 'bg-teal-50 text-teal-700 border-teal-200/80',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80',
      CHANGES_REQUESTED: 'bg-amber-50 text-amber-800 border-amber-200/80',
      ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-200/80',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status] || styles.DRAFT}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading || !doc) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading document details...</div>;
  }

  const currentVer = doc.current_version;

  return (
    <div className="space-y-5">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/library`)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            title="Back to Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{doc.title}</h1>
              {getStatusBadge(doc.status)}
            </div>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              Doc #: <span className="font-semibold text-slate-700">{doc.document_number}</span> | Confidentiality:{' '}
              <span className="font-semibold text-slate-700">{doc.confidentiality_level}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentVer?.storage_url && (
            <a
              href={currentVer.storage_url}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download File
            </a>
          )}

          <button
            onClick={() => setShowVersionModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Revision
          </button>

          {doc.status !== 'SUBMITTED' && doc.status !== 'APPROVED' && doc.status !== 'PUBLISHED' && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Submit for Approval
            </button>
          )}

          {doc.status === 'APPROVED' && (
            <button
              onClick={handlePublish}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              Publish Document
            </button>
          )}

          {doc.status !== 'ARCHIVED' && (
            <button
              onClick={handleArchive}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              Archive
            </button>
          )}

          <button
            onClick={handleDelete}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Permanently Delete Document"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            Delete Document
          </button>
        </div>
      </div>

      {/* Main Details & Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2-Cols: Overview, Attachment, Version History */}
        <div className="lg:col-span-2 space-y-5">
          {/* Metadata Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Document Overview & Properties
            </h2>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">{doc.description || 'No description provided.'}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Document Type</div>
                <div className="font-bold text-slate-900 mt-0.5">{doc.type?.name || 'General'}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Category</div>
                <div className="font-bold text-slate-900 mt-0.5">{doc.category?.name || 'Uncategorized'}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Review Date</div>
                <div className="font-bold text-slate-900 mt-0.5">{doc.review_date || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Expiry Date</div>
                <div className="font-bold text-slate-900 mt-0.5">{doc.expiry_date || 'N/A'}</div>
              </div>
            </div>

            {/* Tags */}
            {doc.tags && doc.tags.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current File Attachment Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              Active Attachment File (v{currentVer?.version_number || '1.0'})
            </h2>

            {currentVer ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">{currentVer.file_name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Format: {currentVer.file_type || 'Unknown'} | Uploaded by: {currentVer.creator?.full_name || 'System Admin'} | Date:{' '}
                    {new Date(currentVer.created_at).toLocaleDateString()}
                  </div>
                </div>
                <a
                  href={currentVer.storage_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  View File
                </a>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs font-medium">No active file attachment uploaded.</div>
            )}
          </div>

          {/* Version History Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-500" />
              Version Revision History
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Version</th>
                    <th className="px-4 py-3">File Name</th>
                    <th className="px-4 py-3">Change Summary</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(doc.versions || []).map((ver) => (
                    <tr key={ver.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        v{ver.version_number} {ver.is_current && <span className="text-[11px] text-emerald-600 font-sans ml-1">(Current)</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{ver.file_name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-medium">{ver.change_summary || 'No revision notes.'}</td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-700">{ver.creator?.full_name || 'System Admin'}</td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-600">{new Date(ver.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={ver.storage_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1-Col: Digital Approvals Pipeline & Audit Trail */}
        <div className="space-y-5">
          {/* Digital Approvals Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              Digital Approvals Workflow
            </h2>

            {doc.approvals && doc.approvals.length > 0 ? (
              <div className="space-y-3">
                {doc.approvals.map((app) => (
                  <div key={app.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Target Role: {app.target_role}</span>
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic font-mono">"{app.message}"</p>

                    {/* Step decisions */}
                    {app.steps && app.steps.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200">
                        {app.steps.map((step) => (
                          <div key={step.id} className="text-xs text-slate-600 flex items-center justify-between font-medium">
                            <span>Step {step.step_number}: {step.approver?.full_name || step.approver_role}</span>
                            <span className="font-bold text-emerald-600">{step.decision}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {app.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          setSelectedApprovalId(app.id);
                          setShowDecisionModal(true);
                        }}
                        className="w-full py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        Record Approval Decision
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs font-medium">No active approval requests for this document.</div>
            )}
          </div>

          {/* Audit Log Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Audit Log Timeline
            </h2>

            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
              {(doc.audit_trail || []).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{log.action}</span>
                    <span className="text-slate-400 font-mono text-[11px] font-medium">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-600 font-medium">By: {log.actor?.full_name || 'System'}</div>
                  {log.reason && <div className="text-slate-500 italic">"{log.reason}"</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Upload New Revision</h3>
            <form onSubmit={handleNewVersionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Version Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 1.1 or 2.0"
                  value={versionForm.version_number}
                  onChange={(e) => setVersionForm({ ...versionForm, version_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Change Summary / Rationale *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe modifications in this revision..."
                  value={versionForm.change_summary}
                  onChange={(e) => setVersionForm({ ...versionForm, change_summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attachment File</label>
                <input
                  type="file"
                  onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVersionModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer">
                  Save Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Submit for Digital Approval</h3>
            <form onSubmit={handleApprovalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Approver Role</label>
                <select
                  value={approvalForm.target_role}
                  onChange={(e) => setApprovalForm({ ...approvalForm, target_role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                >
                  <option value="DEPARTMENT_MANAGER">Department Manager</option>
                  <option value="QUALITY_MANAGER">Quality Manager</option>
                  <option value="PROCUREMENT_MANAGER">Procurement Manager</option>
                  <option value="HR_MANAGER">HR Manager</option>
                  <option value="FINANCE_MANAGER">Finance Manager</option>
                  <option value="OPERATIONS_MANAGER">Operations Manager</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={approvalForm.priority}
                  onChange={(e) => setApprovalForm({ ...approvalForm, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Review Message / Rationale</label>
                <textarea
                  rows={2}
                  placeholder="Review instructions for approver..."
                  value={approvalForm.message}
                  onChange={(e) => setApprovalForm({ ...approvalForm, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-xs cursor-pointer">
                  Submit Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Record Digital Approval Decision</h3>
            <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decision</label>
                <select
                  value={decisionForm.decision}
                  onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                >
                  <option value="APPROVED">Approve Document</option>
                  <option value="REJECTED">Reject Document</option>
                  <option value="CHANGES_REQUESTED">Request Changes</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Comments / Audit Rationale</label>
                <textarea
                  rows={3}
                  placeholder="Required for Rejection or Changes Requested..."
                  value={decisionForm.comments}
                  onChange={(e) => setDecisionForm({ ...decisionForm, comments: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDecisionModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-xs cursor-pointer">
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
