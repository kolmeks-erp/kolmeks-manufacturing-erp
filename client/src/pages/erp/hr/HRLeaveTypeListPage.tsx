import React, { useEffect, useState } from 'react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { LeaveType } from '../../../types/hr_operations';
import { FileSpreadsheet, Plus } from 'lucide-react';

const HRLeaveTypeListPage: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Modal State
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [defaultDays, setDefaultDays] = useState('12');
  const [paid, setPaid] = useState(true);
  const [carryForward, setCarryForward] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrOperationsService.getLeaveTypes();
      setLeaveTypes(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load leave policy master.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    try {
      setSubmitting(true);
      await hrOperationsService.createLeaveType({
        code,
        name,
        default_days_per_year: parseFloat(defaultDays) || 0,
        paid,
        carry_forward_allowed: carryForward,
        description,
      });
      setShowModal(false);
      setCode('');
      setName('');
      setDescription('');
      fetchLeaveTypes();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create leave policy.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Policy Code',
      accessor: (row: LeaveType) => (
        <span className="font-mono text-cyan-400 font-bold">{row.code}</span>
      ),
    },
    {
      header: 'Policy Name',
      accessor: (row: LeaveType) => (
        <span className="font-medium text-white">{row.name}</span>
      ),
    },
    {
      header: 'Annual Quota',
      accessor: (row: LeaveType) => (
        <span className="font-bold text-white text-xs">{row.default_days_per_year} Days / Year</span>
      ),
    },
    {
      header: 'Paid Leave',
      accessor: (row: LeaveType) => (
        row.paid ? (
          <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
            PAID LEAVE
          </span>
        ) : (
          <span className="px-2 py-0.5 text-xs font-semibold bg-slate-800 text-slate-400 rounded-md border border-slate-700">
            UNPAID
          </span>
        )
      ),
    },
    {
      header: 'Carry Forward',
      accessor: (row: LeaveType) => (
        <span className="text-xs font-medium text-slate-300">
          {row.carry_forward_allowed ? 'Allowed' : 'No'}
        </span>
      ),
    },
    {
      header: 'Description',
      accessor: (row: LeaveType) => (
        <span className="text-slate-400 text-xs">{row.description || 'Standard policy'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: LeaveType) => (
        <StatusBadge status={row.status} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Workforce Leave Policies Master"
        subtitle="Configure Casual, Sick, Annual, and Special leave categories and yearly rules"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium shadow-sm transition-all text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Leave Policy
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Loading leave policies..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLeaveTypes} />
      ) : (
        <div className="space-y-6">
          <DataTable
            data={leaveTypes}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search by policy code or name..."
          />

          {/* New Policy Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Create Leave Policy</h3>
                <p className="text-xs text-slate-400 mb-4">Define leave entitlement rules for workforce employees.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Policy Code (Unique)</label>
                    <input
                      type="text"
                      placeholder="e.g. CL, SL, AL, UL"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Policy Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Casual Leave"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Default Days Per Year</label>
                    <input
                      type="number"
                      value={defaultDays}
                      onChange={(e) => setDefaultDays(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center text-xs text-slate-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paid}
                        onChange={(e) => setPaid(e.target.checked)}
                        className="mr-2 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                      />
                      Paid Leave
                    </label>

                    <label className="flex items-center text-xs text-slate-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={carryForward}
                        onChange={(e) => setCarryForward(e.target.checked)}
                        className="mr-2 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                      />
                      Allow Carry Forward
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional details"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 text-sm focus:outline-none focus:border-cyan-500"
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
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {submitting ? 'Creating...' : 'Save Policy'}
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

export default HRLeaveTypeListPage;
