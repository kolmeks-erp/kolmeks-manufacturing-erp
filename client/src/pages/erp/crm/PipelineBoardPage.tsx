import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../../../services/crm.service';
import { PipelineStageBoard, OpportunityStage } from '../../../types/crm';
import {
  TrendingUp,
  DollarSign,
  Building2,
  Calendar,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Award,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PipelineBoardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: boardData, isLoading } = useQuery({
    queryKey: ['crmPipelineBoard'],
    queryFn: crmService.getPipelineBoard,
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => crmService.updateOpportunityStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmPipelineBoard'] });
      queryClient.invalidateQueries({ queryKey: ['crmOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['crmDashboardKPIs'] });
    },
  });

  const STAGES: OpportunityStage[] = [
    'QUALIFICATION',
    'NEEDS_ANALYSIS',
    'PROPOSAL',
    'NEGOTIATION',
    'WON',
    'LOST',
  ];

  const getStageHeaderBg = (stage: OpportunityStage) => {
    switch (stage) {
      case 'QUALIFICATION':
        return 'border-t-4 border-t-sky-500 bg-sky-50/40 dark:bg-sky-950/20';
      case 'NEEDS_ANALYSIS':
        return 'border-t-4 border-t-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20';
      case 'PROPOSAL':
        return 'border-t-4 border-t-purple-500 bg-purple-50/40 dark:bg-purple-950/20';
      case 'NEGOTIATION':
        return 'border-t-4 border-t-amber-500 bg-amber-50/40 dark:bg-amber-950/20';
      case 'WON':
        return 'border-t-4 border-t-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20';
      case 'LOST':
        return 'border-t-4 border-t-rose-500 bg-rose-50/40 dark:bg-rose-950/20';
      default:
        return '';
    }
  };

  const handleStageMove = (oppId: string, currentStage: OpportunityStage, direction: 'NEXT' | 'PREV') => {
    const currentIndex = STAGES.indexOf(currentStage);
    const targetIndex = direction === 'NEXT' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < STAGES.length) {
      stageMutation.mutate({ id: oppId, stage: STAGES[targetIndex] });
    }
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Visual Sales Kanban Pipeline
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track deal progression across sales stages, stage totals, and weighted probability forecasts.
          </p>
        </div>

        <Link
          to="/secure-kolmeks-x0y0/crm/opportunities"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
        >
          Deals List View
        </Link>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stageKey) => {
          const colData = boardData ? boardData[stageKey] : null;
          const opps = colData?.opportunities || [];
          const totalVal = colData?.total_value || 0;
          const weightedVal = colData?.weighted_value || 0;

          return (
            <div
              key={stageKey}
              className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col min-h-[600px] ${getStageHeaderBg(
                stageKey
              )}`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    {stageKey.replace('_', ' ')}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs">
                    {opps.length}
                  </span>
                </div>
                <div className="mt-2 space-y-0.5">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Total: ₹{totalVal.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Weighted: ₹{weightedVal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[700px]">
                {isLoading ? (
                  <p className="text-xs text-center text-slate-400 py-4">Loading stage...</p>
                ) : opps.length === 0 ? (
                  <p className="text-xs text-center text-slate-400 py-8 italic">No deals in stage.</p>
                ) : (
                  opps.map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-shadow space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {opp.opportunity_number}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-500 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 rounded">
                          {opp.probability}% Prob
                        </span>
                      </div>

                      <Link
                        to={`/secure-kolmeks-x0y0/crm/opportunities/${opp.id}`}
                        className="font-semibold text-xs text-slate-900 dark:text-white hover:underline block leading-snug"
                      >
                        {opp.name}
                      </Link>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3 shrink-0" />{' '}
                        <span className="truncate">
                          {opp.customer?.company_name || 'Prospect Customer'}
                        </span>
                      </div>

                      <div className="pt-1 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{(opp.expected_value || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          ₹{(opp.forecast_value || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Stage Shift Action Buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          disabled={STAGES.indexOf(stageKey) === 0}
                          onClick={() => handleStageMove(opp.id, stageKey, 'PREV')}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                          title="Move Back Stage"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">Shift Stage</span>
                        <button
                          disabled={STAGES.indexOf(stageKey) === STAGES.length - 1}
                          onClick={() => handleStageMove(opp.id, stageKey, 'NEXT')}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                          title="Move Forward Stage"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
