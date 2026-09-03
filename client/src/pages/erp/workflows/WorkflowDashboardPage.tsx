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
    <div className="space-y-4">
      {/* Top Banner Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-2xs shrink-0">
            <GitMerge className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Centralized Workflow & Approval Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Enterprise workflow orchestration, multi-stage approval sign-offs, and compliance telemetry across all Kolmeks ERP modules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/workflows/tasks')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>My Pending Approvals</span>
          </button>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/workflows/definitions')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Workflow Definitions</span>
          </button>
        </div>
      </div>

      {/* Modern Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-indigo-200 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Workflows</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono tracking-tight">
              {loading ? '...' : telemetry?.activeWorkflows || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Currently running instances</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <GitMerge className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-amber-200 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Pending Tasks</span>
            <div className="text-2xl font-black text-amber-600 mt-1 font-mono tracking-tight">
              {loading ? '...' : telemetry?.myPendingTasks || 0}
            </div>
            <div className="text-[11px] text-amber-600 mt-0.5 font-medium">Awaiting your approval</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-rose-200 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overdue Tasks</span>
            <div className="text-2xl font-black text-rose-600 mt-1 font-mono tracking-tight">
              {loading ? '...' : telemetry?.overdueTasks || 0}
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5 font-medium">Past SLA limit</div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-purple-200 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Changes Requested</span>
            <div className="text-2xl font-black text-purple-600 mt-1 font-mono tracking-tight">
              {loading ? '...' : telemetry?.changesRequested || 0}
            </div>
            <div className="text-[11px] text-purple-600 mt-0.5 font-medium">Returned for revision</div>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Action Tasks Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Urgent Pending Approvals Assigned to You
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Action items requiring your digital sign-off</p>
          </div>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/workflows/tasks')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium animate-pulse">
              Loading workflow tasks...
            </div>
          ) : pendingTasks.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-500 text-xs">
              <CheckCircle className="w-9 h-9 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-slate-700 text-sm">All caught up!</p>
              <p className="text-slate-400 mt-0.5">You have no pending approval tasks assigned at this moment.</p>
            </div>
          ) : (
            pendingTasks.map((t) => (
              <div key={t.id} className="p-4.5 hover:bg-slate-50/80 flex items-center justify-between gap-4 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                      {t.workflow_instances?.workflow_definitions?.module || 'ERP'}
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {t.workflow_instances?.entity_reference || t.workflow_instances?.instance_number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Stage: <span className="font-bold text-slate-700">{t.workflow_stages?.name || 'Review'}</span> • Assigned {new Date(t.assigned_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/secure-kolmeks-x0y0/workflows/tasks')}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
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
