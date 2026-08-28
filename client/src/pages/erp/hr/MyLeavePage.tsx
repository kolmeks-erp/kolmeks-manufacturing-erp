import React, { useEffect, useState } from 'react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { LeaveRequest, LeaveType } from '../../../types/hr_operations';
import { Calendar, Plus, FileText } from 'lucide-react';

const MyLeavePage: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply Leave Modal State
  const [showModal, setShowModal] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [halfDay, setHalfDay] = useState<'NONE' | 'FIRST_HALF' | 'SECOND_HALF'>('NONE');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMyLeaveData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqData, typeData] = await Promise.all([
        hrOperationsService.getMyLeaveRequests(),
        hrOperationsService.getLeaveTypes(),
      ]);
      setRequests(reqData || []);
      setLeaveTypes(typeData || []);
      if (typeData && typeData.length > 0 && !leaveTypeId) {
        setLeaveTypeId(typeData[0].id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load your leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaveData();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveTypeId || !startDate || !endDate || !reason) return;

    try {
      setSubmitting(true);
      await hrOperationsService.createLeaveRequest({
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        half_day: halfDay,
        reason,
      });
      setShowModal(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      setHalfDay('NONE');
      fetchMyLeaveData();
      alert('Leave application submitted successfully for manager approval!');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit leave application.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Request No.',
      accessor: (row: LeaveRequest) => (
        <span className="font-mono text-cyan-400 font-bold">{row.request_number}</span>
      ),
    },
    {
      header: 'Leave Category',
      accessor: (row: LeaveRequest) => (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-200 border border-slate-700">
          {row.leave_type?.name}
        </span>
      ),
    },
    {
      header: 'Dates Duration',
      accessor: (row: LeaveRequest) => (
        <div>
          <span className="font-medium text-white text-xs block">
            {row.start_date} to {row.end_date}
          </span>
          <span className="text-slate-400 text-xs">{row.leave_days} Day(s) {row.half_day !== 'NONE' ? `(${row.half_day})` : ''}</span>
        </div>
      ),
    },
    {
      header: 'Reason',
      accessor: (row: LeaveRequest) => (
        <span className="text-slate-300 text-xs italic max-w-xs block truncate">{row.reason}</span>
      ),
    },
    {
      header: 'Approval Status',
      accessor: (row: LeaveRequest) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: 'Manager Comments',
      accessor: (row: LeaveRequest) => (
        <span className="text-slate-400 text-xs">{row.rejection_reason || row.approval_comments || 'N/A'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="My Leave Applications & Entitlement History"
        subtitle="Apply for leave, track manager approvals, and view your application status"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-sm transition-all text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Apply For Leave
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Loading your leave applications..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMyLeaveData} />
      ) : (
        <div className="space-y-6">
          <DataTable
            data={requests}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search by request number, leave category, or status..."
          />

          {/* Apply Leave Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Apply For Leave</h3>
                <p className="text-xs text-slate-400 mb-4">Submit a leave application for approval by your HR manager.</p>

                <form onSubmit={handleApplyLeave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Leave Type Policy</label>
                    <select
                      value={leaveTypeId}
                      onChange={(e) => setLeaveTypeId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    >
                      {leaveTypes.map((lt) => (
                        <option key={lt.id} value={lt.id}>
                          {lt.name} ({lt.code}) — {lt.paid ? 'Paid' : 'Unpaid'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Half Day Option</label>
                    <select
                      value={halfDay}
                      onChange={(e) => setHalfDay(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="NONE">Full Day(s)</option>
                      <option value="FIRST_HALF">First Half Only</option>
                      <option value="SECOND_HALF">Second Half Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reason / Description</label>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Personal family engagement or medical leave requirement"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
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
                      {submitting ? 'Submitting...' : 'Submit Application'}
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

export default MyLeavePage;
