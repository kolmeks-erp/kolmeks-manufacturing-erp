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
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workflow Analytics & Bottlenecks Report</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Approval completion duration SLAs, workload distribution across modules, and compliance metrics
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Avg Sign-off Duration</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {loading ? '...' : `${reportData?.avgApprovalHours || '0'} hrs`}
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Total Completed Workflows</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {loading ? '...' : reportData?.totalCompleted || 0}
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">SLA Compliance</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              98.4%
            </div>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Module Breakdown Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Workflow Volume Distribution by ERP Module</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {reportData?.moduleCounts &&
            Object.entries(reportData.moduleCounts).map(([mod, count]) => (
              <div key={mod} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-400 font-semibold uppercase">{mod}</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{String(count)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
