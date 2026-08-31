import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  PieChart,
  Users,
  FolderTree,
  Building2,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../../components/erp/LoadingState';
import { ErrorState } from '../../../../components/erp/ErrorState';
import { expenseService, ExpenseReportsSummary } from '../../../../services/expense.service';
import { ERP_BASE_PATH } from '../../../../constants/navigation';

export const ExpenseReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ExpenseReportsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'EMPLOYEE' | 'CATEGORY' | 'COST_CENTER'>('EMPLOYEE');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseService.getReports();
      setReports(data);
    } catch (err: any) {
      console.error('Failed to load expense reports:', err);
      setError(err?.response?.data?.message || 'Failed to fetch expense summary analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <ERPLayout activeTab="finance">
        <LoadingState message="Calculating Expense Analytics & Departmental Breakdown..." />
      </ERPLayout>
    );
  }

  if (error || !reports) {
    return (
      <ERPLayout activeTab="finance">
        <ErrorState message={error || 'Expense reports unavailable.'} onRetry={fetchReports} />
      </ERPLayout>
    );
  }

  return (
    <ERPLayout activeTab="finance">
      <div className="space-y-6">
        <ERPPageHeader
          title="Expense Analytics & Reports"
          subtitle="Cross-sectional reporting by employee department, expense category, and cost center budget utilization."
          actions={
            <button
              onClick={fetchReports}
              className="inline-flex items-center px-3 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Analytics
            </button>
          }
        />

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('EMPLOYEE')}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'EMPLOYEE'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            By Employee & Department
          </button>

          <button
            onClick={() => setActiveTab('CATEGORY')}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'CATEGORY'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FolderTree className="w-4 h-4 mr-2" />
            By Expense Category
          </button>

          <button
            onClick={() => setActiveTab('COST_CENTER')}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'COST_CENTER'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4 mr-2" />
            By Cost Center & Budget
          </button>
        </div>

        {/* Tab Content 1: By Employee */}
        {activeTab === 'EMPLOYEE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-100 mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2 text-emerald-400" />
              Employee Expense Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-center">Total Claims</th>
                    <th className="py-3 px-4 text-right">Submitted Amt</th>
                    <th className="py-3 px-4 text-right">Approved Amt</th>
                    <th className="py-3 px-4 text-right">Reimbursed Amt</th>
                    <th className="py-3 px-4 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reports.by_employee.map((emp, idx) => (
                    <tr key={emp.employee_id || idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-medium text-slate-200">{emp.employee_name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{emp.department || 'General'}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-300">{emp.total_claims}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-100">{formatCurrency(emp.total_submitted)}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-400">{formatCurrency(emp.total_approved)}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-purple-300">{formatCurrency(emp.total_reimbursed)}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-rose-400">{formatCurrency(emp.total_outstanding)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content 2: By Category */}
        {activeTab === 'CATEGORY' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-100 mb-4 flex items-center">
              <FolderTree className="w-4 h-4 mr-2 text-blue-400" />
              Category Spend Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4 text-center">Items Count</th>
                    <th className="py-3 px-4 text-right">Total Claimed</th>
                    <th className="py-3 px-4 text-right">Approved Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reports.by_category.map((cat, idx) => (
                    <tr key={cat.code || idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-blue-400 font-semibold">{cat.code}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{cat.name}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-300">{cat.items_count}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-100">{formatCurrency(cat.total_amount)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{formatCurrency(cat.approved_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content 3: By Cost Center */}
        {activeTab === 'COST_CENTER' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-100 mb-4 flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-purple-400" />
              Cost Center Budget vs Actual Expense Utilization
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Cost Center</th>
                    <th className="py-3 px-4 text-right">Allocated Budget</th>
                    <th className="py-3 px-4 text-right">Approved Expense</th>
                    <th className="py-3 px-4 text-right">Pending Reimbursement</th>
                    <th className="py-3 px-4 text-center">Utilization %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reports.by_cost_center.map((cc, idx) => {
                    const utilPercent = cc.allocated_budget > 0 ? (cc.approved_expense / cc.allocated_budget) * 100 : 0;
                    return (
                      <tr key={cc.cost_center_id || idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-medium text-slate-200">{cc.cost_center_name}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-300">{formatCurrency(cc.allocated_budget)}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{formatCurrency(cc.approved_expense)}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-purple-300">{formatCurrency(cc.outstanding_reimbursement)}</td>
                        <td className="py-3.5 px-4 text-center font-bold">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              utilPercent > 100
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : utilPercent > 80
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {utilPercent.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ERPLayout>
  );
};

export default ExpenseReportsPage;
