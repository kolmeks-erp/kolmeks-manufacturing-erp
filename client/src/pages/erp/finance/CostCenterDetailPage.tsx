import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import { ERPLayout } from '../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { budgetingService } from '../../../services/budgeting.service';
import { CostCenter } from '../../../types/budgeting';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const CostCenterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [center, setCenter] = useState<CostCenter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await budgetingService.getCostCenterById(id);
      if (res.success) setCenter(res.data);
    } catch (err: any) {
      console.error('Error fetching cost center detail:', err);
      setError(err?.response?.data?.message || 'Failed to fetch cost center details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <ERPLayout activeTab="finance">
        <LoadingState message="Fetching cost center structure & assigned budget lines..." />
      </ERPLayout>
    );
  }

  if (error || !center) {
    return (
      <ERPLayout activeTab="finance">
        <ErrorState message={error || 'Cost center not found.'} onRetry={fetchDetail} />
      </ERPLayout>
    );
  }

  return (
    <ERPLayout activeTab="finance">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/finance/cost-centers`)}
            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cost Centers List
          </button>
        </div>

        <ERPPageHeader
          title={`${center.code} — ${center.name}`}
          subtitle={center.description || 'Organizational Cost Center'}
        />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Status</div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                center.is_active
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              {center.is_active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Parent Hierarchy</div>
            <div className="text-sm font-semibold text-slate-200">
              {center.parent ? `${center.parent.code} - ${center.parent.name}` : 'Top-Level Entity'}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Responsible Manager</div>
            <div className="text-sm font-semibold text-slate-200">
              {center.manager ? `${center.manager.first_name} ${center.manager.last_name}` : 'Unassigned'}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Sub-Cost Centers</div>
            <div className="text-xl font-bold text-emerald-400">{center.children?.length || 0} child units</div>
          </div>
        </div>

        {/* Child Cost Centers if any */}
        {center.children && center.children.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-100 border-b border-slate-800 pb-3 mb-4">
              Sub-Cost Centers ({center.children.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {center.children.map((child) => (
                <div
                  key={child.id}
                  onClick={() => navigate(`${ERP_BASE_PATH}/finance/cost-centers/${child.id}`)}
                  className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg cursor-pointer hover:border-emerald-500/50 transition flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-emerald-400 font-medium text-xs mr-2">{child.code}</span>
                    <span className="text-sm text-slate-200 font-medium">{child.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">View</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Allocated Budget Lines Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-100 border-b border-slate-800 pb-3 mb-4">
            Assigned Budget Allocations ({center.budgetLines?.length || 0} lines)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Budget Code</th>
                  <th className="py-3 px-4">Account Code</th>
                  <th className="py-3 px-4">GL Account Name</th>
                  <th className="py-3 px-4 text-right">Allocated Amount</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {!center.budgetLines || center.budgetLines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No budget lines currently linked to this cost center.
                    </td>
                  </tr>
                ) : (
                  center.budgetLines.map((line: any) => (
                    <tr key={line.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-emerald-400 font-medium">
                        {line.budget?.budget_code || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {line.account?.account_code || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {line.account?.account_name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-100">
                        {formatCurrency(line.budget_amount)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">{line.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ERPLayout>
  );
};
