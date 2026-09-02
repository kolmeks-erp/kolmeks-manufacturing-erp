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
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Approvals & Workflow Tasks</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Centralized sign-off inbox for digital approvals across Procurement, Documents, Sales, Quality, and HR
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" /> Pending Action
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'overdue'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Overdue SLAs
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Completed Sign-offs
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400">
            No approval tasks found in this view.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    {task.workflow_instances?.workflow_definitions?.module || 'ERP'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Assigned: {new Date(task.assigned_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  {task.workflow_instances?.entity_reference || task.workflow_instances?.instance_number}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Workflow: <span className="font-semibold text-slate-700 dark:text-slate-300">{task.workflow_instances?.workflow_definitions?.name}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current Stage: <span className="font-semibold text-slate-700 dark:text-slate-300">{task.workflow_stages?.name || 'Review'}</span>
                </p>
              </div>

              {task.status === 'Pending' ? (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenDecisionModal(task, 'Approved')}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleOpenDecisionModal(task, 'Changes Requested')}
                    className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Changes
                  </button>
                  <button
                    onClick={() => handleOpenDecisionModal(task, 'Rejected')}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
                  Decision: <span className="font-bold text-slate-900 dark:text-white">{task.decision}</span> ({new Date(task.completed_at!).toLocaleString()})
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Decision Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Confirm {decisionType} Action
            </h2>
            <p className="text-xs text-slate-500">
              Target Record: <span className="font-mono font-bold">{selectedTask.workflow_instances?.entity_reference || selectedTask.workflow_instances?.instance_number}</span>
            </p>

            <form onSubmit={handleSubmitDecision} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Comments / Rationale</label>
                <textarea
                  rows={3}
                  required={decisionType !== 'Approved'}
                  placeholder={decisionType === 'Approved' ? 'Optional approval comments...' : 'Please state reason for rejection/changes...'}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-colors ${
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
