import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { crmService } from '../../../services/crm.service';
import { BarChart3, TrendingUp, Users, Award, PieChart, IndianRupee } from 'lucide-react';

export const CRMReportsPage: React.FC = () => {
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['crmReports'],
    queryFn: crmService.getCRMReports,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading analytical CRM reports...</div>;
  }

  const { leadConversion, pipelineSummary, ownerPerformance } = reportData || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          CRM Analytics & Executive Sales Reports
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Lead conversion velocity, deal forecast distribution by stage, and owner revenue performance.
        </p>
      </div>

      {/* Grid: 3 Executive Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Conversion Funnel */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 text-base">
            <Users className="w-5 h-5 text-indigo-500" /> Lead Conversion Funnel
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
              <span className="text-xs text-slate-400 font-medium uppercase block">Total Inquiries</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">{leadConversion?.totalLeads || 0}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
              <span className="text-xs text-slate-400 font-medium uppercase block">Qualified</span>
              <span className="text-xl font-bold text-indigo-600 mt-1 block">{leadConversion?.qualifiedLeads || 0}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
              <span className="text-xs text-slate-400 font-medium uppercase block">Converted</span>
              <span className="text-xl font-bold text-emerald-600 mt-1 block">{leadConversion?.convertedLeads || 0}</span>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-center border border-indigo-200 dark:border-indigo-800">
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase block">Win Rate</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mt-1 block">{leadConversion?.conversionRate || 0}%</span>
            </div>
          </div>
        </div>

        {/* Pipeline Distribution by Stage */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 text-base">
            <PieChart className="w-5 h-5 text-emerald-500" /> Pipeline Stage Summary
          </h2>
          <div className="space-y-2">
            {pipelineSummary && Object.keys(pipelineSummary).length > 0 ? (
              Object.entries(pipelineSummary).map(([stage, val]: [string, any]) => (
                <div key={stage} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase">{stage.replace('_', ' ')}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 font-medium">{val.count} deals</span>
                    <span className="font-bold text-slate-900 dark:text-white">Total: ₹{val.total_value.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No pipeline data recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Owner Performance Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 text-base">
          <Award className="w-5 h-5 text-amber-500" /> Sales Representative & Account Owner Leaderboard
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-500 uppercase">
                <th className="p-3">Sales Owner</th>
                <th className="p-3">Won Deals</th>
                <th className="p-3">Won Revenue (₹)</th>
                <th className="p-3">Lost Deals</th>
                <th className="p-3">Open Pipeline Value (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {ownerPerformance && Object.keys(ownerPerformance).length > 0 ? (
                Object.entries(ownerPerformance).map(([name, perf]: [string, any]) => (
                  <tr key={name} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{name}</td>
                    <td className="p-3 font-semibold text-emerald-600">{perf.wonCount}</td>
                    <td className="p-3 font-bold text-emerald-600">₹{perf.wonValue.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-semibold text-rose-500">{perf.lostCount}</td>
                    <td className="p-3 font-bold text-indigo-600">₹{perf.openValue.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400">No performance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
