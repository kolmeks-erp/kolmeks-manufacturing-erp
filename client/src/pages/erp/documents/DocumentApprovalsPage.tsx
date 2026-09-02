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
      LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      HIGH: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      URGENT: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-bold',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[priority] || styles.MEDIUM}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Digital Document Approvals</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage and review pending document approval requests assigned to your role
            </p>
          </div>
        </div>
      </div>

      {/* Approvals Grid / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Version</th>
                <th className="px-6 py-4">Requester</th>
                <th className="px-6 py-4">Target Role</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading pending approval tasks...
                  </td>
                </tr>
              ) : approvals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No approval tasks currently assigned to your role.
                  </td>
                </tr>
              ) : (
                approvals.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {app.document?.title || 'ERP Document'}
                      </div>
                      <div className="text-xs text-slate-400">{app.document?.document_number}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">v{app.version?.version_number || '1.0'}</td>
                    <td className="px-6 py-4 text-xs">{app.requester?.full_name || 'System User'}</td>
                    <td className="px-6 py-4 text-xs font-semibold">{app.target_role}</td>
                    <td className="px-6 py-4">{getPriorityBadge(app.priority)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'PENDING' ? (
                        <button
                          onClick={() => {
                            setSelectedApproval(app);
                            setShowModal(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        >
                          Review & Decide
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`${ERP_BASE_PATH}/documents/${app.document_id}`)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Process Decision for {selectedApproval.document?.title}
            </h3>
            <form onSubmit={handleDecisionSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium mb-1">Decision</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
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
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
