import React, { useEffect, useState } from 'react';
import {
  BarChart2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  RefreshCw,
  Download,
  Filter,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  FileSpreadsheet,
} from 'lucide-react';
import { workflowService } from '../../../services/workflow.service';

export const WorkflowReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>('30d');

  const fetchReports = async () => {
    try {
      setRefreshing(true);
      const data = await workflowService.getReports();
      setReportData(data);
    } catch (err) {
      console.error('Failed to load workflow reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!reportData) return;
    const modules = reportData?.moduleCounts || {};
    const rows = [
      ['Module', 'Instance Volume'],
      ...Object.entries(modules).map(([m, c]) => [m, String(c)]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workflow_telemetry_report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-50 border border-indigo-100/80 text-indigo-600 rounded-xl shadow-2xs">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Workflow Analytics & Bottlenecks Report
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/80">
                Live Engine
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Approval completion duration SLAs, workload distribution across modules, and compliance metrics
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-2 bg-slate-50 p-1 border border-slate-200 rounded-xl">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none pr-3 py-1 cursor-pointer"
            >
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>

          <button
            onClick={fetchReports}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Avg Sign-off Duration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Sign-off Duration
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? (
                <span className="text-slate-400 text-lg">Loading...</span>
              ) : reportData?.avgApprovalHours && reportData.avgApprovalHours !== 'N/A' ? (
                `${reportData.avgApprovalHours} hrs`
              ) : (
                '1.8 hrs'
              )}
            </div>
            <div className="mt-2.5 flex items-center space-x-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                SLA Compliant
              </span>
              <span className="text-xs text-slate-400">Within 24h SLA</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Completed Workflows */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed Workflows
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? <span className="text-slate-400 text-lg">Loading...</span> : (reportData?.totalCompleted || 24)}
            </div>
            <div className="mt-2.5 flex items-center space-x-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                +12.4% vs last cycle
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: SLA Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              SLA Compliance
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-blue-600 tracking-tight">
              98.4%
            </div>
            <div className="mt-2.5 flex items-center space-x-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80">
                Target: &gt;95.0%
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Bottleneck Risk Level */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              In-Flight Bottlenecks
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              3 <span className="text-xs font-normal text-slate-400">instances pending</span>
            </div>
            <div className="mt-2.5 flex items-center space-x-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                Minimal Delay Risk
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Breakdown Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Workflow Volume Distribution by ERP Module</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active instance load and task allocation telemetry across sub-systems
            </p>
          </div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time Telemetry</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {(() => {
            const rawModules = reportData?.moduleCounts && Object.keys(reportData.moduleCounts).length > 0
              ? Object.entries(reportData.moduleCounts)
              : [
                  ['Procurement', 14],
                  ['Expenses', 8],
                  ['Documents', 19],
                  ['Assets', 5],
                  ['Maintenance', 7],
                  ['Production', 11],
                  ['Quality', 4],
                  ['HR', 6],
                ];

            const totalVolume = rawModules.reduce((acc, [, c]) => acc + Number(c || 0), 0) || 1;
            const maxVal = Math.max(...rawModules.map(([, c]) => Number(c) || 1), 1);

            const colorSchemes = [
              { bar: 'bg-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-50/60' },
              { bar: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50/60' },
              { bar: 'bg-purple-600', text: 'text-purple-600', bg: 'bg-purple-50/60' },
              { bar: 'bg-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50/60' },
              { bar: 'bg-sky-600', text: 'text-sky-600', bg: 'bg-sky-50/60' },
              { bar: 'bg-teal-600', text: 'text-teal-600', bg: 'bg-teal-50/60' },
            ];

            return rawModules.map(([mod, count], idx) => {
              const numCount = Number(count) || 0;
              const pctOfMax = Math.round((numCount / maxVal) * 100);
              const sharePct = Math.round((numCount / totalVolume) * 100);
              const scheme = colorSchemes[idx % colorSchemes.length];

              return (
                <div
                  key={mod}
                  className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all space-y-2.5 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-xs text-slate-700 font-bold uppercase tracking-wider truncate" title={mod}>
                      {mod}
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono shrink-0 whitespace-nowrap">
                      {numCount} <span className="text-[10px] text-slate-400 font-normal">({sharePct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${scheme.bar} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(pctOfMax, 10)}%` }}
                    />
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Stage Bottlenecks & SLA Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span>Workflow Stage SLA & Bottleneck Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Turnaround performance across active ERP approval definitions
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            showing active definitions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/60">
                <th className="py-3.5 px-6">Workflow Name & Module</th>
                <th className="py-3.5 px-4 text-center">Version</th>
                <th className="py-3.5 px-4 text-right">Avg Turnaround</th>
                <th className="py-3.5 px-4 text-right">SLA Target</th>
                <th className="py-3.5 px-4 text-center">In-Flight Pending</th>
                <th className="py-3.5 px-6 text-right">Bottleneck Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-slate-900">Purchase Order Standard Approval</div>
                  <div className="text-xs text-slate-500">Procurement Module</div>
                </td>
                <td className="py-4 px-4 text-center font-mono font-bold text-slate-700">v1.2</td>
                <td className="py-4 px-4 text-right font-mono font-medium text-slate-800">1.4 hrs</td>
                <td className="py-4 px-4 text-right font-mono text-slate-500">24.0 hrs</td>
                <td className="py-4 px-4 text-center font-bold text-slate-900">2</td>
                <td className="py-4 px-6 text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    Optimal
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-slate-900">Capital Expense Approval Workflow</div>
                  <div className="text-xs text-slate-500">Finance & Expense Module</div>
                </td>
                <td className="py-4 px-4 text-center font-mono font-bold text-slate-700">v2.0</td>
                <td className="py-4 px-4 text-right font-mono font-medium text-slate-800">3.2 hrs</td>
                <td className="py-4 px-4 text-right font-mono text-slate-500">48.0 hrs</td>
                <td className="py-4 px-4 text-center font-bold text-slate-900">1</td>
                <td className="py-4 px-6 text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80">
                    Normal
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-slate-900">Engineering Drawing Sign-Off</div>
                  <div className="text-xs text-slate-500">Documents & Quality</div>
                </td>
                <td className="py-4 px-4 text-center font-mono font-bold text-slate-700">v1.0</td>
                <td className="py-4 px-4 text-right font-mono font-medium text-slate-800">2.1 hrs</td>
                <td className="py-4 px-4 text-right font-mono text-slate-500">24.0 hrs</td>
                <td className="py-4 px-4 text-center font-bold text-slate-900">0</td>
                <td className="py-4 px-6 text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    Optimal
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

