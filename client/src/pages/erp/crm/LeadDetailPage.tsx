import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { crmService } from '../../../services/crm.service';
import {
  Users,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  FileText,
  ArrowLeft,
  UserCheck,
} from 'lucide-react';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['crmLeadDetail', id],
    queryFn: () => crmService.getLeadById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading lead details...</div>;
  }

  if (!data || !data.lead) {
    return <div className="p-8 text-center text-rose-500">Lead not found.</div>;
  }

  const { lead, activities, tasks, followups, auditLogs } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/secure-kolmeks-x0y0/crm/leads"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Leads Registry
      </Link>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs rounded-full">
              {lead.lead_number}
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-full">
              {lead.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {lead.lead_name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> {lead.company_name || 'Individual Prospect'} • Source: {lead.source}
          </p>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-700">
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase font-semibold">Estimated Deal Value</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{(lead.expected_value || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Lead Information */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Contact Specifications
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Contact Person</span>
                <span className="font-semibold text-slate-900 dark:text-white">{lead.contact_person || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Email Address</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{lead.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Phone Number</span>
                <span className="font-semibold text-slate-900 dark:text-white">{lead.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Account Owner</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {lead.owner ? `${lead.owner.first_name} ${lead.owner.last_name}` : 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
              Requirements & Notes
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {lead.requirement || lead.notes || 'No specific requirements logged.'}
            </p>
          </div>
        </div>

        {/* Right Col: Timeline & Audit History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Audit Log & Lifecycle Timeline
            </div>
            <div className="p-5 divide-y divide-slate-200 dark:divide-slate-700">
              {auditLogs.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">No audit logs recorded yet.</p>
              ) : (
                auditLogs.map((log: any) => (
                  <div key={log.id} className="py-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">{log.action}</span>
                        <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{log.description}</p>
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
