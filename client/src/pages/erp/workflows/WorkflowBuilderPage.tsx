import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, ArrowDown, Plus, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { workflowService } from '../../../services/workflow.service';
import { WorkflowDefinition } from '../../../types/workflow';

export const WorkflowBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [definition, setDefinition] = useState<WorkflowDefinition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      workflowService
        .getDefinitionById(id)
        .then((data) => setDefinition(data))
        .catch((err) => console.error('Failed to load definition builder:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading workflow builder...</div>;
  }

  if (!definition) {
    return <div className="p-8 text-center text-rose-500">Workflow definition not found.</div>;
  }

  const activeVersion = definition.workflow_versions?.[0];
  const stages = activeVersion?.workflow_stages || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/secure-kolmeks-x0y0/workflows/definitions')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Definitions Catalog
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {definition.module}
              </span>
              <span className="text-xs font-mono text-slate-400">Version {definition.active_version_number}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{definition.name} Builder</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Entity: <span className="font-semibold text-slate-700 dark:text-slate-300">{definition.entity_type}</span> | Code: {definition.code}
            </p>
          </div>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stages Timeline Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Workflow Approval Pipeline ({stages.length} Stages)</h2>

          {stages.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
              No approval stages defined in Version 1.
            </div>
          ) : (
            stages.map((stg, idx) => (
              <React.Fragment key={stg.id}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {stg.sequence}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{stg.name}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Mode: {stg.approval_mode}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {stg.deadline_hours}h SLA
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">{stg.description || 'No stage description.'}</p>

                  {/* Steps & Approvers */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Assigned Approver Rules</div>
                    {stg.workflow_steps && stg.workflow_steps.length > 0 ? (
                      stg.workflow_steps.map((stp) => (
                        <div
                          key={stp.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-slate-900 dark:text-white">{stp.step_name}</span>
                          <span className="font-mono text-slate-500">
                            {stp.approver_type}: <span className="font-semibold text-blue-600 dark:text-blue-400">{stp.approver_value}</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 italic">No specific step rules assigned.</div>
                    )}
                  </div>
                </div>

                {idx < stages.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="p-1 bg-blue-500/10 text-blue-600 rounded-full">
                      <ArrowDown className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))
          )}
        </div>

        {/* Live Visual Flow Preview Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Live Execution Preview
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
              <div className="text-xs font-bold text-blue-700 dark:text-blue-300">1. Trigger Event</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Record submitted in {definition.module}</div>
            </div>

            {stages.map((s) => (
              <div key={s.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <div className="text-xs font-bold text-slate-900 dark:text-white">Stage {s.sequence}: {s.name}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">Sign-off required ({s.approval_mode})</div>
              </div>
            ))}

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Final Approval Completed
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Business record transitions to APPROVED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
