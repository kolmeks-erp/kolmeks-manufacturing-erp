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
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <PieChart className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Expense Analytics & Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cross-sectional reporting by employee department, expense category, and cost center budget utilization.
            </p>
          </div>
        </div>
        <button
          onClick={fetchReports}
          className="inline-flex items-center justify-center px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Refresh Analytics
        </button>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('EMPLOYEE')}
          className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'EMPLOYEE'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 mr-2 text-emerald-600" />
          By Employee & Department
        </button>

        <button
          onClick={() => setActiveTab('CATEGORY')}
          className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'CATEGORY'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderTree className="w-4 h-4 mr-2 text-blue-600" />
          By Expense Category
        </button>

        <button
          onClick={() => setActiveTab('COST_CENTER')}
          className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'COST_CENTER'
              ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 mr-2 text-purple-600" />
          By Cost Center & Budget
        </button>
      </div>

      {/* Tab Content 1: By Employee */}
      {activeTab === 'EMPLOYEE' && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Users className="w-4 h-4 mr-2 text-emerald-600" />
            Employee Expense Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
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
              <tbody className="divide-y divide-slate-100">
                {reports.by_employee.map((emp, idx) => (
                  <tr key={emp.employee_id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{emp.employee_name}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{emp.department || 'General'}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">{emp.total_claims}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(emp.total_submitted)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">{formatCurrency(emp.total_approved)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-purple-600">{formatCurrency(emp.total_reimbursed)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">{formatCurrency(emp.total_outstanding)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: By Category */}
      {activeTab === 'CATEGORY' && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <FolderTree className="w-4 h-4 mr-2 text-blue-600" />
            Category Spend Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4 text-center">Items Count</th>
                  <th className="py-3 px-4 text-right">Total Claimed</th>
                  <th className="py-3 px-4 text-right">Approved Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.by_category.map((cat, idx) => (
                  <tr key={cat.code || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-blue-600 font-bold">{cat.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{cat.name}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">{cat.items_count}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(cat.total_amount)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">{formatCurrency(cat.approved_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: By Cost Center */}
      {activeTab === 'COST_CENTER' && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Building2 className="w-4 h-4 mr-2 text-purple-600" />
            Cost Center Budget vs Actual Expense Utilization
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Cost Center</th>
                  <th className="py-3 px-4 text-right">Allocated Budget</th>
                  <th className="py-3 px-4 text-right">Approved Expense</th>
                  <th className="py-3 px-4 text-right">Pending Reimbursement</th>
                  <th className="py-3 px-4 text-center">Utilization %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.by_cost_center.map((cc, idx) => {
                  const utilPercent = cc.allocated_budget > 0 ? (cc.approved_expense / cc.allocated_budget) * 100 : 0;
                  return (
                    <tr key={cc.cost_center_id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{cc.cost_center_name}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700">{formatCurrency(cc.allocated_budget)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">{formatCurrency(cc.approved_expense)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-purple-600">{formatCurrency(cc.outstanding_reimbursement)}</td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            utilPercent > 100
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : utilPercent > 80
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
  );
};

export default ExpenseReportsPage;
