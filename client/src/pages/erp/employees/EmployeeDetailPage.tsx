import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Edit,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

import { employeeService } from '../../../services/employee.service';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { ErrorState } from '../../../components/erp/ErrorState';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ConfirmDialog } from '../../../components/erp/ConfirmDialog';

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  const {
    data: employee,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getEmployeeById(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: () => employeeService.patchStatus(id!, 'INACTIVE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsDeactivateOpen(false);
    },
  });

  if (isLoading) {
    return <LoadingState label="Fetching employee profile..." rows={8} />;
  }

  if (isError || !employee) {
    return (
      <ErrorState
        title="Employee Not Found"
        message="The requested employee record does not exist or you do not have authorization to view it."
        onRetry={() => refetch()}
      />
    );
  }

  const initials = `${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`.toUpperCase();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not Specified';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* TOP BACK BAR */}
      <div className="flex items-center justify-between">
        <Link
          to={`${ERP_BASE_PATH}/employees`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employees Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`${ERP_BASE_PATH}/employees/${employee.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Information</span>
          </Link>
          {employee.status === 'ACTIVE' && (
            <button
              type="button"
              onClick={() => setIsDeactivateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition-colors"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Deactivate</span>
            </button>
          )}
        </div>
      </div>

      {/* PROFILE HEADER CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-[#0B1E36] text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#0B1E36]">
                {employee.first_name} {employee.last_name}
              </h1>
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {employee.employee_code}
              </span>
              <StatusBadge status={employee.status} />
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {employee.designation} &bull;{' '}
              <span className="font-bold text-slate-800">
                {employee.department ? employee.department.name : 'Unassigned'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* INFORMATION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. EMPLOYMENT INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-[#0B1E36] text-base">Employment Details</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Employee Code</span>
              <span className="font-mono font-bold text-slate-900">{employee.employee_code}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Department</span>
              <span className="font-bold text-slate-800">
                {employee.department ? employee.department.name : 'Unassigned'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Designation / Role</span>
              <span className="font-semibold text-slate-800">{employee.designation}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Employment Type</span>
              <span className="font-mono uppercase font-bold text-slate-700">
                {employee.employment_type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Joining Date</span>
              <span className="font-mono font-bold text-slate-900">
                {formatDate(employee.joining_date)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">ERP Login Account</span>
              <span className="font-semibold text-slate-600">
                {employee.auth_user_id ? 'Linked' : 'Not Linked'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. CONTACT INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-[#0B1E36] text-base">Contact Information</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Business Email</span>
              <span className="font-mono font-bold text-blue-900">{employee.email}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Phone Number</span>
              <span className="font-mono font-bold text-slate-900">
                {employee.phone || 'Not Provided'}
              </span>
            </div>
            <div className="flex items-start justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Street Address</span>
              <span className="font-medium text-slate-800 text-right">
                {employee.address || 'Not Provided'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">City / State</span>
              <span className="font-medium text-slate-800">
                {employee.city || 'N/A'}, {employee.state || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Country / Postal</span>
              <span className="font-medium text-slate-800">
                {employee.country} ({employee.postal_code || 'N/A'})
              </span>
            </div>
          </div>
        </div>

        {/* 3. PERSONAL INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-5 h-5 text-violet-600" />
            <h3 className="font-bold text-[#0B1E36] text-base">Personal Details</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Full Name</span>
              <span className="font-bold text-slate-900">
                {employee.first_name} {employee.last_name}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Date of Birth</span>
              <span className="font-mono font-bold text-slate-800">
                {formatDate(employee.date_of_birth)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Gender</span>
              <span className="font-semibold text-slate-800">{employee.gender || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* 4. EMERGENCY CONTACT & AUDIT */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-[#0B1E36] text-base">Emergency Contact & Audit</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Contact Name</span>
              <span className="font-bold text-slate-900">
                {employee.emergency_contact_name || 'Not Provided'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Contact Phone</span>
              <span className="font-mono font-bold text-slate-900">
                {employee.emergency_contact_phone || 'Not Provided'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Relationship</span>
              <span className="font-semibold text-slate-800 font-mono">
                {employee.relationship || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Record Created</span>
              <span className="font-mono text-slate-500">{formatDate(employee.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DEACTIVATION MODAL */}
      {isDeactivateOpen && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setIsDeactivateOpen(false)}
          onConfirm={() => statusMutation.mutate()}
          title="Confirm Employee Deactivation"
          message={`Deactivate employee ${employee.first_name} ${employee.last_name} (${employee.employee_code})? The employee record will be marked as INACTIVE without destroying historical data.`}
          confirmText="Deactivate Employee"
          cancelText="Cancel"
          isDangerous={true}
        />
      )}
    </div>
  );
};
