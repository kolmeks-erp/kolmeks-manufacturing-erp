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
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
      case 'In Progress':
      case 'Pending':
        return 'bg-blue-50 text-blue-700 border border-blue-200/80';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border border-rose-200/80';
      case 'Changes Requested':
        return 'bg-purple-50 text-purple-700 border border-purple-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <GitBranch className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Workflow Instances Monitor</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live tracking and status audit of active, completed, and pending workflow executions across all modules
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Instance Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInstances()}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
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
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Instance Number</th>
                <th className="px-5 py-3.5">Workflow & Module</th>
                <th className="px-5 py-3.5">Entity Reference</th>
                <th className="px-5 py-3.5">Current Stage</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Started Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Loading workflow instances...
                  </td>
                </tr>
              ) : instances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No matching workflow instances found.
                  </td>
                </tr>
              ) : (
                instances.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {inst.instance_number}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{inst.workflow_definitions?.name}</div>
                      <span className="text-[10px] font-bold uppercase text-blue-600">
                        {inst.workflow_definitions?.module}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-700">
                      {inst.entity_reference || inst.entity_id}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-800">
                      {inst.workflow_stages?.name || 'In Progress'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(inst.status)}`}>
                        {inst.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500">
                      {new Date(inst.started_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/secure-kolmeks-x0y0/workflows/instances/${inst.id}`)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-all cursor-pointer"
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
