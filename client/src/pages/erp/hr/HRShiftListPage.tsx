import React, { useEffect, useState } from 'react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { Shift } from '../../../types/hr_operations';
import { Clock, Plus } from 'lucide-react';

const HRShiftListPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [shiftCode, setShiftCode] = useState('');
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakMins, setBreakMins] = useState('60');
  const [graceMins, setGraceMins] = useState('15');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrOperationsService.getShifts();
      setShifts(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load shifts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftCode || !name || !startTime || !endTime) return;

    try {
      setSubmitting(true);
      await hrOperationsService.createShift({
        shift_code: shiftCode,
        name,
        start_time: startTime + ':00',
        end_time: endTime + ':00',
        break_duration_minutes: parseInt(breakMins, 10) || 60,
        grace_minutes: parseInt(graceMins, 10) || 15,
        description,
      });
      setShowModal(false);
      setShiftCode('');
      setName('');
      fetchShifts();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create shift schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Shift Code',
      accessor: (row: Shift) => (
        <span className="font-mono text-cyan-400 font-bold">{row.shift_code}</span>
      ),
    },
    {
      header: 'Shift Name',
      accessor: (row: Shift) => (
        <span className="font-medium text-white">{row.name}</span>
      ),
    },
    {
      header: 'Working Hours',
      accessor: (row: Shift) => (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {row.start_time.substring(0, 5)} - {row.end_time.substring(0, 5)}
        </span>
      ),
    },
    {
      header: 'Break Duration',
      accessor: (row: Shift) => (
        <span className="text-slate-300 text-xs font-medium">{row.break_duration_minutes} Mins</span>
      ),
    },
    {
      header: 'Grace Period',
      accessor: (row: Shift) => (
        <span className="text-amber-400 font-mono text-xs font-semibold">+{row.grace_minutes} Mins</span>
      ),
    },
    {
      header: 'Description',
      accessor: (row: Shift) => (
        <span className="text-slate-400 text-xs">{row.description || 'Manufacturing shift'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Shift) => (
        <StatusBadge status={row.status} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Plant Work Shift Management"
        subtitle="Define working hours, lunch break allocations, and arrival grace periods for shop floor shifts"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium shadow-sm transition-all text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Work Shift
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Loading work shifts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchShifts} />
      ) : (
        <div className="space-y-6">
          <DataTable
            data={shifts}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search by shift code or name..."
          />

          {/* New Shift Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Create Work Shift</h3>
                <p className="text-xs text-slate-400 mb-4">Configure working hours and grace times for shop floor or office shifts.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Shift Code (Unique)</label>
                    <input
                      type="text"
                      placeholder="e.g. SHIFT-GEN, SHIFT-A"
                      value={shiftCode}
                      onChange={(e) => setShiftCode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Shift Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Morning CNC Shift A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Start Time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">End Time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Break (Mins)</label>
                      <input
                        type="number"
                        value={breakMins}
                        onChange={(e) => setBreakMins(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Grace (Mins)</label>
                      <input
                        type="number"
                        value={graceMins}
                        onChange={(e) => setGraceMins(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional notes"
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
                      {submitting ? 'Creating...' : 'Save Shift'}
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

export default HRShiftListPage;
