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
    return <LoadingState message="Fetching cost center structure & assigned budget lines..." />;
  }

  if (error || !center) {
    return <ErrorState message={error || 'Cost center not found.'} onRetry={fetchDetail} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/finance/cost-centers`)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Cost Centers List
        </button>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
          <Building2 className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            <span className="font-mono text-emerald-600 mr-2">{center.code}</span> — {center.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{center.description || 'Organizational Cost Center'}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">Status</div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              center.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {center.is_active ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">Parent Hierarchy</div>
          <div className="text-sm font-bold text-slate-900 font-mono">
            {center.parent ? `${center.parent.code} - ${center.parent.name}` : 'Top-Level Entity'}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">Responsible Manager</div>
          <div className="text-sm font-bold text-slate-900">
            {center.manager ? `${center.manager.first_name} ${center.manager.last_name}` : 'Unassigned'}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">Sub-Cost Centers</div>
          <div className="text-xl font-bold text-emerald-600">{center.children?.length || 0} child units</div>
        </div>
      </div>

      {/* Child Cost Centers if any */}
      {center.children && center.children.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            Sub-Cost Centers ({center.children.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {center.children.map((child) => (
              <div
                key={child.id}
                onClick={() => navigate(`${ERP_BASE_PATH}/finance/cost-centers/${child.id}`)}
                className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-emerald-600 font-bold text-xs mr-2">{child.code}</span>
                  <span className="text-xs text-slate-900 font-semibold">{child.name}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600">View</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Allocated Budget Lines Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
          Assigned Budget Allocations ({center.budgetLines?.length || 0} lines)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Budget Code</th>
                <th className="py-3.5 px-4">Account Code</th>
                <th className="py-3.5 px-4">GL Account Name</th>
                <th className="py-3.5 px-4 text-right">Allocated Amount</th>
                <th className="py-3.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!center.budgetLines || center.budgetLines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No budget lines currently linked to this cost center.
                  </td>
                </tr>
              ) : (
                center.budgetLines.map((line: any) => (
                  <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">
                      {line.budget?.budget_code || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {line.account?.account_code || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {line.account?.account_name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(line.budget_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{line.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
