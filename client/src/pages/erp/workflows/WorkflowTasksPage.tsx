import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Clock, Filter, AlertTriangle, MessageSquare, ExternalLink } from 'lucide-react';
import { workflowService } from '../../../services/workflow.service';
import { WorkflowTask } from '../../../types/workflow';

export const WorkflowTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('pending');

  // Decision Modal state
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);
  const [decisionType, setDecisionType] = useState<'Approved' | 'Rejected' | 'Changes Requested'>('Approved');
  const [comments, setComments] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await workflowService.getUserTasks({ tab: activeTab });
      setTasks(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load user tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const handleOpenDecisionModal = (task: WorkflowTask, decision: 'Approved' | 'Rejected' | 'Changes Requested') => {
    setSelectedTask(task);
    setDecisionType(decision);
    setComments('');
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSubmitting(true);
    try {
      const res = await workflowService.processTaskDecision(selectedTask.id, decisionType, comments);
      if (res.stale) {
        alert(`Notice: ${res.message}`);
      }
      setSelectedTask(null);
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">My Approvals & Workflow Tasks</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Centralized sign-off inbox for digital approvals across Procurement, Documents, Sales, Quality, and HR
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" /> Pending Action
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'overdue'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Overdue SLAs
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'completed'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Completed Sign-offs
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No approval tasks found in this view.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200/80">
                    {task.workflow_instances?.workflow_definitions?.module || 'ERP'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Assigned: {new Date(task.assigned_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-2">
                  {task.workflow_instances?.entity_reference || task.workflow_instances?.instance_number}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Workflow: <span className="font-semibold text-slate-700">{task.workflow_instances?.workflow_definitions?.name}</span>
                </p>
                <p className="text-xs text-slate-500">
                  Current Stage: <span className="font-semibold text-slate-700">{task.workflow_stages?.name || 'Review'}</span>
                </p>
              </div>

              {task.status === 'Pending' ? (
                <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenDecisionModal(task, 'Approved')}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleOpenDecisionModal(task, 'Changes Requested')}
                    className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Changes
                  </button>
                  <button
                    onClick={() => handleOpenDecisionModal(task, 'Rejected')}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-200/70 text-xs font-semibold text-slate-500">
                  Decision: <span className="font-bold text-slate-900">{task.decision}</span> ({new Date(task.completed_at!).toLocaleString()})
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Decision Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Confirm {decisionType} Action
            </h2>
            <p className="text-xs text-slate-500">
              Target Record: <span className="font-mono font-bold text-slate-800">{selectedTask.workflow_instances?.entity_reference || selectedTask.workflow_instances?.instance_number}</span>
            </p>

            <form onSubmit={handleSubmitDecision} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Comments / Rationale</label>
                <textarea
                  rows={3}
                  required={decisionType !== 'Approved'}
                  placeholder={decisionType === 'Approved' ? 'Optional approval comments...' : 'Please state reason for rejection/changes...'}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                    decisionType === 'Approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : decisionType === 'Changes Requested'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting ? 'Processing...' : `Submit ${decisionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
