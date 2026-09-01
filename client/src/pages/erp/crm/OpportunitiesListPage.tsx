import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../../../services/crm.service';
import { CRMOpportunity, OpportunityStage, LeadPriority } from '../../../types/crm';
import {
  TrendingUp,
  Search,
  Plus,
  Filter,
  Award,
  XCircle,
  Building2,
  DollarSign,
  Calendar,
  Eye,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const OpportunitiesListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [winningOpp, setWinningOpp] = useState<CRMOpportunity | null>(null);
  const [losingOpp, setLosingOpp] = useState<CRMOpportunity | null>(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    name: '',
    customer_id: '',
    expected_value: '',
    probability: '50',
    stage: 'QUALIFICATION' as OpportunityStage,
    priority: 'NORMAL' as LeadPriority,
    expected_close_date: '',
    notes: '',
  });

  const [lostReason, setLostReason] = useState('');

  // Queries
  const { data: oppsData, isLoading } = useQuery({
    queryKey: ['crmOpportunities', stageFilter, priorityFilter, searchTerm],
    queryFn: () => crmService.getOpportunities({ stage: stageFilter, priority: priorityFilter, search: searchTerm }),
  });

  const opportunities = oppsData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => crmService.createOpportunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['crmPipeline'] });
      queryClient.invalidateQueries({ queryKey: ['crmDashboardKPIs'] });
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        customer_id: '',
        expected_value: '',
        probability: '50',
        stage: 'QUALIFICATION',
        priority: 'NORMAL',
        expected_close_date: '',
        notes: '',
      });
    },
  });

  const winMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: any }) => crmService.winOpportunity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['crmPipeline'] });
      queryClient.invalidateQueries({ queryKey: ['crmDashboardKPIs'] });
      setWinningOpp(null);
    },
  });

  const loseMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => crmService.loseOpportunity(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['crmPipeline'] });
      queryClient.invalidateQueries({ queryKey: ['crmDashboardKPIs'] });
      setLosingOpp(null);
      setLostReason('');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...createForm,
      expected_value: parseFloat(createForm.expected_value) || 0,
      probability: parseFloat(createForm.probability) || 50,
    });
  };

  const getStageBadge = (stage: OpportunityStage) => {
    switch (stage) {
      case 'QUALIFICATION':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
      case 'NEEDS_ANALYSIS':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
      case 'PROPOSAL':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'NEGOTIATION':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'WON':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'LOST':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Sales Opportunities & Deals Register
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage qualified sales deals, calculate probability forecasts, and link won deals to Quotations and Orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/secure-kolmeks-x0y0/crm/pipeline"
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            Kanban Pipeline
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors gap-2"
          >
            <Plus className="w-4 h-4" /> Create Opportunity
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search deal number or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
          >
            <option value="">All Stages</option>
            <option value="QUALIFICATION">Qualification</option>
            <option value="NEEDS_ANALYSIS">Needs Analysis</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4">Deal Ref</th>
                <th className="p-4">Opportunity Name</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Expected Value</th>
                <th className="p-4">Prob %</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Forecast Value</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Expected Close</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Loading opportunities...
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No deals found matching criteria.
                  </td>
                </tr>
              ) : (
                opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      <Link to={`/secure-kolmeks-x0y0/crm/opportunities/${opp.id}`} className="hover:underline">
                        {opp.opportunity_number}
                      </Link>
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {opp.name}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {opp.customer ? opp.customer.company_name || `${opp.customer.first_name} ${opp.customer.last_name}` : 'Unknown Customer'}
                    </td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      ₹{(opp.expected_value || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-indigo-600 font-semibold">
                      {opp.probability}%
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{(opp.forecast_value || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStageBadge(opp.stage)}`}>
                        {opp.stage}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {opp.expected_close_date || 'N/A'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {opp.stage !== 'WON' && opp.stage !== 'LOST' && (
                        <>
                          <button
                            onClick={() => setWinningOpp(opp)}
                            className="px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-xs transition-colors"
                          >
                            Mark Won
                          </button>
                          <button
                            onClick={() => setLosingOpp(opp)}
                            className="px-2 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium text-xs transition-colors"
                          >
                            Mark Lost
                          </button>
                        </>
                      )}
                      <Link
                        to={`/secure-kolmeks-x0y0/crm/opportunities/${opp.id}`}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 inline-block"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Opportunity Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" /> Create Opportunity Deal
            </h2>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pump Components Contract 2026"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Customer ID *</label>
                <input
                  type="text"
                  required
                  placeholder="Paste Customer UUID"
                  value={createForm.customer_id}
                  onChange={(e) => setCreateForm({ ...createForm, customer_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Expected Value (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    placeholder="1000000"
                    value={createForm.expected_value}
                    onChange={(e) => setCreateForm({ ...createForm, expected_value: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Win Probability (%)</label>
                  <select
                    value={createForm.probability}
                    onChange={(e) => setCreateForm({ ...createForm, probability: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    <option value="10">10%</option>
                    <option value="25">25%</option>
                    <option value="50">50%</option>
                    <option value="75">75%</option>
                    <option value="90">90%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Pipeline Stage</label>
                  <select
                    value={createForm.stage}
                    onChange={(e) => setCreateForm({ ...createForm, stage: e.target.value as OpportunityStage })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    <option value="QUALIFICATION">Qualification</option>
                    <option value="NEEDS_ANALYSIS">Needs Analysis</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="NEGOTIATION">Negotiation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Expected Close Date</label>
                  <input
                    type="date"
                    value={createForm.expected_close_date}
                    onChange={(e) => setCreateForm({ ...createForm, expected_close_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Won Opportunity Modal */}
      {winningOpp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" /> Mark Deal WON: {winningOpp.opportunity_number}
            </h2>
            <p className="text-xs text-slate-500">
              Congratulations! Confirm marking this opportunity as WON.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWinningOpp(null)}
                className="px-4 py-2 rounded-lg border text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => winMutation.mutate({ id: winningOpp.id })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
              >
                Confirm WON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lost Opportunity Modal */}
      {losingOpp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" /> Mark Deal LOST: {losingOpp.opportunity_number}
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Reason for Lost Deal *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Competitor pricing, project scope cancelled..."
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLosingOpp(null)}
                className="px-4 py-2 rounded-lg border text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!lostReason}
                onClick={() => loseMutation.mutate({ id: losingOpp.id, reason: lostReason })}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg"
              >
                Confirm LOST
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
