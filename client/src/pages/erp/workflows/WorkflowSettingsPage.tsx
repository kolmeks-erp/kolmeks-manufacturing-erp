import React, { useEffect, useState } from 'react';
import { Settings, Users, UserCheck, ShieldCheck } from 'lucide-react';
import { workflowService } from '../../../services/workflow.service';
import { ApprovalGroup, WorkflowDelegation } from '../../../types/workflow';

export const WorkflowSettingsPage: React.FC = () => {
  const [groups, setGroups] = useState<ApprovalGroup[]>([]);
  const [delegations, setDelegations] = useState<WorkflowDelegation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      workflowService.getGroups().catch(() => []),
      workflowService.getDelegations().catch(() => []),
    ])
      .then(([grpData, delData]) => {
        setGroups(Array.isArray(grpData) ? grpData : []);
        setDelegations(Array.isArray(delData) ? delData : []);
      })
      .catch((err) => {
        console.error('Failed to load workflow settings:', err);
        setGroups([]);
        setDelegations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Workflow Engine Settings & Groups</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure reusable approval groups, active delegations, and escalation policies
            </p>
          </div>
        </div>
      </div>

      {/* Approval Groups Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-4.5 h-4.5 text-blue-600" /> Reusable Approval Groups
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-6 text-center text-slate-400 text-xs">Loading approval groups...</div>
          ) : groups.length === 0 ? (
            <div className="col-span-full py-6 text-center text-slate-400 text-xs">No approval groups defined.</div>
          ) : (
            groups.map((grp) => (
              <div key={grp.id} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-900 text-sm">{grp.name}</div>
                <div className="text-[11px] font-mono text-blue-600">{grp.code}</div>
                <p className="text-xs text-slate-500">{grp.description || 'No description.'}</p>
                <div className="text-xs font-semibold text-slate-700 pt-2 border-t border-slate-200/70">
                  Members: {grp.approval_group_members?.length || 0} active approvers
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delegations Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-4.5 h-4.5 text-emerald-600" /> Active Approval Delegations
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Delegator</th>
                <th className="px-5 py-3.5">Delegate User</th>
                <th className="px-5 py-3.5">Scope</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Start Date</th>
                <th className="px-5 py-3.5">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Loading delegations...
                  </td>
                </tr>
              ) : delegations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No active delegations configured.
                  </td>
                </tr>
              ) : (
                delegations.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{del.delegator?.full_name || del.delegator_id}</td>
                    <td className="px-5 py-3.5 font-semibold text-blue-600">{del.delegate?.full_name || del.delegate_id}</td>
                    <td className="px-5 py-3.5 text-xs uppercase">{del.scope_module}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        {del.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{new Date(del.start_date).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{new Date(del.end_date).toLocaleDateString()}</td>
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
