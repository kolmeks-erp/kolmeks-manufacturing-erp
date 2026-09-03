import React, { useEffect, useState } from 'react';
import { Cpu, Plus, Search, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { productionService } from '../../../services/production.service';
import { Machine, MachineStatus, WorkCenter } from '../../../types/production';

export const MachineListPage: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form state
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [machineType, setMachineType] = useState<string>('CNC Lathe');
  const [manufacturer, setManufacturer] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [workCenterId, setWorkCenterId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchMachines();
    fetchWorkCenters();
  }, [search, statusFilter]);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const data = await productionService.getMachines({ search, status: statusFilter });
      setMachines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkCenters = async () => {
    try {
      const data = await productionService.getWorkCenters();
      setWorkCenters(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: MachineStatus) => {
    try {
      await productionService.updateMachineStatus(id, newStatus);
      fetchMachines();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await productionService.createMachine({
        code,
        name,
        machine_type: machineType,
        manufacturer: manufacturer || undefined,
        model: model || undefined,
        work_center_id: workCenterId || undefined,
        description: description || undefined,
      });

      setShowModal(false);
      setCode('');
      setName('');
      fetchMachines();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusBadge = (st: MachineStatus) => {
    switch (st) {
      case 'AVAILABLE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">AVAILABLE</span>;
      case 'RUNNING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">RUNNING</span>;
      case 'MAINTENANCE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">MAINTENANCE</span>;
      case 'BREAKDOWN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">BREAKDOWN</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs text-slate-400">{st}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-200 shrink-0">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Machine Master</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Register CNC machines, monitor operational status, and assign shop floor work centers
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register Machine</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, machine name, or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="RUNNING">RUNNING</option>
          <option value="MAINTENANCE">MAINTENANCE</option>
          <option value="BREAKDOWN">BREAKDOWN</option>
        </select>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">Loading machines...</div>
        ) : machines.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No machines registered.</div>
        ) : (
          machines.map((m) => (
            <div key={m.id} className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 hover:shadow-md transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-700 px-2.5 py-1 rounded bg-cyan-50 border border-cyan-200">
                  {m.code}
                </span>
                {renderStatusBadge(m.status)}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{m.name}</h3>
                <div className="text-xs text-slate-500 mt-1">{m.manufacturer} {m.model} ({m.machine_type})</div>
              </div>

              <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 flex items-center justify-between">
                <span>Work Center: <strong className="text-slate-800">{m.work_center?.name || 'Unassigned'}</strong></span>
                <select
                  value={m.status}
                  onChange={(e) => handleStatusChange(m.id, e.target.value as MachineStatus)}
                  className="px-2 py-1 rounded bg-slate-50 border border-slate-300 text-[11px] text-slate-700 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="RUNNING">RUNNING</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="BREAKDOWN">BREAKDOWN</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Register CNC Machine</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNC-LATHE-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Okuma LB3000 EX II CNC Lathe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="Okuma, Haas..."
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="LB3000..."
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Work Center</label>
                <select
                  value={workCenterId}
                  onChange={(e) => setWorkCenterId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Unassigned</option>
                  {workCenters.map((wc) => (
                    <option key={wc.id} value={wc.id}>
                      {wc.name} ({wc.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium shadow-sm"
                >
                  Save Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
