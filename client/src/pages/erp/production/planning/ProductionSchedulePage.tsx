import React, { useEffect, useState } from 'react';
import {
  Clock,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  Building2,
  Cpu,
  RefreshCw,
  Edit2,
  CheckCircle,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import ERPPageHeader from '../../../../components/erp/ERPPageHeader';
import StatusBadge from '../../../../components/erp/StatusBadge';
import LoadingState from '../../../../components/erp/LoadingState';
import ErrorState from '../../../../components/erp/ErrorState';
import EmptyState from '../../../../components/erp/EmptyState';
import { planningService, WorkOrderSchedule } from '../../../../services/planning.service';
import api from '../../../../services/api';

const ProductionSchedulePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<WorkOrderSchedule[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<WorkOrderSchedule | null>(null);

  // Form State
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  const [workCenters, setWorkCenters] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);

  const [poId, setPoId] = useState<string>('');
  const [wcId, setWcId] = useState<string>('');
  const [machineId, setMachineId] = useState<string>('');
  const [pStart, setPStart] = useState<string>('');
  const [pEnd, setPEnd] = useState<string>('');
  const [setupHrs, setSetupHrs] = useState<number>(1);
  const [runHrs, setRunHrs] = useState<number>(4);
  const [priority, setPriority] = useState<string>('NORMAL');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState<boolean>(false);

  // Reschedule state
  const [reschedStart, setReschedStart] = useState<string>('');
  const [reschedEnd, setReschedEnd] = useState<string>('');
  const [reschedReason, setReschedReason] = useState<string>('');

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await planningService.getSchedules({
        search,
        status: statusFilter || undefined,
      });
      if (res.success) {
        setSchedules(res.data || []);
      } else {
        setError(res.message || 'Failed to load production schedules.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading production schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    // Load dropdown master data
    api.get('/production/orders').then((res) => setProductionOrders(res.data?.data || [])).catch(() => {});
    api.get('/production/work-centers').then((res) => setWorkCenters(res.data?.data || [])).catch(() => {});
    api.get('/production/machines').then((res) => setMachines(res.data?.data || [])).catch(() => {});
  }, [statusFilter]);

  const handleCreateScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    setConflictWarning(null);
    try {
      const res = await planningService.createSchedule({
        production_order_id: poId,
        work_center_id: wcId,
        machine_id: machineId || undefined,
        planned_start: pStart,
        planned_end: pEnd,
        setup_time_hours: setupHrs,
        run_time_hours: runHrs,
        priority: priority as any,
      });

      if (res.has_conflict) {
        setConflictWarning(`Overlap Conflict Detected: Conflicting with Schedule ${res.conflict_details?.schedule_number}`);
      }

      if (res.success) {
        setShowCreateModal(false);
        fetchSchedules();
      }
    } catch (err: any) {
      setConflictWarning(err.response?.data?.message || 'Error creating schedule.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    setModalSubmitting(true);
    try {
      const res = await planningService.rescheduleWorkOrder(selectedSchedule.id, {
        new_planned_start: reschedStart,
        new_planned_end: reschedEnd,
        reason: reschedReason,
      });
      if (res.success) {
        setShowRescheduleModal(false);
        fetchSchedules();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reschedule.');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <ERPLayout>
      <div className="space-y-6">
        <ERPPageHeader
          title="Production & Work Order Schedule Board"
          subtitle="Work order scheduling across work centers and CNC machines with overlap conflict detection"
          actions={
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus size={16} /> Schedule Work Order
            </button>
          }
        />

        {/* Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by schedule number or work center..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="CONFLICTED">CONFLICTED</option>
              <option value="RESCHEDULED">RESCHEDULED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>

        {/* Schedule List */}
        {loading ? (
          <LoadingState message="Loading Work Order Schedules..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchSchedules} />
        ) : schedules.length === 0 ? (
          <EmptyState
            title="No Production Schedules Found"
            description="Create your first work order schedule to assign production operations to machine work centers."
            actionText="Schedule Work Order"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Schedule No.</th>
                    <th className="px-4 py-3">Production Order</th>
                    <th className="px-4 py-3">Work Center</th>
                    <th className="px-4 py-3">Machine Asset</th>
                    <th className="px-4 py-3">Planned Window</th>
                    <th className="px-4 py-3 text-right">Setup + Run Hrs</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-400">{s.schedule_number}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100">
                          {s.production_order?.production_order_number || 'PO'}
                        </div>
                        <div className="text-slate-400">{s.production_order?.product?.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-200">{s.work_center?.name}</span>
                        <span className="font-mono text-slate-400 block text-[11px]">{s.work_center?.code}</span>
                      </td>
                      <td className="px-4 py-3">
                        {s.machine ? (
                          <span className="font-mono text-indigo-400">{s.machine.name}</span>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        <div>{new Date(s.planned_start).toLocaleString()}</div>
                        <div className="text-slate-400">to {new Date(s.planned_end).toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-200">
                        {Number(s.setup_time_hours || 0) + Number(s.run_time_hours || 0)} hrs
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedSchedule(s);
                            setReschedStart(s.planned_start ? s.planned_start.slice(0, 16) : '');
                            setReschedEnd(s.planned_end ? s.planned_end.slice(0, 16) : '');
                            setShowRescheduleModal(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 flex items-center gap-1 transition-colors mx-auto"
                        >
                          <Edit2 size={13} /> Reschedule
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Schedule Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Clock className="text-blue-400" size={20} /> Schedule Work Order Operation
              </h3>

              {conflictWarning && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-medium flex items-center gap-2">
                  <AlertTriangle size={16} /> {conflictWarning}
                </div>
              )}

              <form onSubmit={handleCreateScheduleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Production Order *</label>
                  <select
                    required
                    value={poId}
                    onChange={(e) => setPoId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="">-- Select Production Order --</option>
                    {productionOrders.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.production_order_number} - {po.product?.name} ({po.planned_quantity} pcs)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Work Center *</label>
                    <select
                      required
                      value={wcId}
                      onChange={(e) => setWcId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                    >
                      <option value="">-- Select Work Center --</option>
                      {workCenters.map((wc) => (
                        <option key={wc.id} value={wc.id}>
                          {wc.code} - {wc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Machine Asset</label>
                    <select
                      value={machineId}
                      onChange={(e) => setMachineId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                    >
                      <option value="">-- Select Machine --</option>
                      {machines.map((mc) => (
                        <option key={mc.id} value={mc.id}>
                          {mc.code} - {mc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Planned Start Datetime *</label>
                    <input
                      type="datetime-local"
                      required
                      value={pStart}
                      onChange={(e) => setPStart(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Planned End Datetime *</label>
                    <input
                      type="datetime-local"
                      required
                      value={pEnd}
                      onChange={(e) => setPEnd(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Setup Time (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={setupHrs}
                      onChange={(e) => setSetupHrs(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Run Time (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={runHrs}
                      onChange={(e) => setRunHrs(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-500 disabled:opacity-50"
                  >
                    Confirm Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && selectedSchedule && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Edit2 className="text-amber-400" size={20} /> Reschedule {selectedSchedule.schedule_number}
              </h3>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">New Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={reschedStart}
                    onChange={(e) => setReschedStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">New End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={reschedEnd}
                    onChange={(e) => setReschedEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Reason for Rescheduling</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Machine maintenance shift delay..."
                    value={reschedReason}
                    onChange={(e) => setReschedReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="px-4 py-2 bg-amber-600 text-white rounded font-medium hover:bg-amber-500 disabled:opacity-50"
                  >
                    Save Reschedule History
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ERPLayout>
  );
};

export default ProductionSchedulePage;
