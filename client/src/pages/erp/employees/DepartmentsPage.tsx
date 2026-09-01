import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Edit, Search, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { employeeService } from '../../../services/employee.service';
import { Department } from '../../../types/employee';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';

export const DepartmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    manager_id: '',
    parent_department_id: '',
    status: 'active' as 'active' | 'inactive'
  });

  const { data: departments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['departments_full'],
    queryFn: () => employeeService.getDepartments(),
  });

  const { data: employeesList } = useQuery({
    queryKey: ['employees_list_simple'],
    queryFn: () => employeeService.getEmployees({ limit: 100 }),
  });

  const openCreateModal = () => {
    setEditingDept(null);
    setForm({ code: '', name: '', description: '', manager_id: '', parent_department_id: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setForm({
      code: dept.code,
      name: dept.name,
      description: dept.description || '',
      manager_id: dept.manager_id || '',
      parent_department_id: dept.parent_department_id || '',
      status: dept.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await employeeService.updateDepartment(editingDept.id, form);
      } else {
        await employeeService.createDepartment(form);
      }
      queryClient.invalidateQueries({ queryKey: ['departments_full'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save department');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Departments & Organizational Units"
        description="Configure factory operational departments, cost centers, and departmental manager assignments."
        badge="HR Architecture"
        actions={
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#0B1E36] hover:bg-[#0F2C59] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Department
          </button>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading departments..." rows={5} />
      ) : isError ? (
        <ErrorState title="Failed to load departments" message="Error connecting to database." onRetry={() => refetch()} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs relative">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">{dept.code}</span>
                  </div>
                </div>
                <button onClick={() => openEditModal(dept)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                {dept.description || 'No departmental description provided.'}
              </p>

              <div className="pt-2 border-t text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Department Head:</span>
                  <span className="font-bold text-slate-800">
                    {dept.manager ? `${dept.manager.first_name} ${dept.manager.last_name}` : 'Unassigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${dept.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {dept.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-[#0B1E36] text-base">
              {editingDept ? 'Edit Department' : 'Add New Department'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Department Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. DEPT-PROD"
                  className="w-full border border-slate-200 p-2 rounded-lg mt-1 font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Department Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Production & Machining"
                  className="w-full border border-slate-200 p-2 rounded-lg mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Department Manager</label>
                <select
                  value={form.manager_id}
                  onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                  className="w-full border border-slate-200 p-2 rounded-lg mt-1"
                >
                  <option value="">Select Manager</option>
                  {employeesList?.data.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-200 p-2 rounded-lg mt-1"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-xs">
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
