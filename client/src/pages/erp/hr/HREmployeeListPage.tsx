import React, { useEffect, useState } from 'react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { employeeService } from '../../../services/employee.service';
import { Shift } from '../../../types/hr_operations';
import { Users, Clock, ShieldAlert } from 'lucide-react';

interface EmployeeItem {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  status: string;
  joining_date: string;
  department?: { id: string; name: string; code: string };
  shift?: { id: string; name: string; shift_code: string };
}

const HREmployeeListPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shift assignment modal
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | null>(null);
  const [assignedShiftId, setAssignedShiftId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empRes, shiftData] = await Promise.all([
        employeeService.getEmployees(),
        hrOperationsService.getShifts(),
      ]);
      setEmployees((empRes?.data as any) || []);
      setShifts(shiftData || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load employee directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !assignedShiftId) return;

    try {
      setSubmitting(true);
      await hrOperationsService.assignEmployeeShift({
        employee_id: selectedEmployee.id,
        shift_id: assignedShiftId,
      });
      setShowModal(false);
      setSelectedEmployee(null);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to assign shift schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Code',
      accessor: (row: EmployeeItem) => (
        <span className="font-mono text-blue-600 dark:text-cyan-400 font-bold">{row.employee_code}</span>
      ),
    },
    {
      header: 'Employee Name',
      accessor: (row: EmployeeItem) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">{row.first_name} {row.last_name}</span>
          <span className="text-slate-500 dark:text-slate-400 text-xs block">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: (row: EmployeeItem) => (
        <span className="text-slate-700 dark:text-slate-300 font-medium">{row.department?.name || 'Unassigned'}</span>
      ),
    },
    {
      header: 'Designation',
      accessor: (row: EmployeeItem) => (
        <span className="text-slate-700 dark:text-slate-300 text-xs">{row.designation || 'Staff'}</span>
      ),
    },
    {
      header: 'Assigned Shift',
      accessor: (row: EmployeeItem) => (
        row.shift ? (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {row.shift.name} ({row.shift.shift_code})
          </span>
        ) : (
          <span className="text-slate-500 text-xs italic">Default General Shift</span>
        )
      ),
    },
    {
      header: 'Status',
      accessor: (row: EmployeeItem) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: 'Actions',
      accessor: (row: EmployeeItem) => (
        <button
          onClick={() => {
            setSelectedEmployee(row);
            setAssignedShiftId(row.shift?.id || shifts[0]?.id || '');
            setShowModal(true);
          }}
          className="inline-flex items-center px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-medium rounded-lg transition-all"
        >
          <Clock className="w-3.5 h-3.5 mr-1" />
          Assign Shift
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Plant Workforce Directory & Shift Assignments"
        subtitle="Manage company workforce, designated job roles, and factory shift allocations"
      />

      {loading ? (
        <LoadingState message="Loading workforce directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <div className="space-y-6">
          <DataTable
            data={employees}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search workforce by code, name, designation, or department..."
          />

          {/* Shift Assignment Modal */}
          {showModal && selectedEmployee && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-1">Assign Shift Schedule</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Target Employee: <span className="text-cyan-400 font-semibold">{selectedEmployee.first_name} {selectedEmployee.last_name} ({selectedEmployee.employee_code})</span>
                </p>

                <form onSubmit={handleAssignShift} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Work Shift</label>
                    <select
                      value={assignedShiftId}
                      onChange={(e) => setAssignedShiftId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                      required
                    >
                      {shifts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.shift_code}) — {s.start_time.substring(0, 5)} to {s.end_time.substring(0, 5)}
                        </option>
                      ))}
                    </select>
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
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {submitting ? 'Assigning...' : 'Save Shift Assignment'}
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

export default HREmployeeListPage;
