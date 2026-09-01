import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { payrollService } from '../../../services/payroll.service';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  Calendar,
  PlayCircle,
  FileText,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
} from 'lucide-react';

export const PayrollDashboardPage: React.FC = () => {
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['payrollDashboardKPIs'],
    queryFn: payrollService.getDashboardKPIs,
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Payroll Management & Accounting Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Server-calculated salary processing, employee earnings, deductions, payslips, and GL journal entry postings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/secure-kolmeks-x0y0/payroll/runs"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm gap-2"
          >
            <PlayCircle className="w-4 h-4" /> Process Payroll Run
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Active Employees</span>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {isLoading ? '...' : kpiData?.totalEmployees || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Eligible for salary disbursement</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Payroll Period</span>
            <Calendar className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-2 truncate">
            {isLoading ? '...' : kpiData?.activePeriod ? kpiData.activePeriod.name : 'No Open Period'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Status: {kpiData?.activePeriod?.status || 'N/A'}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Payroll Runs</span>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {isLoading ? '...' : kpiData?.totalRuns || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Calculated & Audited</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Posted Net Payroll</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{isLoading ? '...' : kpiData?.cumulativeNet ? kpiData.cumulativeNet.toLocaleString('en-IN') : '0.00'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Posted to General Ledger</p>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/secure-kolmeks-x0y0/payroll/periods"
          className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="p-3 w-fit rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Payroll Periods
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Define monthly or custom cutoff dates, open/close periods for processing.
            </p>
          </div>
          <div className="mt-6 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Manage Periods <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/secure-kolmeks-x0y0/payroll/compensations"
          className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="p-3 w-fit rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Employee Compensation
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Configure base salaries, allowances, and hourly overtime rates per employee.
            </p>
          </div>
          <div className="mt-6 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Configure Salary <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/secure-kolmeks-x0y0/payroll/payslips"
          className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="p-3 w-fit rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Employee Payslips
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Generate detailed salary slips with itemized earnings, unpaid leave, and net pay.
            </p>
          </div>
          <div className="mt-6 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
            View Payslips <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
};
