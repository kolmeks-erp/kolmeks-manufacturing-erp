import React, { useEffect, useState } from 'react';
import { Lock, Save, CheckCircle, Sliders } from 'lucide-react';
import { SecurityNavigationHeader } from '../../../components/security/SecurityNavigationHeader';
import { securityService } from '../../../services/security.service';
import { SecurityPolicyRecord } from '../../../types/security';

export const SecurityPoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<SecurityPolicyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingPolicy, setEditingPolicy] = useState<SecurityPolicyRecord | null>(null);
  const [jsonValue, setJsonValue] = useState('');

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await securityService.getSecurityPolicies();
      setPolicies(data);
    } catch (err) {
      console.error('Failed to load security policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleEditClick = (p: SecurityPolicyRecord) => {
    setEditingPolicy(p);
    setJsonValue(JSON.stringify(p.value, null, 2));
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;
    try {
      const parsed = JSON.parse(jsonValue);
      await securityService.updateSecurityPolicy(editingPolicy.policy_key, parsed);
      setEditingPolicy(null);
      fetchPolicies();
    } catch (err: any) {
      alert(err.message || 'Invalid JSON format or policy update failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Lock className="w-7 h-7 text-indigo-400" />
            <span>System Security Policies & Hardening Controls</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure password strength parameters, session inactivity timeouts, account lockout thresholds, and export boundaries.
          </p>
        </div>
      </div>

      <SecurityNavigationHeader />

      {/* Policies List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading security policy registry...</p>
        ) : (
          policies.map((p) => (
            <div key={p.id} className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold uppercase">
                    {p.category}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">{p.policy_name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                </div>
                <button
                  onClick={() => handleEditClick(p)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/60 font-mono text-xs text-emerald-400 overflow-x-auto">
                <pre>{JSON.stringify(p.value, null, 2)}</pre>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Configure Policy Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Update Policy: {editingPolicy.policy_name}</h3>
            <form onSubmit={handleSavePolicy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Policy Configuration (JSON Format)</label>
                <textarea
                  rows={8}
                  value={jsonValue}
                  onChange={(e) => setJsonValue(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 font-semibold text-sm rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition shadow-md flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Policy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
