import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../../../services/crm.service';
import { CRMLead, LeadStatus, LeadPriority } from '../../../types/crm';
import {
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Eye,
  Edit2,
  Building2,
  IndianRupee,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LeadsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [qualifyingLead, setQualifyingLead] = useState<CRMLead | null>(null);
  const [convertingLead, setConvertingLead] = useState<CRMLead | null>(null);

  // Form States
  const [createForm, setCreateForm] = useState({
    lead_name: '',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    source: 'Website',
    priority: 'NORMAL' as LeadPriority,
    expected_value: '',
    requirement: '',
    notes: '',
  });

  const [qualifyForm, setQualifyForm] = useState({
    qualification_status: 'QUALIFIED',
    expected_value: '',
    expected_close_date: '',
    requirement: '',
    notes: '',
  });

  const [convertForm, setConvertForm] = useState({
    customer_option: 'NEW' as 'NEW' | 'EXISTING',
    existing_customer_id: '',
    create_opportunity: true,
    opp_name: '',
    opp_expected_value: '',
    opp_probability: '50',
    force_create: false,
  });

  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);

  // Queries
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['crmLeads', statusFilter, sourceFilter, priorityFilter, searchTerm],
    queryFn: () => crmService.getLeads({ status: statusFilter, source: sourceFilter, priority: priorityFilter, search: searchTerm }),
  });

  const leads = leadsData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => crmService.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmLeads'] });
      queryClient.invalidateQueries({ queryKey: ['crmDashboardKPIs'] });
      setIsCreateModalOpen(false);
      setCreateForm({
        lead_name: '',
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        source: 'Website',
        priority: 'NORMAL',
        expected_value: '',
        requirement: '',
        notes: '',
      });
    },
  });

  const qualifyMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => crmService.qualifyLead(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmLeads'] });
      queryClient.invalidateQueries({ queryKey: ['crmDashboardKPIs'] });
      setQualifyingLead(null);
    },
  });

  const convertMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => crmService.convertLead(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['crmLeads'] });
      queryClient.invalidateQueries({ queryKey: ['crmDashboardKPIs'] });
      queryClient.invalidateQueries({ queryKey: ['crmOpportunities'] });
      setConvertingLead(null);
      setDuplicateWarning(null);
    },
    onError: (err: any) => {
      if (err.response?.data?.isDuplicateWarning) {
        setDuplicateWarning(err.response.data);
      }
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...createForm,
      expected_value: parseFloat(createForm.expected_value) || 0,
    });
  };

  const handleQualifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qualifyingLead) return;
    qualifyMutation.mutate({
      id: qualifyingLead.id,
      payload: {
        ...qualifyForm,
        expected_value: parseFloat(qualifyForm.expected_value) || 0,
      },
    });
  };

  const handleConvertSubmit = (e: React.FormEvent, overrideForce = false) => {
    e.preventDefault();
    if (!convertingLead) return;
    setDuplicateWarning(null);

    const payload = {
      customer_option: convertForm.customer_option,
      existing_customer_id: convertForm.existing_customer_id || undefined,
      new_customer_data: {
        company_name: convertingLead.company_name,
        email: convertingLead.email,
        phone: convertingLead.phone,
      },
      create_opportunity: convertForm.create_opportunity,
      opportunity_data: {
        name: convertForm.opp_name || `${convertingLead.company_name || convertingLead.lead_name} Opportunity`,
        expected_value: parseFloat(convertForm.opp_expected_value) || convertingLead.expected_value,
        probability: parseFloat(convertForm.opp_probability) || 50,
      },
      force_create: overrideForce || convertForm.force_create,
    };

    convertMutation.mutate({ id: convertingLead.id, payload });
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
      case 'CONTACTED':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'QUALIFIED':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
      case 'CONVERTED':
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
            <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Lead Management & Prospect Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track business inquiries, qualify prospects, and convert leads into active Customers and Deals.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Lead
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search lead code, name, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
          >
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="Trade Show">Trade Show</option>
            <option value="Existing Customer">Existing Customer</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4">Lead Ref</th>
                <th className="p-4">Lead / Company</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Source</th>
                <th className="p-4">Status</th>
                <th className="p-4">Est. Value</th>
                <th className="p-4">Owner</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No leads found matching criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      <Link to={`/secure-kolmeks-x0y0/crm/leads/${lead.id}`} className="hover:underline">
                        {lead.lead_number}
                      </Link>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{lead.lead_name}</div>
                      {lead.company_name && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {lead.company_name}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                      {lead.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {lead.email}</div>}
                      {lead.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {lead.phone}</div>}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {lead.source}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      ₹{(lead.expected_value || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300">
                      {lead.owner ? `${lead.owner.first_name} ${lead.owner.last_name}` : 'Unassigned'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {lead.status !== 'QUALIFIED' && lead.status !== 'CONVERTED' && (
                        <button
                          onClick={() => {
                            setQualifyingLead(lead);
                            setQualifyForm({
                              qualification_status: 'QUALIFIED',
                              expected_value: String(lead.expected_value || ''),
                              expected_close_date: lead.expected_close_date || '',
                              requirement: lead.requirement || '',
                              notes: lead.notes || '',
                            });
                          }}
                          className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-medium text-xs transition-colors"
                        >
                          Qualify
                        </button>
                      )}

                      {lead.status === 'QUALIFIED' && (
                        <button
                          onClick={() => {
                            setConvertingLead(lead);
                            setConvertForm({
                              customer_option: 'NEW',
                              existing_customer_id: '',
                              create_opportunity: true,
                              opp_name: `${lead.company_name || lead.lead_name} Opportunity`,
                              opp_expected_value: String(lead.expected_value || ''),
                              opp_probability: '50',
                              force_create: false,
                            });
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-xs transition-colors gap-1 inline-flex items-center"
                        >
                          <UserCheck className="w-3 h-3" /> Convert
                        </button>
                      )}

                      <Link
                        to={`/secure-kolmeks-x0y0/crm/leads/${lead.id}`}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 inline-block"
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

      {/* Create Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" /> Create New Business Lead
            </h2>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Lead Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Machining Inquiry"
                    value={createForm.lead_name}
                    onChange={(e) => setCreateForm({ ...createForm, lead_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={createForm.company_name}
                    onChange={(e) => setCreateForm({ ...createForm, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="john@acme.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Lead Source</label>
                  <select
                    value={createForm.source}
                    onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Trade Show">Trade Show</option>
                    <option value="Existing Customer">Existing Customer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Estimated Value (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    placeholder="500000"
                    value={createForm.expected_value}
                    onChange={(e) => setCreateForm({ ...createForm, expected_value: e.target.value })}
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
                  {createMutation.isPending ? 'Saving...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Qualify Lead Modal */}
      {qualifyingLead && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-500" /> Qualify Lead: {qualifyingLead.lead_number}
            </h2>
            <form onSubmit={handleQualifySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Estimated Value (₹)</label>
                <input
                  type="number"
                  value={qualifyForm.expected_value}
                  onChange={(e) => setQualifyForm({ ...qualifyForm, expected_value: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Expected Close Date</label>
                <input
                  type="date"
                  value={qualifyForm.expected_close_date}
                  onChange={(e) => setQualifyForm({ ...qualifyForm, expected_close_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Requirements / Product Interest</label>
                <textarea
                  rows={3}
                  value={qualifyForm.requirement}
                  onChange={(e) => setQualifyForm({ ...qualifyForm, requirement: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQualifyingLead(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={qualifyMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  {qualifyMutation.isPending ? 'Saving...' : 'Mark as Qualified'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Conversion Modal & Duplicate Warning Dialog */}
      {convertingLead && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" /> Convert Lead: {convertingLead.lead_name}
            </h2>

            {duplicateWarning ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  Potential Duplicate Customer Matches Found!
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  The system found existing customer records matching this lead's company name, email, or phone.
                </p>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {duplicateWarning.duplicates?.map((dup: any) => (
                    <div key={dup.id} className="p-2 bg-white dark:bg-slate-900 rounded border border-amber-200 dark:border-amber-800 text-xs flex justify-between items-center">
                      <div>
                        <strong>{dup.company_name || `${dup.first_name} ${dup.last_name}`}</strong> ({dup.customer_code})
                        <br />
                        <span className="text-slate-400">{dup.email} • {dup.phone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setConvertForm({ ...convertForm, customer_option: 'EXISTING', existing_customer_id: dup.id });
                          setDuplicateWarning(null);
                        }}
                        className="px-2 py-1 bg-amber-600 text-white rounded text-xs"
                      >
                        Use This Customer
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setDuplicateWarning(null)}
                    className="text-xs text-slate-500 underline"
                  >
                    Back to Form
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleConvertSubmit(e, true)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
                  >
                    Override & Create New Duplicate Customer
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => handleConvertSubmit(e, false)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Customer Account Creation</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer flex items-center gap-2 ${convertForm.customer_option === 'NEW' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600' : 'border-slate-200 dark:border-slate-700'}`}>
                      <input
                        type="radio"
                        name="cusOpt"
                        checked={convertForm.customer_option === 'NEW'}
                        onChange={() => setConvertForm({ ...convertForm, customer_option: 'NEW' })}
                      />
                      Create New Customer
                    </label>
                    <label className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer flex items-center gap-2 ${convertForm.customer_option === 'EXISTING' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600' : 'border-slate-200 dark:border-slate-700'}`}>
                      <input
                        type="radio"
                        name="cusOpt"
                        checked={convertForm.customer_option === 'EXISTING'}
                        onChange={() => setConvertForm({ ...convertForm, customer_option: 'EXISTING' })}
                      />
                      Link Existing Customer
                    </label>
                  </div>
                </div>

                {convertForm.customer_option === 'EXISTING' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Select Existing Customer ID</label>
                    <input
                      type="text"
                      required
                      placeholder="Paste Customer UUID"
                      value={convertForm.existing_customer_id}
                      onChange={(e) => setConvertForm({ ...convertForm, existing_customer_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={convertForm.create_opportunity}
                      onChange={(e) => setConvertForm({ ...convertForm, create_opportunity: e.target.checked })}
                    />
                    Automatically Create Sales Opportunity Deal
                  </label>

                  {convertForm.create_opportunity && (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        placeholder="Deal Name"
                        value={convertForm.opp_name}
                        onChange={(e) => setConvertForm({ ...convertForm, opp_name: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Expected Deal Value"
                          value={convertForm.opp_expected_value}
                          onChange={(e) => setConvertForm({ ...convertForm, opp_expected_value: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                        <select
                          value={convertForm.opp_probability}
                          onChange={(e) => setConvertForm({ ...convertForm, opp_probability: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        >
                          <option value="25">25% Probability</option>
                          <option value="50">50% Probability</option>
                          <option value="75">75% Probability</option>
                          <option value="90">90% Probability</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConvertingLead(null)}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={convertMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                  >
                    {convertMutation.isPending ? 'Converting...' : 'Execute Conversion'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
