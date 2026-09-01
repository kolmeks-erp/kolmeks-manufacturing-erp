import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../../../services/crm.service';
import { CRMActivity, ActivityType } from '../../../types/crm';
import {
  Clock,
  Phone,
  Video,
  Mail,
  FileText,
  Plus,
  Filter,
  CheckCircle,
  Building2,
  Calendar,
} from 'lucide-react';

export const ActivitiesListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    activity_type: 'CALL' as ActivityType,
    subject: '',
    description: '',
    outcome: '',
    activity_date: new Date().toISOString().split('T')[0],
    duration_minutes: '15',
    customer_id: '',
    lead_id: '',
    opportunity_id: '',
  });

  const { data: activities, isLoading } = useQuery({
    queryKey: ['crmActivities', typeFilter],
    queryFn: () => crmService.getActivities({ activity_type: typeFilter }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => crmService.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmActivities'] });
      queryClient.invalidateQueries({ queryKey: ['crmDashboardKPIs'] });
      setIsModalOpen(false);
      setForm({
        activity_type: 'CALL',
        subject: '',
        description: '',
        outcome: '',
        activity_date: new Date().toISOString().split('T')[0],
        duration_minutes: '15',
        customer_id: '',
        lead_id: '',
        opportunity_id: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      duration_minutes: parseInt(form.duration_minutes) || 15,
      customer_id: form.customer_id || undefined,
      lead_id: form.lead_id || undefined,
      opportunity_id: form.opportunity_id || undefined,
    });
  };

  const getTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'CALL':
        return <Phone className="w-4 h-4 text-sky-500" />;
      case 'MEETING':
        return <Video className="w-4 h-4 text-purple-500" />;
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-amber-500" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Customer Activity & Touchpoint Log
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Record client phone calls, technical review meetings, emails, and interaction outcomes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors gap-2"
        >
          <Plus className="w-4 h-4" /> Log Customer Activity
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
          >
            <option value="">All Interaction Types</option>
            <option value="CALL">Phone Call</option>
            <option value="MEETING">Meeting</option>
            <option value="EMAIL">Email</option>
            <option value="NOTE">Internal Note</option>
          </select>
        </div>
      </div>

      {/* Activities Feed */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm divide-y divide-slate-200 dark:divide-slate-700">
        {isLoading ? (
          <p className="p-8 text-center text-slate-400">Loading activities...</p>
        ) : !activities || activities.length === 0 ? (
          <p className="p-8 text-center text-slate-400">No activities recorded.</p>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                {getTypeIcon(act.activity_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    {act.subject}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">{act.activity_date}</span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {act.customer?.company_name || 'Prospect Customer'}
                  </span>
                  <span>Duration: {act.duration_minutes || 15} mins</span>
                  <span>Owner: {act.owner ? `${act.owner.first_name} ${act.owner.last_name}` : 'Staff'}</span>
                </div>

                {act.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                    {act.description}
                  </p>
                )}

                {act.outcome && (
                  <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Outcome: {act.outcome}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" /> Log Activity
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Price Negotiation Call"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Type</label>
                  <select
                    value={form.activity_type}
                    onChange={(e) => setForm({ ...form, activity_type: e.target.value as ActivityType })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    <option value="CALL">Call</option>
                    <option value="MEETING">Meeting</option>
                    <option value="EMAIL">Email</option>
                    <option value="NOTE">Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.activity_date}
                    onChange={(e) => setForm({ ...form, activity_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Customer ID (Optional)</label>
                <input
                  type="text"
                  placeholder="Customer UUID"
                  value={form.customer_id}
                  onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Notes on what was discussed..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Outcome</label>
                <input
                  type="text"
                  placeholder="e.g. Client agreed to review revised quote by Friday"
                  value={form.outcome}
                  onChange={(e) => setForm({ ...form, outcome: e.target.value })}
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
                  {createMutation.isPending ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
