import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { crmService } from '../../../services/crm.service';
import {
  TrendingUp,
  Building2,
  Calendar,
  IndianRupee,
  Clock,
  ArrowLeft,
  FileText,
  CheckCircle,
  Award,
} from 'lucide-react';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['crmOppDetail', id],
    queryFn: () => crmService.getOpportunityById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading opportunity details...</div>;
  }

  if (!data || !data.opportunity) {
    return <div className="p-8 text-center text-rose-500">Opportunity not found.</div>;
  }

  const { opportunity: opp, activities, tasks, followups, auditLogs } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to="/secure-kolmeks-x0y0/crm/opportunities"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Opportunities Register
      </Link>

      {/* Main Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs rounded-full">
              {opp.opportunity_number}
            </span>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-xs rounded-full uppercase">
              Stage: {opp.stage}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {opp.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> {opp.customer?.company_name || 'Customer Account'}
          </p>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-xs text-slate-400 block uppercase font-semibold">Expected Value</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              ₹{(opp.expected_value || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase font-semibold">Weighted Forecast</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{(opp.forecast_value || 0).toLocaleString('en-IN')} ({opp.probability}%)
            </span>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Deal Specifications
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Expected Close Date</span>
                <span className="font-semibold text-slate-900 dark:text-white">{opp.expected_close_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Account Owner</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {opp.owner ? `${opp.owner.first_name} ${opp.owner.last_name}` : 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Linked Quotation</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {opp.quotation ? opp.quotation.quotation_number : 'None Linked'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Linked Sales Order</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {opp.sales_order ? opp.sales_order.order_number : 'None Linked'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Audit History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Stage Transition & Audit History
            </div>
            <div className="p-5 divide-y divide-slate-200 dark:divide-slate-700">
              {auditLogs.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">No audit history logged.</p>
              ) : (
                auditLogs.map((log: any) => (
                  <div key={log.id} className="py-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
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
