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
          workflowService.getDashboardTelemetry().catch(() => null),
          workflowService.getUserTasks({ tab: 'pending', limit: 5 }).catch(() => ({ data: [] })),
        ]);
        if (telData) setTelemetry(telData);
        setPendingTasks(Array.isArray(taskRes?.data) ? taskRes.data : Array.isArray(taskRes) ? taskRes : []);
      } catch (err) {
        console.error('Failed to load workflow dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-5">
      {/* Top Banner Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <GitMerge className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Centralized Workflow & Approval Engine</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Enterprise workflow orchestration, multi-stage approval sign-offs, and compliance telemetry across all Kolmeks ERP modules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/workflows/tasks')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" /> My Pending Approvals
          </button>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/workflows/definitions')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Workflow Definitions
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Workflows</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : telemetry?.activeWorkflows || 0}
            </div>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <GitMerge className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Pending Tasks</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {loading ? '...' : telemetry?.myPendingTasks || 0}
            </div>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overdue Tasks</div>
            <div className="text-2xl font-bold text-rose-600 mt-1">
              {loading ? '...' : telemetry?.overdueTasks || 0}
            </div>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Changes Requested</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {loading ? '...' : telemetry?.changesRequested || 0}
            </div>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Action Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Urgent Pending Approvals Assigned to You</h2>
            <p className="text-xs text-slate-500 mt-0.5">Action items requiring your digital sign-off</p>
          </div>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/workflows/tasks')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-200/70">
          {loading ? (
            <div className="p-6 text-center text-slate-400 text-xs">Loading workflow tasks...</div>
          ) : pendingTasks.length === 0 ? (
            <div className="py-10 px-4 text-center text-slate-500 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              You have no pending approval tasks assigned at this moment.
            </div>
          ) : (
            pendingTasks.map((t) => (
              <div key={t.id} className="p-4 hover:bg-slate-50/80 flex items-center justify-between gap-4 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-blue-50 text-blue-700 border border-blue-200/80">
                      {t.workflow_instances?.workflow_definitions?.module || 'ERP'}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {t.workflow_instances?.entity_reference || t.workflow_instances?.instance_number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Stage: <span className="font-semibold text-slate-700">{t.workflow_stages?.name || 'Review'}</span> • Assigned {new Date(t.assigned_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/secure-kolmeks-x0y0/workflows/tasks')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
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
