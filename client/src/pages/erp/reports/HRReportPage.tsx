import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Building2, Calendar, Download } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { ReportChart } from '../../../components/reports/ReportChart';
import { GlobalReportFilters } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const HRReportPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({ date_range: 'all' });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getHRReport(filters);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load HR report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleExport = () => {
    if (!reportData?.employeesTable) return;
    const headers = ['Employee Code', 'Full Name', 'Department', 'Job Title', 'Status'];
    const rows = reportData.employeesTable.map((e: any) => [
      e.employee_code || e.id,
      `${e.first_name || ''} ${e.last_name || ''}`.trim() || e.name || 'Staff Member',
      e.department?.name || 'Operations',
      e.job_title || 'Employee',
      e.status || 'Active'
    ]);
    reportsService.exportToCSV('HR_Headcount_Report', headers, rows);
  };

  const metrics = reportData?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Users className="w-7 h-7 text-indigo-400" />
            <span>Human Resources & Workforce Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Department headcount distribution, active staff census, attendance rates, and leave balance summaries.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export HR CSV</span>
        </button>
      </div>

      <ReportsNavigationHeader />
      <GlobalReportFilterBar filters={filters} onChange={setFilters} onRefresh={fetchReport} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Workforce"
          value={loading ? '...' : metrics?.totalEmployees || 0}
          subtitle="Registered staff headcount"
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Active Personnel"
          value={loading ? '...' : metrics?.activeEmployees || 0}
          subtitle="Active employment status"
          icon={UserCheck}
          color="emerald"
        />
        <KPICard
          title="Operating Departments"
          value={loading ? '...' : metrics?.departmentCount || 0}
          subtitle="Organized business divisions"
          icon={Building2}
          color="indigo"
        />
        <KPICard
          title="Leave Requests Logged"
          value={loading ? '...' : metrics?.leaveRequestsCount || 0}
          subtitle="Total annual leave applications"
          icon={Calendar}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <ReportChart
          title="Department Headcount Distribution"
          type="bar"
          data={reportData?.deptHeadcount || []}
          dataKey="headcount"
          categoryKey="department"
          color="#6366f1"
        />
      </div>

      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Employee Roster</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Employee Code</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading workforce roster...</td></tr>
              ) : !reportData?.employeesTable || reportData.employeesTable.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No employee records found.</td></tr>
              ) : (
                reportData.employeesTable.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">{e.employee_code || e.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {`${e.first_name || ''} ${e.last_name || ''}`.trim() || e.name || 'Staff Member'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{e.department?.name || 'Operations'}</td>
                    <td className="px-6 py-4 text-slate-300">{e.job_title || 'Specialist'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold uppercase">
                        {e.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
