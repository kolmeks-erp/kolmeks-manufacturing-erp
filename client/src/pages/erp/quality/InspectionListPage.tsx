import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, ClipboardCheck, Eye, ShieldCheck } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { EmptyState } from '../../../components/erp/EmptyState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { Pagination } from '../../../components/erp/Pagination';
import { qualityService } from '../../../services/quality.service';
import { QualityInspection } from '../../../types/quality';

const InspectionListPage: React.FC = () => {
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchInspections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getInspections({
        page,
        limit: 15,
        search,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        result: resultFilter || undefined
      });

      if (res.success) {
        setInspections(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      }
    } catch (err: any) {
      console.error('Failed to fetch inspections:', err);
      setError(err.message || 'Unable to load quality inspections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [page, typeFilter, statusFilter, resultFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInspections();
  };

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Quality Inspections"
        subtitle="Inspect incoming raw materials, in-process production components, and finished products."
        actions={
          <Link
            to="/secure-kolmeks-x0y0/quality/inspections/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Inspection
          </Link>
        }
      />

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search INS #, Product, GRN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </div>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="INCOMING">Incoming Material</option>
            <option value="IN_PROCESS">In-Process Operation</option>
            <option value="FINAL">Final Assembly</option>
            <option value="FIRST_ARTICLE">First Article</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PASSED">Passed</option>
            <option value="FAILED">Failed</option>
            <option value="PARTIALLY_ACCEPTED">Partially Accepted</option>
            <option value="ON_HOLD">On Hold</option>
          </select>

          <select
            value={resultFilter}
            onChange={(e) => { setResultFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Results</option>
            <option value="PASS">Pass</option>
            <option value="FAIL">Fail</option>
            <option value="PARTIAL">Partial</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <LoadingState message="Loading Inspections..." />
      ) : error ? (
        <ErrorState title="Failed to Load Inspections" message={error} onRetry={fetchInspections} />
      ) : inspections.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Quality Inspections Found"
          description="Create your first incoming material or production output inspection to start quality tracking."
          action={
            <Link
              to="/secure-kolmeks-x0y0/quality/inspections/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Inspection
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Inspection #</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Reference</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Inspected</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Accepted</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Rejected</th>
                  <th className="py-3.5 px-4 font-semibold">Result</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600">
                      <Link to={`/secure-kolmeks-x0y0/quality/inspections/${insp.id}`}>
                        {insp.inspection_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700">{insp.inspection_type}</td>
                    <td className="py-3 px-4 text-slate-900 font-medium">{insp.products?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {insp.goods_receipts?.grn_number || insp.production_orders?.production_order_number || 'Direct'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{insp.quantity_inspected}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">{insp.quantity_accepted}</td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-600">{insp.quantity_rejected}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={insp.result || 'PENDING'} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={insp.status} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/secure-kolmeks-x0y0/quality/inspections/${insp.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded hover:bg-slate-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={15}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionListPage;
