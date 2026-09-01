import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, UserCheck, ShieldCheck, ChevronRight, User } from 'lucide-react';
import { employeeService } from '../../../services/employee.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';

export const OrganizationStructurePage: React.FC = () => {
  const { data: orgData, isLoading, isError, refetch } = useQuery({
    queryKey: ['org_structure'],
    queryFn: () => employeeService.getOrganizationStructure(),
  });

  if (isLoading) return <LoadingState label="Building organization hierarchy tree..." rows={6} />;
  if (isError || !orgData) return <ErrorState title="Failed to build hierarchy" message="Error loading organization data." onRetry={() => refetch()} />;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Organization Hierarchy & Structure"
        description="Plant organizational structure, departmental reporting hierarchies, and personnel breakdown."
        badge="Factory Architecture"
      />

      <div className="bg-[#0B1E36] text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{orgData.company}</h2>
          <p className="text-xs text-blue-200 mt-1">Total Plant Personnel: {orgData.totalEmployees} Employees &bull; {orgData.totalDepartments} Active Operational Departments</p>
        </div>
        <Building2 className="w-12 h-12 text-blue-400 opacity-80" />
      </div>

      <div className="space-y-6">
        {orgData.structure.map((dept: any) => (
          <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">
                  {dept.code}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{dept.name}</h3>
                  <p className="text-xs text-slate-500">
                    Department Head: <span className="font-bold text-slate-800">{dept.manager ? `${dept.manager.first_name} ${dept.manager.last_name}` : 'Unassigned'}</span>
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                {dept.employeeCount} Personnel
              </span>
            </div>

            {/* Employee Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {dept.employees.map((emp: any) => (
                <div key={emp.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-100 transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {emp.first_name.charAt(0)}{emp.last_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-xs truncate">{emp.first_name} {emp.last_name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{emp.designation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
