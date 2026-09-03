import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, User, Calendar } from 'lucide-react';
import { workflowService } from '../../../services/workflow.service';
import { WorkflowHistoryItem } from '../../../types/workflow';

export const WorkflowHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<WorkflowHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    workflowService
      .getHistory()
      .then((res) => setHistory(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []))
      .catch((err) => {
        console.error('Failed to load workflow history:', err);
        setHistory([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Workflow Audit History Trail</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Immutable timeline of all workflow starts, stage transitions, approvals, rejections, and reassignments
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Event Type</th>
                <th className="px-5 py-3.5">Workflow Instance</th>
                <th className="px-5 py-3.5">Actor / Approver</th>
                <th className="px-5 py-3.5">Notes / Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Loading workflow history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No history log entries recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                        {item.event_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-900">
                      {item.workflow_instances?.entity_reference || item.workflow_instances?.instance_number}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-800">
                      {item.profiles?.full_name || 'System / Auto'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {item.notes || 'N/A'}
                    </td>
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
