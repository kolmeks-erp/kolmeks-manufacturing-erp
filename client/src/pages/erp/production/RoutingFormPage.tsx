import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, GitFork } from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { productionService } from '../../../services/production.service';
import { apiClient } from '../../../services/api';
import { WorkCenter, Machine } from '../../../types/production';

export const RoutingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);

  const [productId, setProductId] = useState<string>('');
  const [version, setVersion] = useState<string>('V1');
  const [description, setDescription] = useState<string>('');

  const [operations, setOperations] = useState<
    Array<{
      sequence: string;
      operation_name: string;
      work_center_id: string;
      machine_id: string;
      setup_time_mins: string;
      run_time_mins: string;
    }>
  >([
    { sequence: '10', operation_name: 'CNC Lathe Rough Turning', work_center_id: '', machine_id: '', setup_time_mins: '15', run_time_mins: '5' },
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [prodRes, wcList, mList] = await Promise.all([
        apiClient.get('/products'),
        productionService.getWorkCenters(),
        productionService.getMachines(),
      ]);
      setProducts(prodRes.data?.data || []);
      setWorkCenters(wcList);
      setMachines(mList);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddOp = () => {
    const nextSeq = (operations.length + 1) * 10;
    setOperations([
      ...operations,
      { sequence: String(nextSeq), operation_name: '', work_center_id: '', machine_id: '', setup_time_mins: '0', run_time_mins: '0' },
    ]);
  };

  const handleRemoveOp = (idx: number) => {
    setOperations(operations.filter((_, i) => i !== idx));
  };

  const handleOpChange = (idx: number, field: string, val: string) => {
    const next = [...operations];
    (next[idx] as any)[field] = val;
    setOperations(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!productId) {
      setErrorMsg('Please select a Product.');
      return;
    }
    const validOps = operations.filter((o) => o.operation_name.trim() !== '');
    if (validOps.length === 0) {
      setErrorMsg('At least one named operation step is required.');
      return;
    }

    try {
      setLoading(true);
      const created = await productionService.createRouting({
        product_id: productId,
        version,
        description: description || undefined,
        operations: validOps.map((o) => ({
          sequence: parseInt(o.sequence, 10),
          operation_name: o.operation_name,
          work_center_id: o.work_center_id || undefined,
          machine_id: o.machine_id || undefined,
          setup_time_mins: parseFloat(o.setup_time_mins || '0'),
          run_time_mins: parseFloat(o.run_time_mins || '0'),
        })),
      });

      navigate(`${ERP_BASE_PATH}/production/routings/${created.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to create routing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/production/routings`)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Define Manufacturing Routing</h1>
          <p className="text-slate-400 text-sm">Specify step-by-step shop floor operations.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Product Master *</label>
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select Product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_code} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Operation Sequence */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitFork className="w-5 h-5 text-cyan-400" />
              <span>Operations Sequence Steps</span>
            </h3>
            <button
              type="button"
              onClick={handleAddOp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 text-xs font-semibold border border-cyan-500/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Step
            </button>
          </div>

          <div className="space-y-3">
            {operations.map((op, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-1">Seq #</label>
                    <input
                      type="number"
                      value={op.sequence}
                      onChange={(e) => handleOpChange(idx, 'sequence', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="col-span-9">
                    <label className="block text-[10px] text-slate-500 mb-1">Operation Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., CNC Lathe Rough Turning, Milling Keyway..."
                      value={op.operation_name}
                      onChange={(e) => handleOpChange(idx, 'operation_name', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 text-center pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveOp(idx)}
                      disabled={operations.length === 1}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Work Center</label>
                    <select
                      value={op.work_center_id}
                      onChange={(e) => handleOpChange(idx, 'work_center_id', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                    >
                      <option value="">Any Work Center</option>
                      {workCenters.map((wc) => (
                        <option key={wc.id} value={wc.id}>
                          {wc.name} ({wc.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Machine</label>
                    <select
                      value={op.machine_id}
                      onChange={(e) => handleOpChange(idx, 'machine_id', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                    >
                      <option value="">Any Machine</option>
                      {machines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Setup Mins</label>
                    <input
                      type="number"
                      value={op.setup_time_mins}
                      onChange={(e) => handleOpChange(idx, 'setup_time_mins', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Run Mins/Unit</label>
                    <input
                      type="number"
                      value={op.run_time_mins}
                      onChange={(e) => handleOpChange(idx, 'run_time_mins', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/production/routings`)}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Routing Definition'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
