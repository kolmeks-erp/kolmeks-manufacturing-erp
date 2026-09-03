import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, User, ArrowRight } from 'lucide-react';
import { documentService } from '../../../services/document.service';
import { DocumentApproval } from '../../../types/document';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const DocumentApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<DocumentApproval[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedApproval, setSelectedApproval] = useState<DocumentApproval | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [decision, setDecision] = useState<string>('APPROVED');
  const [comments, setComments] = useState<string>('');

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const data = await documentService.getMyApprovals();
      setApprovals(data);
    } catch (err) {
      console.error('Failed to fetch approval tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;
    if ((decision === 'REJECTED' || decision === 'CHANGES_REQUESTED') && !comments.trim()) {
      alert('Comments are strictly required for Rejection or Request Changes.');
      return;
    }
    try {
      await documentService.processApprovalDecision(selectedApproval.id, { decision, comments });
      setShowModal(false);
      setSelectedApproval(null);
      setComments('');
      fetchApprovals();
    } catch (err) {
      console.error('Failed to record approval decision:', err);
      alert('Failed to process approval decision.');
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      LOW: 'bg-slate-100 text-slate-700 border-slate-200',
      MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200/80',
      HIGH: 'bg-amber-50 text-amber-800 border-amber-200/80',
      URGENT: 'bg-rose-50 text-rose-700 border-rose-200/80 font-bold',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[priority] || styles.MEDIUM}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 shadow-xs">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Digital Document Approvals</h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage and review pending document approval requests assigned to your role
            </p>
          </div>
        </div>
      </div>

      {/* Approvals Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Document</th>
                <th className="px-5 py-3.5">Version</th>
                <th className="px-5 py-3.5">Requester</th>
                <th className="px-5 py-3.5">Target Role</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500 font-medium">
                    Loading pending approval tasks...
                  </td>
                </tr>
              ) : approvals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500 font-medium">
                    No approval tasks currently assigned to your role.
                  </td>
                </tr>
              ) : (
                approvals.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 leading-tight">
                        {app.document?.title || 'ERP Document'}
                      </div>
                      <div className="text-[11px] font-mono font-bold text-indigo-600 mt-0.5">{app.document?.document_number}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200/80 rounded">
                        v{app.version?.version_number || '1.0'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-700">{app.requester?.full_name || app.requester?.email || 'System User'}</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-purple-700 uppercase tracking-wider">{app.target_role}</td>
                    <td className="px-5 py-3.5">{getPriorityBadge(app.priority)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-purple-50 text-purple-700 border-purple-200/80">
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {app.status === 'PENDING' ? (
                        <button
                          onClick={() => {
                            setSelectedApproval(app);
                            setShowModal(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all shadow-xs cursor-pointer"
                        >
                          Review & Decide
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/documents/${app.document_id}`)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
                        >
                          View Document
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {showModal && selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Process Decision for {selectedApproval.document?.title}
            </h3>
            <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decision</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
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
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
