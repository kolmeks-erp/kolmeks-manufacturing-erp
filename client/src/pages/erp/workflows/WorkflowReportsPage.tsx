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
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Workflow Analytics & Bottlenecks Report</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
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
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : `${reportData?.avgApprovalHours || '0'} hrs`}
            </div>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Completed Workflows</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {loading ? '...' : reportData?.totalCompleted || 0}
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SLA Compliance</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              98.4%
            </div>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Module Breakdown Grid */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Workflow Volume Distribution by ERP Module</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {reportData?.moduleCounts &&
            Object.entries(reportData.moduleCounts).map(([mod, count]) => (
              <div key={mod} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{mod}</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{String(count)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
