import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Layers, Eye } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { EmptyState } from '../../../components/erp/EmptyState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { qualityService } from '../../../services/quality.service';
import { InspectionPlan } from '../../../types/quality';

const InspectionPlanListPage: React.FC = () => {
  const [plans, setPlans] = useState<InspectionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getInspectionPlans({ search });
      if (res.success) setPlans(res.data);
    } catch (err: any) {
      console.error('Failed to fetch inspection plans:', err);
      setError(err.message || 'Unable to load inspection plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlans();
  };

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Inspection Plans"
        subtitle="Define quality characteristics, dimensional tolerances, and test criteria templates by product."
        actions={
          <Link
            to="/secure-kolmeks-x0y0/quality/inspection-plans/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Inspection Plan
          </Link>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search IP #, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      {loading ? (
        <LoadingState message="Loading Inspection Plans..." />
      ) : error ? (
        <ErrorState title="Failed to Load Inspection Plans" message={error} onRetry={fetchPlans} />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Inspection Plans Found"
          description="Define standard quality inspection templates for your machined components or motor assemblies."
          action={
            <Link
              to="/secure-kolmeks-x0y0/quality/inspection-plans/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Inspection Plan
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Plan #</th>
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Version</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Characteristics</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((pl) => (
                  <tr key={pl.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600">
                      <Link to={`/secure-kolmeks-x0y0/quality/inspection-plans/${pl.id}`}>
                        {pl.plan_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">{pl.products?.name || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700">{pl.version}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700">{pl.inspection_type}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={pl.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {(pl as any).inspection_plan_items?.[0]?.count || (pl as any).inspection_plan_items?.length || 0} Line Items
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/secure-kolmeks-x0y0/quality/inspection-plans/${pl.id}`}
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

export default InspectionPlanListPage;
