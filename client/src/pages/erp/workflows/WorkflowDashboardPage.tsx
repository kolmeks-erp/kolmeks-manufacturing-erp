import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitMerge, CheckCircle, Clock, AlertTriangle, XCircle, RefreshCw, FileText, ArrowRight } from 'lucide-react';
import { workflowService } from '../../../services/workflow.service';
import { WorkflowTelemetry, WorkflowTask } from '../../../types/workflow';

export const WorkflowDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState<WorkflowTelemetry | null>(null);
  const [pendingTasks, setPendingTasks] = useState<WorkflowTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [telData, taskRes] = await Promise.all([
          workflowService.getDashboardTelemetry(),
          workflowService.getUserTasks({ tab: 'pending', limit: 5 }),
        ]);
        setTelemetry(telData);
        setPendingTasks(taskRes.data);
      } catch (err) {
        console.error('Failed to load workflow dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
            <GitMerge className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Centralized Workflow & Approval Engine</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enterprise workflow orchestration, multi-stage approval sign-offs, and compliance telemetry across all Kolmeks ERP modules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/workflows/tasks')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" /> My Pending Approvals
          </button>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/workflows/definitions')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> Workflow Definitions
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Active Workflows</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {loading ? '...' : telemetry?.activeWorkflows || 0}
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
            <GitMerge className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">My Pending Tasks</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {loading ? '...' : telemetry?.myPendingTasks || 0}
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Overdue Tasks</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {loading ? '...' : telemetry?.overdueTasks || 0}
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Changes Requested</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {loading ? '...' : telemetry?.changesRequested || 0}
            </div>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action Tasks Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Urgent Pending Approvals Assigned to You</h2>
            <p className="text-xs text-slate-500">Action items requiring your digital sign-off</p>
          </div>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/workflows/tasks')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-6 text-center text-slate-400 text-sm">Loading workflow tasks...</div>
          ) : pendingTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              You have no pending approval tasks assigned at this moment.
            </div>
          ) : (
            pendingTasks.map((t) => (
              <div key={t.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {t.workflow_instances?.workflow_definitions?.module || 'ERP'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.workflow_instances?.entity_reference || t.workflow_instances?.instance_number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Stage: <span className="font-semibold text-slate-700 dark:text-slate-300">{t.workflow_stages?.name || 'Review'}</span> • Assigned {new Date(t.assigned_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/secure-kolmeks-x0y0/workflows/tasks')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  Review & Approve
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
