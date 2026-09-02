import React, { useEffect, useState } from 'react';
import { Settings, Users, UserCheck, ShieldCheck } from 'lucide-react';
import { workflowService } from '../../../services/workflow.service';
import { ApprovalGroup, WorkflowDelegation } from '../../../types/workflow';

export const WorkflowSettingsPage: React.FC = () => {
  const [groups, setGroups] = useState<ApprovalGroup[]>([]);
  const [delegations, setDelegations] = useState<WorkflowDelegation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([workflowService.getGroups(), workflowService.getDelegations()])
      .then(([grpData, delData]) => {
        setGroups(grpData);
        setDelegations(delData);
      })
      .catch((err) => console.error('Failed to load workflow settings:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workflow Engine Settings & Groups</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configure reusable approval groups, active delegations, and escalation policies
            </p>
          </div>
        </div>
      </div>

      {/* Approval Groups Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" /> Reusable Approval Groups
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-4 text-center text-slate-400">Loading approval groups...</div>
          ) : groups.length === 0 ? (
            <div className="col-span-full p-4 text-center text-slate-400">No approval groups defined.</div>
          ) : (
            groups.map((grp) => (
              <div key={grp.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-sm">{grp.name}</div>
                <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400">{grp.code}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{grp.description || 'No description.'}</p>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                  Members: {grp.approval_group_members?.length || 0} active approvers
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delegations Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-500" /> Active Approval Delegations
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Delegator</th>
                <th className="px-6 py-4">Delegate User</th>
                <th className="px-6 py-4">Scope</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading delegations...
                  </td>
                </tr>
              ) : delegations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No active delegations configured.
                  </td>
                </tr>
              ) : (
                delegations.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{del.delegator?.full_name || del.delegator_id}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">{del.delegate?.full_name || del.delegate_id}</td>
                    <td className="px-6 py-4 text-xs uppercase">{del.scope_module}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {del.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">{new Date(del.start_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs font-mono">{new Date(del.end_date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
