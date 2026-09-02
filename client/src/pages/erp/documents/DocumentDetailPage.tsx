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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      UNDER_REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      PUBLISHED: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
      REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
      CHANGES_REQUESTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      ARCHIVED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.DRAFT}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading || !doc) {
    return <div className="p-8 text-center text-slate-500">Loading document details...</div>;
  }

  const currentVer = doc.current_version;

  return (
    <div className="p-6 space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/documents/library`)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{doc.title}</h1>
              {getStatusBadge(doc.status)}
            </div>
            <p className="text-sm font-mono text-slate-500 mt-1">
              Doc #: <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.document_number}</span> | Confidentiality:{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.confidentiality_level}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentVer?.storage_url && (
            <a
              href={currentVer.storage_url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download File
            </a>
          )}

          <button
            onClick={() => setShowVersionModal(true)}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            Upload Revision
          </button>

          {doc.status !== 'SUBMITTED' && doc.status !== 'APPROVED' && doc.status !== 'PUBLISHED' && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Submit for Approval
            </button>
          )}

          {doc.status === 'APPROVED' && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4" />
              Publish Document
            </button>
          )}

          {doc.status !== 'ARCHIVED' && (
            <button
              onClick={handleArchive}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Main Details & Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Cols: Overview, Attachment, Version History & Related ERP Records */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Document Overview & Properties
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300">{doc.description || 'No description provided.'}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-2">
              <div>
                <div className="text-xs text-slate-400">Document Type</div>
                <div className="font-semibold text-slate-900 dark:text-white">{doc.type?.name || 'General'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Category</div>
                <div className="font-semibold text-slate-900 dark:text-white">{doc.category?.name || 'Uncategorized'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Review Date</div>
                <div className="font-semibold text-slate-900 dark:text-white">{doc.review_date || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Expiry Date</div>
                <div className="font-semibold text-slate-900 dark:text-white">{doc.expiry_date || 'N/A'}</div>
              </div>
            </div>

            {/* Tags */}
            {doc.tags && doc.tags.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <Tag className="w-4 h-4 text-slate-400" />
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current File Attachment Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-500" />
              Active Attachment File (v{currentVer?.version_number || '1.0'})
            </h2>

            {currentVer ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{currentVer.file_name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Format: {currentVer.file_type || 'Unknown'} | Uploaded by: {currentVer.creator?.full_name || 'System Admin'} | Date:{' '}
                    {new Date(currentVer.created_at).toLocaleDateString()}
                  </div>
                </div>
                <a
                  href={currentVer.storage_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  View File
                </a>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-sm">No active file attachment uploaded.</div>
            )}
          </div>

          {/* Version History Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-purple-500" />
              Version Revision History
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Version</th>
                    <th className="px-4 py-3">File Name</th>
                    <th className="px-4 py-3">Change Summary</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {(doc.versions || []).map((ver) => (
                    <tr key={ver.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-white">
                        v{ver.version_number} {ver.is_current && <span className="text-xs text-emerald-500 font-sans ml-1">(Current)</span>}
                      </td>
                      <td className="px-4 py-3">{ver.file_name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{ver.change_summary || 'No revision notes.'}</td>
                      <td className="px-4 py-3 text-xs">{ver.creator?.full_name || 'System Admin'}</td>
                      <td className="px-4 py-3 text-xs">{new Date(ver.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={ver.storage_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
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
        <div className="space-y-6">
          {/* Digital Approvals Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              Digital Approvals Workflow
            </h2>

            {doc.approvals && doc.approvals.length > 0 ? (
              <div className="space-y-4">
                {doc.approvals.map((app) => (
                  <div key={app.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Target Role: {app.target_role}</span>
                      <span className="px-2 py-0.5 rounded font-mono bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic font-mono">"{app.message}"</p>

                    {/* Step decisions */}
                    {app.steps && app.steps.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        {app.steps.map((step) => (
                          <div key={step.id} className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                            <span>Step {step.step_number}: {step.approver?.full_name || step.approver_role}</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{step.decision}</span>
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
                        className="w-full py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm"
                      >
                        Record Approval Decision
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-sm">No active approval requests for this document.</div>
            )}
          </div>

          {/* Audit Log Timeline */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Audit Log Timeline
            </h2>

            <div className="space-y-3">
              {(doc.audit_trail || []).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                    <span>{log.action}</span>
                    <span className="text-slate-400 font-mono">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-500">By: {log.actor?.full_name || 'System'}</div>
                  {log.reason && <div className="text-slate-600 dark:text-slate-400 italic">"{log.reason}"</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload New Revision</h3>
            <form onSubmit={handleNewVersionSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium mb-1">Version Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 1.1 or 2.0"
                  value={versionForm.version_number}
                  onChange={(e) => setVersionForm({ ...versionForm, version_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Change Summary / Rationale *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe modifications in this revision..."
                  value={versionForm.change_summary}
                  onChange={(e) => setVersionForm({ ...versionForm, change_summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Attachment File</label>
                <input
                  type="file"
                  onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVersionModal(false)}
                  className="px-4 py-2 font-medium bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl">
                  Save Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit for Digital Approval</h3>
            <form onSubmit={handleApprovalSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium mb-1">Target Approver Role</label>
                <select
                  value={approvalForm.target_role}
                  onChange={(e) => setApprovalForm({ ...approvalForm, target_role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
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
                <label className="block font-medium mb-1">Priority</label>
                <select
                  value={approvalForm.priority}
                  onChange={(e) => setApprovalForm({ ...approvalForm, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Review Message / Rationale</label>
                <textarea
                  rows={2}
                  placeholder="Review instructions for approver..."
                  value={approvalForm.message}
                  onChange={(e) => setApprovalForm({ ...approvalForm, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 font-medium bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl">
                  Submit Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Digital Approval Decision</h3>
            <form onSubmit={handleDecisionSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium mb-1">Decision</label>
                <select
                  value={decisionForm.decision}
                  onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                >
                  <option value="APPROVED">Approve Document</option>
                  <option value="REJECTED">Reject Document</option>
                  <option value="CHANGES_REQUESTED">Request Changes</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Comments / Audit Rationale</label>
                <textarea
                  rows={3}
                  placeholder="Required for Rejection or Changes Requested..."
                  value={decisionForm.comments}
                  onChange={(e) => setDecisionForm({ ...decisionForm, comments: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDecisionModal(false)}
                  className="px-4 py-2 font-medium bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl">
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
