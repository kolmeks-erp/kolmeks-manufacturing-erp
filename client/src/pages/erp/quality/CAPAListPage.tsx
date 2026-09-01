import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, CheckSquare, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { qualityService } from '../../../services/quality.service';
import { CAPARecord } from '../../../types/quality';

const CAPAListPage: React.FC = () => {
  const [capas, setCapas] = useState<CAPARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchCAPAs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getCAPAs({ search, status: statusFilter, priority: priorityFilter });
      if (res.success) {
        setCapas(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch CAPA records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCAPAs();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCAPAs();
  };

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Corrective & Preventive Actions (CAPA)"
        subtitle="Track root cause corrections, preventive controls, action item owners, and verification sign-offs."
        actions={
          <Link
            to="/secure-kolmeks-x0y0/quality/capa/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New CAPA Action Plan
          </Link>
        }
      />

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search CAPA #, title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="VERIFIED">Verified</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <button
            onClick={fetchCAPAs}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading CAPA Management System..." />
      ) : error ? (
        <ErrorState title="Error Loading CAPA Records" message={error} onRetry={fetchCAPAs} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">CAPA #</th>
                <th className="py-3.5 px-4 font-semibold">Title & Linked Source</th>
                <th className="py-3.5 px-4 font-semibold">Priority</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Owner</th>
                <th className="py-3.5 px-4 font-semibold">Target Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {capas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No CAPA records found. Create a new CAPA plan to get started.
                  </td>
                </tr>
              ) : (
                capas.map((capa) => (
                  <tr key={capa.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-indigo-600">
                      <Link to={`/secure-kolmeks-x0y0/quality/capa/${capa.id}`}>
                        {capa.capa_number}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{capa.title}</p>
                      {capa.non_conformance_reports && (
                        <p className="text-xs text-indigo-600 font-medium">
                          NCR Link: {capa.non_conformance_reports.ncr_number}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={capa.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={capa.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                      {capa.owner_profile?.full_name || capa.owner_profile?.email || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {capa.due_date || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CAPAListPage;
