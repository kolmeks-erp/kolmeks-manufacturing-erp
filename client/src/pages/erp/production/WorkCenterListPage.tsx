import React, { useEffect, useState } from 'react';
import { Factory, Plus, Search, CheckCircle2, Cpu } from 'lucide-react';
import { productionService } from '../../../services/production.service';
import { WorkCenter } from '../../../types/production';

export const WorkCenterListPage: React.FC = () => {
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<string>('CNC Machining');
  const [capacity, setCapacity] = useState<string>('1.00');
  const [description, setDescription] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchWorkCenters();
  }, [search]);

  const fetchWorkCenters = async () => {
    try {
      setLoading(true);
      const data = await productionService.getWorkCenters({ search });
      setWorkCenters(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await productionService.createWorkCenter({
        code,
        name,
        type,
        capacity: parseFloat(capacity),
        description: description || undefined,
      });

      setShowModal(false);
      setCode('');
      setName('');
      fetchWorkCenters();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 shrink-0">
            <Factory className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Work Centers</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage shop floor machining departments, capacity, and active machines
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Work Center</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-2xl flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search work centers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading work centers...</div>
        ) : workCenters.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">No work centers defined.</div>
        ) : (
          workCenters.map((wc) => (
            <div key={wc.id} className="bg-white border border-slate-200 shadow-xs p-5 rounded-2xl space-y-3 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-700 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200">
                  {wc.code}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {wc.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{wc.name}</h3>
                <p className="text-slate-500 text-xs mt-1">{wc.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
                <div>
                  <span className="text-slate-400">Type:</span>
                  <div className="text-slate-800 font-medium">{wc.type}</div>
                </div>
                <div>
                  <span className="text-slate-400">Machines:</span>
                  <div className="text-cyan-700 font-bold flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{wc.machine_count || 0} Machines</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Create Work Center</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WC-CNC-001"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNC Turning Department"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                >
                  Create Work Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
