import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Layers, ShieldCheck } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { qualityService } from '../../../services/quality.service';
import { InspectionPlan } from '../../../types/quality';

const InspectionPlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<InspectionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getInspectionPlanById(id);
      if (res.success) setPlan(res.data);
    } catch (err: any) {
      console.error('Failed to fetch plan:', err);
      setError(err.message || 'Unable to load inspection plan details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [id]);

  if (loading) return <LoadingState message="Loading Inspection Plan Details..." />;
  if (error || !plan) return <ErrorState title="Plan Not Found" message={error || 'Plan missing'} onRetry={fetchPlan} />;

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title={`Inspection Plan ${plan.plan_number}`}
        subtitle={`Product Quality Template (${plan.version})`}
        actions={
          <Link
            to="/secure-kolmeks-x0y0/quality/inspection-plans"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Plans
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Plan Number</span>
          <p className="text-base font-bold text-blue-600 mt-1">{plan.plan_number}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Product</span>
          <p className="text-base font-bold text-slate-900 mt-1">{plan.products?.name || 'N/A'}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Inspection Type</span>
          <p className="text-base font-bold text-slate-900 mt-1">{plan.inspection_type}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Status</span>
          <div className="mt-1">
            <StatusBadge status={plan.status} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Defined Quality Characteristics & Specifications
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase bg-slate-100/70 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Seq</th>
                <th className="py-3.5 px-4 font-semibold">Characteristic</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 text-center font-semibold">Target</th>
                <th className="py-3.5 px-4 text-center font-semibold">Min Tolerance</th>
                <th className="py-3.5 px-4 text-center font-semibold">Max Tolerance</th>
                <th className="py-3.5 px-4 font-semibold">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plan.inspection_plan_items?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-500">{item.sequence}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-500">{item.type}</td>
                  <td className="py-3 px-4 text-center font-mono text-xs font-bold text-slate-800">
                    {item.target_value ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-xs text-slate-600">
                    {item.min_value ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-xs text-slate-600">
                    {item.max_value ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">{item.unit || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InspectionPlanDetailPage;
