import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, AlertTriangle, Eye } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { EmptyState } from '../../../components/erp/EmptyState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { qualityService } from '../../../services/quality.service';
import { NonConformanceReport } from '../../../types/quality';

const NCRListPage: React.FC = () => {
  const [ncrs, setNcrs] = useState<NonConformanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const fetchNCRs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getNCRs({
        search,
        status: statusFilter || undefined,
        severity: severityFilter || undefined
      });
      if (res.success) setNcrs(res.data);
    } catch (err: any) {
      console.error('Failed to fetch NCRs:', err);
      setError(err.message || 'Unable to load Non-Conformance Reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNCRs();
  }, [statusFilter, severityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNCRs();
  };

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Non-Conformance Reports (NCR)"
        subtitle="Track quality defects, root cause investigation, corrective actions, and closure timeline."
        actions={
          <Link
            to="/secure-kolmeks-x0y0/quality/ncr/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create NCR
          </Link>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search NCR #, Title, Product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="ACTION_REQUIRED">Action Required</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="VERIFICATION">Verification</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading Non-Conformance Reports..." />
      ) : error ? (
        <ErrorState title="Failed to Load NCRs" message={error} onRetry={fetchNCRs} />
      ) : ncrs.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No Non-Conformance Reports Found"
          description="Log quality issues, supplier defects, or dimensional failures to initiate CAPA investigation."
          action={
            <Link
              to="/secure-kolmeks-x0y0/quality/ncr/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create NCR
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">NCR #</th>
                  <th className="py-3.5 px-4 font-semibold">Title</th>
                  <th className="py-3.5 px-4 font-semibold">Severity</th>
                  <th className="py-3.5 px-4 font-semibold">Source</th>
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned To</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Due Date</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ncrs.map((ncr) => (
                  <tr key={ncr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600">
                      <Link to={`/secure-kolmeks-x0y0/quality/ncr/${ncr.id}`}>
                        {ncr.ncr_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">{ncr.title}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ncr.severity} />
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{ncr.source_type}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{ncr.products?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      {ncr.assigned_profile ? `${ncr.assigned_profile.first_name} ${ncr.assigned_profile.last_name}` : 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ncr.status} />
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      {ncr.due_date || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/secure-kolmeks-x0y0/quality/ncr/${ncr.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded hover:bg-slate-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default NCRListPage;
