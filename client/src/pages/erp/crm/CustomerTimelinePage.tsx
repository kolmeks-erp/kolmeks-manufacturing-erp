import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../../../services/crm.service';
import {
  Clock,
  Building2,
  Mail,
  Phone,
  FileText,
  IndianRupee,
  Send,
  Plus,
  Tag,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const CustomerTimelinePage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customerTimeline', customerId],
    queryFn: () => crmService.getCustomerTimeline(customerId!),
    enabled: !!customerId,
  });

  const noteMutation = useMutation({
    mutationFn: (noteText: string) => crmService.addCustomerNote(customerId!, noteText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerTimeline', customerId] });
      setNewNote('');
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    noteMutation.mutate(newNote);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading customer timeline feed...</div>;
  }

  if (!data || !data.customer) {
    return <div className="p-8 text-center text-rose-500">Customer account record not found.</div>;
  }

  const { customer, timeline } = data;

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'LEAD':
        return <Tag className="w-4 h-4 text-sky-500" />;
      case 'OPPORTUNITY':
        return <IndianRupee className="w-4 h-4 text-emerald-500" />;
      case 'ACTIVITY':
        return <Phone className="w-4 h-4 text-indigo-500" />;
      case 'NOTE':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'QUOTATION':
      case 'SALES_ORDER':
      case 'INVOICE':
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs rounded-full">
            {customer.customer_code}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {customer.company_name || `${customer.first_name} ${customer.last_name}`}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-4">
            <span>Segment: <strong className="text-slate-700 dark:text-slate-200">{customer.segment || 'SMB'}</strong></span>
            <span>Email: <strong className="text-indigo-600">{customer.email || 'N/A'}</strong></span>
            <span>Phone: <strong className="text-slate-700 dark:text-slate-200">{customer.phone || 'N/A'}</strong></span>
          </p>
        </div>
      </div>

      {/* Grid: Note Editor & Timeline Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Internal Customer Note Editor */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-amber-500" /> Internal Account Note
            </h2>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={4}
                required
                placeholder="Log internal note, client preference, payment term agreement..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={noteMutation.isPending}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> {noteMutation.isPending ? 'Saving...' : 'Post Customer Note'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Unified Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3 flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-indigo-500" /> 360-Degree Unified Interaction Feed
            </h2>

            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-6">
              {timeline.length === 0 ? (
                <p className="text-xs text-slate-400">No customer timeline events recorded yet.</p>
              ) : (
                timeline.map((item: any, idx: number) => (
                  <div key={idx} className="relative group">
                    {/* Icon Dot */}
                    <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0">
                      {getTimelineIcon(item.type)}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(item.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
