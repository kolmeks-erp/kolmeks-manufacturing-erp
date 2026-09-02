import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { payrollService } from '../../../services/payroll.service';
import { BarChart3, Download, Filter, Building2, IndianRupee } from 'lucide-react';

export const PayrollReportsPage: React.FC = () => {
  const [selectedPeriodId, setSelectedPeriodId] = useState('');

  const { data: periods } = useQuery({
    queryKey: ['payrollPeriods'],
    queryFn: payrollService.getPeriods,
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['payrollReports', selectedPeriodId],
    queryFn: () => payrollService.getPayrollReports(selectedPeriodId),
  });

  const entries = reportData || [];

  const totalGross = entries.reduce((sum, e) => sum + (e.gross_pay || 0), 0);
  const totalDeductions = entries.reduce((sum, e) => sum + (e.total_deductions || 0), 0);
  const totalNet = entries.reduce((sum, e) => sum + (e.net_pay || 0), 0);

  // Group by Department
  const deptSummary: { [key: string]: { count: number; gross: number; net: number } } = {};
  entries.forEach((e) => {
    const deptName = e.employee?.department?.name || 'General';
    if (!deptSummary[deptName]) {
      deptSummary[deptName] = { count: 0, gross: 0, net: 0 };
    }
    deptSummary[deptName].count += 1;
    deptSummary[deptName].gross += e.gross_pay || 0;
    deptSummary[deptName].net += e.net_pay || 0;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Payroll Analytical Reports & Cost Breakdown
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Departmental payroll distributions, salary expense summaries, and cost center allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
          >
            <option value="">All Payroll Periods</option>
            {(periods || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Gross Salary Expense</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{totalGross.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Deductions</span>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            ₹{totalDeductions.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Net Disbursement</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{totalNet.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-500" /> Departmental Salary Expense Summary
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4">Department</th>
                <th className="p-4">Headcount</th>
                <th className="p-4">Total Gross Expense</th>
                <th className="p-4">Total Net Payable</th>
                <th className="p-4">% of Total Payroll</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              {Object.keys(deptSummary).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No payroll data available for selected filter.
                  </td>
                </tr>
              ) : (
                Object.entries(deptSummary).map(([dept, summary]) => {
                  const pct = totalGross > 0 ? ((summary.gross / totalGross) * 100).toFixed(1) : '0';
                  return (
                    <tr key={dept} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">{dept}</td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">{summary.count} staff</td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">
                        ₹{summary.gross.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{summary.net.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 font-semibold text-indigo-600 dark:text-indigo-400">{pct}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
