import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { payrollService } from '../../../services/payroll.service';
import { PayrollEntry } from '../../../types/payroll';
import { FileText, Search, Printer, CheckCircle, Building2, User } from 'lucide-react';

export const PayslipsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollEntry | null>(null);

  const { data: payslips, isLoading } = useQuery({
    queryKey: ['payslips'],
    queryFn: () => payrollService.getPayslips(),
  });

  const filtered = (payslips || []).filter((p) => {
    const name = `${p.employee?.first_name || ''} ${p.employee?.last_name || ''}`.toLowerCase();
    const psNum = (p.payslip_number || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || psNum.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Employee Payslips
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access itemized earnings, deductions, overtime pay, and net salary advice slips.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Employee or Payslip #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Payslips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 p-8 text-center text-slate-500 dark:text-slate-400">
            Loading payslips...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-slate-500 dark:text-slate-400">
            No payslips available.
          </div>
        ) : (
          filtered.map((ps) => (
            <div
              key={ps.id}
              onClick={() => setSelectedPayslip(ps)}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-all shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {ps.payslip_number}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      ps.status === 'POSTED' || ps.status === 'APPROVED'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {ps.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  {ps.employee?.first_name} {ps.employee?.last_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {ps.department?.name || 'General Department'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 space-y-1 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Basic Salary:</span>
                    <span className="font-medium text-slate-900 dark:text-white">₹{ps.basic_salary?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Overtime Pay:</span>
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">₹{ps.overtime_pay?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Total Deductions:</span>
                    <span className="font-medium text-rose-600 dark:text-rose-400">₹{ps.total_deductions?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Net Pay</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{ps.net_pay?.toFixed(2)}
                  </span>
                </div>

                <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors">
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payslip Modal View / Print */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-8 shadow-xl border border-slate-200 dark:border-slate-700 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wide">
                  KOLMEKS ERP
                </h2>
                <p className="text-xs text-slate-500">Official Salary Disbursement Advice</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {selectedPayslip.payslip_number}
                </p>
                <p className="text-xs text-slate-500">{selectedPayslip.created_at?.split('T')[0]}</p>
              </div>
            </div>

            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Employee Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedPayslip.employee?.first_name} {selectedPayslip.employee?.last_name}
                </span>
                <span className="text-xs text-slate-500 block">{selectedPayslip.employee?.employee_code}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Department</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedPayslip.department?.name || 'General'}
                </span>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Earnings</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-600 dark:text-slate-300">Basic Salary</span>
                  <span className="font-medium text-slate-900 dark:text-white">₹{selectedPayslip.basic_salary?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-600 dark:text-slate-300">Allowances</span>
                  <span className="font-medium text-slate-900 dark:text-white">₹{selectedPayslip.allowances?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-600 dark:text-slate-300">Overtime Pay</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">₹{selectedPayslip.overtime_pay?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-slate-900 dark:text-white">
                  <span>Gross Earnings</span>
                  <span>₹{selectedPayslip.gross_pay?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deductions</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-600 dark:text-slate-300">Unpaid Leave Deductions</span>
                  <span className="font-medium text-rose-600 dark:text-rose-400">₹{selectedPayslip.unpaid_leave_deductions?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-slate-900 dark:text-white">
                  <span>Total Deductions</span>
                  <span>₹{selectedPayslip.total_deductions?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex items-center justify-between">
              <span className="text-base font-bold text-emerald-900 dark:text-emerald-100">NET PAYABLE AMOUNT</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ₹{selectedPayslip.net_pay?.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors gap-2"
              >
                <Printer className="w-4 h-4" /> Print Payslip
              </button>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
