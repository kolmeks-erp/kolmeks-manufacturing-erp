import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MessageSquare, RefreshCw } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { qualityService } from '../../../services/quality.service';
import { CustomerComplaint } from '../../../types/quality';

const CustomerComplaintsListPage: React.FC = () => {
  const [complaints, setComplaints] = useState<CustomerComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getCustomerComplaints({ search, status: statusFilter });
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Customer Quality Complaints & RMA"
        subtitle="Log customer complaints, link returned products to Non-Conformance Reports (NCR) and CAPAs."
        actions={
          <Link
            to="/secure-kolmeks-x0y0/quality/complaints/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Customer Complaint
          </Link>
        }
      />

      {/* FILTER STRIP */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search complaint # or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Under Investigation</option>
              <option value="ACTION_REQUIRED">Action Required</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <button
            onClick={fetchComplaints}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading Customer Complaints..." />
      ) : error ? (
        <ErrorState title="Error Loading Complaints" message={error} onRetry={fetchComplaints} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Complaint #</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Severity</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Linked NCR / CAPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No customer complaints recorded.
                  </td>
                </tr>
              ) : (
                complaints.map((cmp) => (
                  <tr key={cmp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-indigo-600 font-mono">
                      {cmp.complaint_number}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {cmp.customers?.company_name || 'Direct Customer'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {cmp.products?.name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={cmp.severity} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={cmp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-indigo-600">
                      {cmp.non_conformance_reports ? `NCR: ${cmp.non_conformance_reports.ncr_number}` : '-'}
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

export default CustomerComplaintsListPage;
