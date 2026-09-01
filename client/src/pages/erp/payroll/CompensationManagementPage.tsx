import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '../../../services/payroll.service';
import { Building2, Search, Edit2, Save, DollarSign, CheckCircle } from 'lucide-react';

export const CompensationManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmp, setEditingEmp] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    basic_salary: '',
    allowances: '',
    hourly_rate: '',
  });

  const { data: compensations, isLoading } = useQuery({
    queryKey: ['employeeCompensations'],
    queryFn: payrollService.getCompensations,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => payrollService.updateCompensation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeCompensations'] });
      setEditingEmp(null);
    },
  });

  const handleEditClick = (emp: any) => {
    setEditingEmp(emp);
    setFormData({
      basic_salary: emp.basic_salary ? String(emp.basic_salary) : '0',
      allowances: emp.allowances ? String(emp.allowances) : '0',
      hourly_rate: emp.hourly_rate ? String(emp.hourly_rate) : '0',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    updateMutation.mutate({
      id: editingEmp.id,
      data: {
        basic_salary: parseFloat(formData.basic_salary) || 0,
        allowances: parseFloat(formData.allowances) || 0,
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
      },
    });
  };

  const filtered = (compensations || []).filter((emp) => {
    const name = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const code = (emp.employee_code || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Employee Compensation Structures
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set base salary, recurring allowances, and hourly rates used by the automatic payroll calculation engine.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4">Employee Code</th>
                <th className="p-4">Employee Name</th>
                <th className="p-4">Department</th>
                <th className="p-4">Basic Monthly Salary</th>
                <th className="p-4">Monthly Allowances</th>
                <th className="p-4">Hourly OT Rate</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Gross Base</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Loading compensation profiles...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No active employees found.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
                  const grossBase = (emp.basic_salary || 0) + (emp.allowances || 0);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {emp.employee_code}
                      </td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        {emp.first_name} {emp.last_name}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {emp.department?.name || 'General'}
                      </td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">
                        ₹{(emp.basic_salary || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        ₹{(emp.allowances || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 font-medium text-indigo-600 dark:text-indigo-400">
                        ₹{(emp.hourly_rate || 0).toFixed(2)}/hr
                      </td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{grossBase.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleEditClick(emp)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-medium text-xs transition-colors gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit Salary
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingEmp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-500" /> Edit Compensation: {editingEmp.first_name} {editingEmp.last_name}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Basic Monthly Salary (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Monthly Allowances (HRA, Conveyance, Medical, etc.) (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Hourly Overtime Rate (₹ / hr)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
                <p className="text-xs text-slate-500 mt-1">If set to 0, system will calculate based on basic salary formula.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Compensation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
