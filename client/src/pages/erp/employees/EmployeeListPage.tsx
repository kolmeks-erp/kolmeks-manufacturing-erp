import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  X,
  Eye,
  Edit,
  UserX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { employeeService } from '../../../services/employee.service';
import { Employee, EmployeeStatus } from '../../../types/employee';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { EmptyState } from '../../../components/erp/EmptyState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ConfirmDialog } from '../../../components/erp/ConfirmDialog';

export const EmployeeListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for filters, search, and pagination
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Deactivation Modal State
  const [deactivateEmployee, setDeactivateEmployee] = useState<Employee | null>(null);

  // Query Departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => employeeService.getDepartments(),
  });

  // Query Employees
  const {
    data: employeeResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['employees', { page, search, departmentId, employmentType, status }],
    queryFn: () =>
      employeeService.getEmployees({
        page,
        limit,
        search,
        department_id: departmentId,
        employment_type: employmentType,
        status,
        sortBy: 'joining_date',
        sortOrder: 'desc',
      }),
  });

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EmployeeStatus }) =>
      employeeService.patchStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDeactivateEmployee(null);
    },
  });

  const handleClearFilters = () => {
    setSearch('');
    setDepartmentId('');
    setEmploymentType('');
    setStatus('');
    setPage(1);
  };

  const hasActiveFilters = search || departmentId || employmentType || status;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatEmploymentType = (type: string) => {
    return type ? type.replace('_', ' ') : 'N/A';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* PAGE HEADER */}
      <PageHeader
        title="Employee & HR Management"
        description="Manage company personnel profiles, department allocations, designations, and employment statuses."
        badge="HR Module"
        actions={
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/employees/new`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1E36] hover:bg-[#0F2C59] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        }
      />

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, name, email, designation..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-hidden font-medium"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-700"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          {/* Employment Type Filter */}
          <div>
            <select
              value={employmentType}
              onChange={(e) => {
                setEmploymentType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-700"
            >
              <option value="">All Employment Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
              <option value="TEMPORARY">Temporary</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-mono">Filters active</span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-bold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* MAIN DATA SECTION */}
      {isLoading ? (
        <LoadingState label="Loading employee directory records..." rows={6} />
      ) : isError ? (
        <ErrorState
          title="Unable to load employees"
          message="Failed to fetch employee directory from the Kolmeks backend API. Please check permissions."
          onRetry={() => refetch()}
        />
      ) : !employeeResponse || employeeResponse.data.length === 0 ? (
        <EmptyState
          title="No employees found"
          description={
            hasActiveFilters
              ? 'No employee profiles matched your selected filter criteria. Try adjusting your search query.'
              : 'No personnel profiles have been registered in the system yet. Click below to add your first employee.'
          }
          icon={<Users className="w-8 h-8 text-slate-400" />}
          actionText="Add Employee"
          onAction={() => navigate(`${ERP_BASE_PATH}/employees/new`)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Code</th>
                  <th className="py-3.5 px-5">Employee Name</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Designation</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Joining Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-slate-800">
                {employeeResponse.data.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-blue-900">
                      {emp.employee_code}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">
                        {emp.first_name} {emp.last_name}
                      </div>
                      <div className="text-[11px] text-slate-500">{emp.email}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-700">
                      {emp.department ? emp.department.name : 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700">{emp.designation}</td>
                    <td className="py-3.5 px-5 font-mono text-[11px] uppercase text-slate-600">
                      {formatEmploymentType(emp.employment_type)}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono">
                      {formatDate(emp.joining_date)}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <Link
                        to={`${ERP_BASE_PATH}/employees/${emp.id}`}
                        className="inline-flex items-center gap-1 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`${ERP_BASE_PATH}/employees/${emp.id}/edit`}
                        className="inline-flex items-center gap-1 p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                        title="Edit Employee"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      {emp.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => setDeactivateEmployee(emp)}
                          className="inline-flex items-center gap-1 p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Deactivate Employee"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {employeeResponse.pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="font-mono">
                Showing Page <strong>{employeeResponse.pagination.page}</strong> of{' '}
                <strong>{employeeResponse.pagination.totalPages}</strong> (
                {employeeResponse.pagination.totalRecords} records)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!employeeResponse.pagination.hasPrevPage}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg font-bold flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={!employeeResponse.pagination.hasNextPage}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DEACTIVATION CONFIRM DIALOG */}
      {deactivateEmployee && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeactivateEmployee(null)}
          onConfirm={() =>
            statusMutation.mutate({ id: deactivateEmployee.id, status: 'INACTIVE' })
          }
          title="Deactivate Employee Account"
          message={`Are you sure you want to deactivate ${deactivateEmployee.first_name} ${deactivateEmployee.last_name} (${deactivateEmployee.employee_code})? The record will remain archived in historical records but set to INACTIVE.`}
          confirmText="Deactivate Employee"
          cancelText="Keep Active"
          isDangerous={true}
        />
      )}
    </div>
  );
};
