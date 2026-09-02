import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, RefreshCw, Layers, IndianRupee, Building2 } from 'lucide-react';
import { costingService, CostingConfiguration } from '../../../../services/costing.service';
import api from '../../../../services/api';

export const CostConfigurationPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [workCenters, setWorkCenters] = useState<any[]>([]);
  const [config, setConfig] = useState<CostingConfiguration>({
    costing_method: 'ACTUAL_COST',
    default_hourly_labor_rate: 250.00,
    default_hourly_overhead_rate: 150.00,
    overhead_allocation_basis: 'PER_HOUR',
  });
  const [wcRates, setWcRates] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cfgRes, accRes, wcRes] = await Promise.all([
        costingService.getConfiguration(),
        api.get('/finance/accounts').catch(() => ({ data: { data: [] } })),
        api.get('/production/work-centers').catch(() => ({ data: { data: [] } })),
      ]);

      if (cfgRes.success) {
        if (cfgRes.data.config) {
          setConfig(cfgRes.data.config);
        }
        setWcRates(cfgRes.data.wc_rates || []);
      }

      setAccounts(accRes.data?.data || accRes.data || []);
      setWorkCenters(wcRes.data?.data || wcRes.data || []);
    } catch (err) {
      console.error('Error loading cost configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const res = await costingService.updateConfiguration({
        ...config,
        wc_rates: wcRates,
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Manufacturing cost configuration saved successfully.' });
        fetchData();
      }
    } catch (err: any) {
      console.error('Error saving configuration:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const updateWcRate = (wcId: string, field: string, val: number) => {
    setWcRates((prev) => {
      const idx = prev.findIndex((r) => r.work_center_id === wcId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], [field]: val };
        return updated;
      } else {
        return [...prev, { work_center_id: wcId, [field]: val }];
      }
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Manufacturing Cost Configuration
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Setup Work Center hourly labor rates, overhead allocation bases & General Ledger account mappings
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition shadow-sm"
        >
          <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          {saving ? 'Saving Setup...' : 'Save Configuration'}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading cost settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Costing Method & Default Rates */}
          <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              1. Valuation Method & Default Base Rates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Costing Method</label>
                <select
                  value={config.costing_method}
                  onChange={(e) => setConfig({ ...config, costing_method: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ACTUAL_COST">Actual Costing (Consumptions + Run Hours)</option>
                  <option value="STANDARD_COST">Standard Costing (BOM & Routing Rates)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Overhead Allocation Basis</label>
                <select
                  value={config.overhead_allocation_basis}
                  onChange={(e) => setConfig({ ...config, overhead_allocation_basis: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="PER_HOUR">Per Direct Labor / Machine Hour</option>
                  <option value="PER_UNIT">Per Finished Unit Produced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Default Labor Rate (₹ / Hour)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.default_hourly_labor_rate}
                  onChange={(e) => setConfig({ ...config, default_hourly_labor_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Default Overhead Rate (₹ / Hour)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.default_hourly_overhead_rate}
                  onChange={(e) => setConfig({ ...config, default_hourly_overhead_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: General Ledger Account Mappings */}
          <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              2. General Ledger Chart of Accounts Integration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Raw Material Issue Account</label>
                <select
                  value={config.raw_material_account_id || ''}
                  onChange={(e) => setConfig({ ...config, raw_material_account_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Select GL Account --</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.account_code} - {a.account_name} ({a.account_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Work In Progress (WIP) Account</label>
                <select
                  value={config.wip_account_id || ''}
                  onChange={(e) => setConfig({ ...config, wip_account_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Select GL Account --</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.account_code} - {a.account_name} ({a.account_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Finished Goods Inventory Account</label>
                <select
                  value={config.finished_goods_account_id || ''}
                  onChange={(e) => setConfig({ ...config, finished_goods_account_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Select GL Account --</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.account_code} - {a.account_name} ({a.account_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Direct Labor Allocation Account</label>
                <select
                  value={config.labor_cost_account_id || ''}
                  onChange={(e) => setConfig({ ...config, labor_cost_account_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Select GL Account --</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.account_code} - {a.account_name} ({a.account_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Manufacturing Overhead Account</label>
                <select
                  value={config.overhead_cost_account_id || ''}
                  onChange={(e) => setConfig({ ...config, overhead_cost_account_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Select GL Account --</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.account_code} - {a.account_name} ({a.account_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Production Cost Variance Account</label>
                <select
                  value={config.variance_account_id || ''}
                  onChange={(e) => setConfig({ ...config, variance_account_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Select GL Account --</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.account_code} - {a.account_name} ({a.account_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CostConfigurationPage;
