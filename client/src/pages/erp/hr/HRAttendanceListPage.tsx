import React, { useEffect, useState } from 'react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { AttendanceRecord } from '../../../types/hr_operations';
import { Clock, Filter, CheckCircle2 } from 'lucide-react';

const HRAttendanceListPage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrOperationsService.getAttendanceRecords({
        status: statusFilter || undefined,
        attendance_date: dateFilter || undefined,
      });
      setRecords(res?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load factory attendance registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [statusFilter, dateFilter]);

  const columns = [
    {
      header: 'Date',
      accessor: (row: AttendanceRecord) => (
        <span className="font-mono text-cyan-400 font-bold">{row.attendance_date}</span>
      ),
    },
    {
      header: 'Employee Name',
      accessor: (row: AttendanceRecord) => (
        <div>
          <span className="font-semibold text-white block">
            {row.employee?.first_name} {row.employee?.last_name}
          </span>
          <span className="text-slate-400 text-xs font-mono">{row.employee?.employee_code}</span>
        </div>
      ),
    },
    {
      header: 'Shift',
      accessor: (row: AttendanceRecord) => (
        <span className="text-slate-300 font-medium text-xs">{(row.shift as any)?.name || 'General Shift'}</span>
      ),
    },
    {
      header: 'Check-In',
      accessor: (row: AttendanceRecord) => (
        row.check_in ? (
          <span className="text-emerald-400 font-mono text-xs font-semibold">
            {new Date(row.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : (
          <span className="text-slate-500 text-xs italic">Absent / Pending</span>
        )
      ),
    },
    {
      header: 'Check-Out',
      accessor: (row: AttendanceRecord) => (
        row.check_out ? (
          <span className="text-cyan-400 font-mono text-xs font-semibold">
            {new Date(row.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : (
          <span className="text-slate-500 text-xs italic">On Duty</span>
        )
      ),
    },
    {
      header: 'Worked Hours',
      accessor: (row: AttendanceRecord) => (
        <span className="font-bold text-white text-xs">{(row.worked_minutes / 60).toFixed(1)} hrs</span>
      ),
    },
    {
      header: 'Late Mins',
      accessor: (row: AttendanceRecord) => (
        row.late_minutes > 0 ? (
          <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">
            +{row.late_minutes} mins
          </span>
        ) : (
          <span className="text-slate-500 font-mono text-xs">0</span>
        )
      ),
    },
    {
      header: 'Status',
      accessor: (row: AttendanceRecord) => (
        <StatusBadge status={row.status} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Factory Attendance Registry & Daily Shift Logs"
        subtitle="Monitor workforce check-ins, shift arrivals, late calculations, and duty durations"
      />

      {/* Filter Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">Status Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">PRESENT</option>
              <option value="LATE">LATE</option>
              <option value="ABSENT">ABSENT</option>
              <option value="HALF_DAY">HALF_DAY</option>
              <option value="ON_LEAVE">ON_LEAVE</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {(statusFilter || dateFilter) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setDateFilter('');
            }}
            className="text-xs text-slate-400 hover:text-cyan-400 underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Loading attendance logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAttendance} />
      ) : (
        <DataTable
          data={records}
          columns={columns}
          searchable={true}
          searchPlaceholder="Search by employee name or code..."
        />
      )}
    </div>
  );
};

export default HRAttendanceListPage;
