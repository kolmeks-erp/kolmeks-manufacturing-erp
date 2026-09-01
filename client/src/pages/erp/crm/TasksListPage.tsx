import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../../../services/crm.service';
import { CRMTask, TaskStatus, LeadPriority } from '../../../types/crm';
import { CheckSquare, Plus, Filter, Calendar, Clock, CheckCircle2, Building2 } from 'lucide-react';

export const TasksListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    task_title: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'NORMAL' as LeadPriority,
    description: '',
    customer_id: '',
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['crmTasks', statusFilter],
    queryFn: () => crmService.getTasks({ status: statusFilter }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => crmService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmTasks'] });
      setIsModalOpen(false);
      setForm({
        task_title: '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'NORMAL',
        description: '',
        customer_id: '',
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => crmService.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmTasks'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      customer_id: form.customer_id || undefined,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            CRM Tasks & Action Items
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Assign sales action items, set target completion dates, and track sales team deliverables.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors gap-2"
        >
          <Plus className="w-4 h-4" /> Create Task
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
          >
            <option value="">All Task Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm divide-y divide-slate-200 dark:divide-slate-700">
        {isLoading ? (
          <p className="p-8 text-center text-slate-400">Loading tasks...</p>
        ) : !tasks || tasks.length === 0 ? (
          <p className="p-8 text-center text-slate-400">No tasks found.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => statusMutation.mutate({ id: task.id, status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' })}
                  className={`mt-1 p-1 rounded ${task.status === 'COMPLETED' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:text-slate-500'}`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <div>
                  <h3 className={`font-semibold text-sm ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {task.task_title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Due: <strong className="text-indigo-600">{task.due_date}</strong> • Customer: {task.customer?.company_name || 'N/A'} • Assigned: {task.owner?.first_name || 'Staff'}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${task.priority === 'URGENT' || task.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'}`}>
                {task.priority}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" /> Create Task
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Send technical specs PDF to client"
                  value={form.task_title}
                  onChange={(e) => setForm({ ...form, task_title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as LeadPriority })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
