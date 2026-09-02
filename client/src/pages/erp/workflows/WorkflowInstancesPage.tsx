import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Search, Filter, Eye, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { workflowService } from '../../../services/workflow.service';
import { WorkflowInstance } from '../../../types/workflow';

export const WorkflowInstancesPage: React.FC = () => {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const res = await workflowService.getInstances({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setInstances(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load workflow instances:', err);
      setInstances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'In Progress':
      case 'Pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
      case 'Changes Requested':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <GitBranch className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workflow Instances Monitor</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Live tracking and status audit of active, completed, and pending workflow executions across all modules
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Instance Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInstances()}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="">All Workflow Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Changes Requested">Changes Requested</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Instances Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Instance Number</th>
                <th className="px-6 py-4">Workflow & Module</th>
                <th className="px-6 py-4">Entity Reference</th>
                <th className="px-6 py-4">Current Stage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Started Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading workflow instances...
                  </td>
                </tr>
              ) : instances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No matching workflow instances found.
                  </td>
                </tr>
              ) : (
                instances.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {inst.instance_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{inst.workflow_definitions?.name}</div>
                      <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                        {inst.workflow_definitions?.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {inst.entity_reference || inst.entity_id}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {inst.workflow_stages?.name || 'In Progress'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(inst.status)}`}>
                        {inst.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">
                      {new Date(inst.started_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/secure-kolmeks-x0y0/workflows/instances/${inst.id}`)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg"
                        title="View Timeline"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
