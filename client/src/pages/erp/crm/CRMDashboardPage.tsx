import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { crmService } from '../../../services/crm.service';
import {
  Users,
  Target,
  IndianRupee,
  TrendingUp,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  Phone,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CRMDashboardPage: React.FC = () => {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['crmDashboardKPIs'],
    queryFn: crmService.getDashboardKPIs,
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            CRM & Customer Relationship Telemetry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Lead generation pipeline, deal forecasts, sales performance metrics, and activity tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/secure-kolmeks-x0y0/crm/leads"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors gap-2"
          >
            <Plus className="w-4 h-4" /> New Lead
          </Link>
          <Link
            to="/secure-kolmeks-x0y0/crm/pipeline"
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm rounded-lg shadow-sm transition-colors gap-2"
          >
            <TrendingUp className="w-4 h-4 text-emerald-500" /> View Pipeline
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New & Qualified Leads */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Lead Generation
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {isLoading ? '...' : kpis?.newLeads || 0}
              </span>
              <span className="text-xs text-indigo-600 font-medium dark:text-indigo-400">
                ({kpis?.qualifiedLeads || 0} Qualified)
              </span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Conversion Rate: <strong className="text-emerald-600">{kpis?.conversionRate || 0}%</strong>
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Pipeline Value */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Pipeline Value
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ₹{isLoading ? '...' : (kpis?.totalPipelineValue || 0).toLocaleString('en-IN')}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">
              Open Deals: <strong className="text-indigo-600">{kpis?.openOpportunities || 0}</strong>
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Weighted Forecast Value */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Weighted Forecast
            </span>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              ₹{isLoading ? '...' : (kpis?.weightedPipelineValue || 0).toLocaleString('en-IN')}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">
              Probability Adjusted Forecast
            </span>
          </div>
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/50 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Follow-ups & Activities */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Follow-ups & Tasks
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {isLoading ? '...' : kpis?.overdueFollowups || 0}
              </span>
              <span className="text-xs text-slate-500">Overdue</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Today's Activities: <strong className="text-indigo-600">{kpis?.activitiesToday || 0}</strong>
            </span>
          </div>
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/50 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Activities & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Recent Customer Interactions
            </h2>
            <Link
              to="/secure-kolmeks-x0y0/crm/activities"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700 flex-1">
            {isLoading ? (
              <p className="p-6 text-center text-slate-400 text-sm">Loading activities...</p>
            ) : !kpis?.recentActivities || kpis.recentActivities.length === 0 ? (
              <p className="p-6 text-center text-slate-400 text-sm">No recent activities logged.</p>
            ) : (
              kpis.recentActivities.map((act) => (
                <div key={act.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {act.activity_type.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {act.subject}
                      </span>
                      <span className="text-xs text-slate-400">{act.activity_date}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {act.customer?.company_name || 'Prospect Customer'} • By {act.owner?.first_name || 'Staff'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming & Overdue Follow-ups */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" /> Pending Follow-up Schedule
            </h2>
            <Link
              to="/secure-kolmeks-x0y0/crm/follow-ups"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700 flex-1">
            {isLoading ? (
              <p className="p-6 text-center text-slate-400 text-sm">Loading follow-ups...</p>
            ) : !kpis?.upcomingFollowups || kpis.upcomingFollowups.length === 0 ? (
              <p className="p-6 text-center text-slate-400 text-sm">No pending follow-ups found.</p>
            ) : (
              kpis.upcomingFollowups.map((fu) => (
                <div key={fu.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {fu.purpose}
                      </span>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{fu.followup_date}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Customer: {fu.customer?.company_name || 'Prospect'} • Assigned: {fu.owner?.first_name || 'Unassigned'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
