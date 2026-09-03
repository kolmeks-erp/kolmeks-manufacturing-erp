import React, { useEffect, useState } from 'react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { AttendanceRecord } from '../../../types/hr_operations';
import { Clock, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

const MyAttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrOperationsService.getMyAttendance();
      setRecords(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load your attendance history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const res = await hrOperationsService.checkIn();
      alert(res.notes || 'Check-in recorded successfully!');
      fetchMyAttendance();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const res = await hrOperationsService.checkOut();
      alert(`Check-out recorded successfully! Worked: ${(res.worked_minutes / 60).toFixed(1)} Hours.`);
      fetchMyAttendance();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.attendance_date === todayStr);

  const columns = [
    {
      header: 'Date',
      accessor: (row: AttendanceRecord) => (
        <span className="font-mono text-indigo-600 font-bold text-xs">{row.attendance_date}</span>
      ),
    },
    {
      header: 'Shift',
      accessor: (row: AttendanceRecord) => (
        <span className="text-slate-700 font-medium text-xs">{(row.shift as any)?.name || 'General Shift'}</span>
      ),
    },
    {
      header: 'Check-In Time',
      accessor: (row: AttendanceRecord) => (
        row.check_in ? (
          <span className="text-emerald-700 font-mono text-xs font-semibold">
            {new Date(row.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : (
          <span className="text-slate-400 text-xs italic">Absent / Pending</span>
        )
      ),
    },
    {
      header: 'Check-Out Time',
      accessor: (row: AttendanceRecord) => (
        row.check_out ? (
          <span className="text-indigo-600 font-mono text-xs font-semibold">
            {new Date(row.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : (
          <span className="text-amber-600 text-xs font-semibold italic">On Duty</span>
        )
      ),
    },
    {
      header: 'Hours Worked',
      accessor: (row: AttendanceRecord) => (
        <span className="px-2.5 py-1 text-xs font-bold font-mono bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/80">
          {(row.worked_minutes / 60).toFixed(1)} hrs
        </span>
      ),
    },
    {
      header: 'Late Mins',
      accessor: (row: AttendanceRecord) => (
        row.late_minutes > 0 ? (
          <span className="px-2 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 rounded-md border border-amber-200/80">
            +{row.late_minutes} mins
          </span>
        ) : (
          <span className="text-slate-400 font-mono text-xs">0</span>
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
        title="My Shift Attendance History & Punch Logs"
        subtitle="View your daily check-in/out logs, worked hours calculation, and late minutes"
        actions={
          <div className="flex gap-2">
            {!todayRecord?.check_in ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-sm transition-all text-sm disabled:opacity-50"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {actionLoading ? 'Recording...' : 'Check-In Now'}
              </button>
            ) : !todayRecord?.check_out ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium shadow-sm transition-all text-sm disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {actionLoading ? 'Recording...' : 'Check-Out Now'}
              </button>
            ) : (
              <span className="inline-flex items-center px-3.5 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200/80 shadow-xs">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Shift Completed Today
              </span>
            )}
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Loading your attendance history..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMyAttendance} />
      ) : (
        <DataTable
          data={records}
          columns={columns}
          searchable={true}
          searchPlaceholder="Search attendance logs by date or status..."
        />
      )}
    </div>
  );
};

export default MyAttendancePage;
