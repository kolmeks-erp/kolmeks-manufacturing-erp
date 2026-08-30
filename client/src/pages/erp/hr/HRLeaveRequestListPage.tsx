import React, { useEffect, useState } from 'react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { LeaveRequest } from '../../../types/hr_operations';
import { Check, X, Filter } from 'lucide-react';

const HRLeaveRequestListPage: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('');

  // Reject Modal State
  const [rejectModalReq, setRejectModalReq] = useState<LeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrOperationsService.getLeaveRequests({
        status: statusFilter || undefined,
      });
      setRequests(data?.data || (Array.isArray(data) ? data : []));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load leave requests queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleApprove = async (req: LeaveRequest) => {
    if (!window.confirm(`Approve leave request ${req.request_number} for ${req.employee?.first_name} ${req.employee?.last_name}?`)) return;

    try {
      setActionLoading(true);
      await hrOperationsService.approveLeaveRequest(req.id);
      fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to approve leave request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReq || !rejectReason) return;

    try {
      setActionLoading(true);
      await hrOperationsService.rejectLeaveRequest(rejectModalReq.id, rejectReason);
      setRejectModalReq(null);
      setRejectReason('');
      fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject leave request.');
    } finally {
      setActionLoading(false);
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
      header: 'Employee Name',
      accessor: (row: LeaveRequest) => (
        <div>
          <span className="font-semibold text-white block">
            {row.employee?.first_name} {row.employee?.last_name}
          </span>
          <span className="text-slate-400 text-xs font-mono">{row.employee?.employee_code}</span>
        </div>
      ),
    },
    {
      header: 'Leave Type Policy',
      accessor: (row: LeaveRequest) => (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-200 border border-slate-700">
          {row.leave_type?.name}
        </span>
      ),
    },
    {
      header: 'Duration & Days',
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
      header: 'Status',
      accessor: (row: LeaveRequest) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: 'Actions',
      accessor: (row: LeaveRequest) => (
        row.status === 'PENDING' ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(row)}
              disabled={actionLoading}
              className="p-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/40 transition-all text-xs font-semibold flex items-center"
              title="Approve Leave"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Approve
            </button>
            <button
              onClick={() => {
                setRejectModalReq(row);
                setRejectReason('');
              }}
              disabled={actionLoading}
              className="p-1.5 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-600/40 transition-all text-xs font-semibold flex items-center"
              title="Reject Leave"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Reject
            </button>
          </div>
        ) : (
          <span className="text-slate-500 text-xs italic">Reviewed</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Leave Applications Approval Queue"
        subtitle="Review employee leave requests, approve entitlements, or specify rejection reasons"
      />

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300">Filter Queue:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Applications</option>
            <option value="PENDING">PENDING (Action Required)</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading leave applications queue..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRequests} />
      ) : (
        <div className="space-y-6">
          <DataTable
            data={requests}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search by request number, employee code or name..."
          />

          {/* Reject Reason Modal */}
          {rejectModalReq && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Reject Leave Request</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Please provide a reason for rejecting leave request <span className="text-rose-400 font-mono font-bold">{rejectModalReq.request_number}</span>.
                </p>

                <form onSubmit={handleRejectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rejection Reason / Comments</label>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Critical production line coverage requirement on selected shift dates"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 text-sm focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRejectModalReq(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
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

export default HRLeaveRequestListPage;
