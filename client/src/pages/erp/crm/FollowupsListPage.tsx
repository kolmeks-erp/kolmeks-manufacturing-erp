import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../../../services/crm.service';
import { CRMFollowup } from '../../../types/crm';
import { Calendar, Plus, Filter, AlertTriangle, CheckCircle, Clock, Building2 } from 'lucide-react';

export const FollowupsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    purpose: '',
    followup_date: new Date().toISOString().split('T')[0],
    notes: '',
    customer_id: '',
  });

  const { data: followups, isLoading } = useQuery({
    queryKey: ['crmFollowups', statusFilter],
    queryFn: () => crmService.getFollowups({ status: statusFilter }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => crmService.createFollowup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmFollowups'] });
      queryClient.invalidateQueries({ queryKey: ['crmDashboardKPIs'] });
      setIsModalOpen(false);
      setForm({
        purpose: '',
        followup_date: new Date().toISOString().split('T')[0],
        notes: '',
        customer_id: '',
      });
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
            <Calendar className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Client Follow-up Schedule & Reminders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ensure timely communication with prospective accounts and prevent deal stagnation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors gap-2"
        >
          <Plus className="w-4 h-4" /> Schedule Follow-up
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
            <option value="">All Follow-up Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="OVERDUE">Overdue</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm divide-y divide-slate-200 dark:divide-slate-700">
        {isLoading ? (
          <p className="p-8 text-center text-slate-400">Loading follow-ups...</p>
        ) : !followups || followups.length === 0 ? (
          <p className="p-8 text-center text-slate-400">No follow-ups scheduled.</p>
        ) : (
          followups.map((fu) => (
            <div key={fu.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${fu.status === 'OVERDUE' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {fu.status === 'OVERDUE' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    {fu.purpose}
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${fu.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'}`}>
                    {fu.followup_date}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Customer: {fu.customer?.company_name || 'Prospect Account'} • Assigned: {fu.owner?.first_name || 'Staff'}
                </p>
                {fu.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60">
                    {fu.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" /> Schedule Follow-up
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Follow-up Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call client regarding contract approval"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Scheduled Date *</label>
                <input
                  type="date"
                  required
                  value={form.followup_date}
                  onChange={(e) => setForm({ ...form, followup_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
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
                  {createMutation.isPending ? 'Saving...' : 'Save Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
