import React, { useEffect, useState } from 'react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/common/DataTable';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { employeeService } from '../../../services/employee.service';
import { LeaveBalance, LeaveType } from '../../../types/hr_operations';
import { Calendar, Plus } from 'lucide-react';

interface EmployeeSimple {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
}

const HRLeaveListPage: React.FC = () => {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<EmployeeSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Allocate Leave Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
  const [allocatedDays, setAllocatedDays] = useState('12');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [balData, typeData, empRes] = await Promise.all([
        hrOperationsService.getLeaveBalances(),
        hrOperationsService.getLeaveTypes(),
        employeeService.getEmployees(),
      ]);
      setBalances(balData || []);
      setLeaveTypes(typeData || []);
      setEmployees((empRes?.data as any) || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load leave balances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !selectedLeaveTypeId || !allocatedDays) return;

    try {
      setSubmitting(true);
      await hrOperationsService.allocateLeaveBalance({
        employee_id: selectedEmpId,
        leave_type_id: selectedLeaveTypeId,
        allocated_days: parseFloat(allocatedDays) || 0,
        year: new Date().getFullYear(),
      });
      setShowModal(false);
      fetchLeaveData();
      alert('Leave quota allocated successfully!');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to allocate leave quota.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Employee Code',
      accessor: (row: LeaveBalance) => (
        <span className="font-mono text-cyan-400 font-bold">
          {(row.employee as any)?.employee_code || 'EMP'}
        </span>
      ),
    },
    {
      header: 'Employee Name',
      accessor: (row: LeaveBalance) => (
        <span className="font-semibold text-white">
          {(row.employee as any)?.first_name} {(row.employee as any)?.last_name}
        </span>
      ),
    },
    {
      header: 'Leave Policy',
      accessor: (row: LeaveBalance) => (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-200 border border-slate-700">
          {row.leave_type?.name} ({row.leave_type?.code})
        </span>
      ),
    },
    {
      header: 'Year',
      accessor: (row: LeaveBalance) => (
        <span className="font-mono text-slate-400 text-xs">{row.year}</span>
      ),
    },
    {
      header: 'Allocated Quota',
      accessor: (row: LeaveBalance) => (
        <span className="font-bold text-white text-xs">{row.allocated_days} Days</span>
      ),
    },
    {
      header: 'Used',
      accessor: (row: LeaveBalance) => (
        <span className="text-rose-400 font-semibold text-xs">{row.used_days} Days</span>
      ),
    },
    {
      header: 'Pending Approval',
      accessor: (row: LeaveBalance) => (
        <span className="text-amber-400 font-semibold text-xs">{row.pending_days} Days</span>
      ),
    },
    {
      header: 'Remaining Balance',
      accessor: (row: LeaveBalance) => (
        <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {row.remaining_days} Days Left
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Workforce Leave Entitlements & Annual Quota Balances"
        subtitle="Manage employee leave quotas, track usage, and allocate annual leave balances"
        actions={
          <button
            onClick={() => {
              setSelectedEmpId(employees[0]?.id || '');
              setSelectedLeaveTypeId(leaveTypes[0]?.id || '');
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-sm transition-all text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Allocate Leave Quota
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Loading workforce leave entitlements..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLeaveData} />
      ) : (
        <div className="space-y-6">
          <DataTable
            data={balances}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search leave balances by employee code or name..."
          />

          {/* Allocate Quota Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Allocate Leave Quota</h3>
                <p className="text-xs text-slate-400 mb-4">Assign annual leave entitlement days for an employee.</p>

                <form onSubmit={handleAllocate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Employee</label>
                    <select
                      value={selectedEmpId}
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.employee_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Leave Type Policy</label>
                    <select
                      value={selectedLeaveTypeId}
                      onChange={(e) => setSelectedLeaveTypeId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    >
                      {leaveTypes.map((lt) => (
                        <option key={lt.id} value={lt.id}>
                          {lt.name} ({lt.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Allocated Days Quota</label>
                    <input
                      type="number"
                      step="0.5"
                      value={allocatedDays}
                      onChange={(e) => setAllocatedDays(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {submitting ? 'Allocating...' : 'Save Allocation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HRLeaveListPage;
