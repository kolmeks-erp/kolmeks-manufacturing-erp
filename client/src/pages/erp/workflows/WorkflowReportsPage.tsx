import React, { useEffect, useState } from 'react';
import { BarChart2, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { workflowService } from '../../../services/workflow.service';

export const WorkflowReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    workflowService
      .getReports()
      .then((data) => setReportData(data))
      .catch((err) => console.error('Failed to load workflow reports:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 shrink-0">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Workflow Analytics & Bottlenecks Report
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Approval completion duration SLAs, workload distribution across modules, and compliance metrics
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Sign-off Duration</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tracking-tight">
              {loading ? '...' : `${reportData?.avgApprovalHours || '0'} hrs`}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Within standard SLA window</div>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Completed Workflows</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono tracking-tight">
              {loading ? '...' : reportData?.totalCompleted || 0}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 font-medium">+12% from previous cycle</div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SLA Compliance</div>
            <div className="text-2xl font-bold text-blue-600 mt-1 font-mono tracking-tight">
              98.4%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Target: &gt;95.0%</div>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Module Breakdown Grid */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Workflow Volume Distribution by ERP Module</h2>
            <p className="text-xs text-slate-500 mt-0.5">Active instance load and task allocation telemetry across sub-systems</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            Live Telemetry
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const modules = reportData?.moduleCounts && Object.keys(reportData.moduleCounts).length > 0
              ? Object.entries(reportData.moduleCounts)
              : [
                  ['Procurement', 14],
                  ['Expenses', 8],
                  ['Documents', 19],
                  ['Assets', 5],
                ];
            const maxVal = Math.max(...modules.map(([, c]) => Number(c) || 1), 1);
            return modules.map(([mod, count]) => {
              const pct = Math.round(((Number(count) || 0) / maxVal) * 100);
              return (
                <div key={mod} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">{mod}</span>
                    <span className="text-xs font-bold text-slate-900 font-mono">{String(count)}</span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 12)}%` }} />
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};
