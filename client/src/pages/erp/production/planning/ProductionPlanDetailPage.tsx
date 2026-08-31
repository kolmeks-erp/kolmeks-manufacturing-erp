import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ClipboardList,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Send,
  XCircle,
  Play,
  PackageCheck,
  Layers,
  FileText,
  User,
  AlertTriangle,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import ERPPageHeader from '../../../../components/erp/ERPPageHeader';
import StatusBadge from '../../../../components/erp/StatusBadge';
import LoadingState from '../../../../components/erp/LoadingState';
import ErrorState from '../../../../components/erp/ErrorState';
import ConfirmDialog from '../../../../components/erp/ConfirmDialog';
import { ERP_BASE_PATH } from '../../../../constants/navigation';
import { planningService } from '../../../../services/planning.service';

const ProductionPlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Modal dialog state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  const fetchPlanDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await planningService.getPlanById(id);
      if (res.success) {
        setPlanData(res.data);
      } else {
        setError(res.message || 'Failed to load production plan details.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading plan details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanDetail();
  }, [id]);

  const handleStatusAction = (type: 'submit' | 'approve' | 'cancel' | 'generate') => {
    let title = '';
    let message = '';
    let actionFn = async () => {};

    if (type === 'submit') {
      title = 'Submit Production Plan';
      message = 'Are you sure you want to submit this plan for manager review and approval?';
      actionFn = async () => {
        setActionLoading(true);
        try {
          const res = await planningService.submitPlan(id!);
          if (res.success) fetchPlanDetail();
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      };
    } else if (type === 'approve') {
      title = 'Approve Production Plan';
      message = 'Are you sure you want to approve this production plan? Approved plans can generate production orders.';
      actionFn = async () => {
        setActionLoading(true);
        try {
          const res = await planningService.approvePlan(id!);
          if (res.success) fetchPlanDetail();
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      };
    } else if (type === 'cancel') {
      title = 'Cancel Production Plan';
      message = 'Are you sure you want to cancel this production plan? Cancelled plans cannot generate new production requirements.';
      actionFn = async () => {
        setActionLoading(true);
        try {
          const res = await planningService.cancelPlan(id!);
          if (res.success) fetchPlanDetail();
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      };
    } else if (type === 'generate') {
      title = 'Generate Production Orders';
      message = 'Are you sure you want to generate production orders for all unassigned lines in this plan?';
      actionFn = async () => {
        setActionLoading(true);
        try {
          const res = await planningService.generateOrdersFromPlan(id!);
          if (res.success) fetchPlanDetail();
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      };
    }

    setConfirmModal({
      isOpen: true,
      title,
      message,
      action: actionFn,
    });
  };

  if (loading) return <ERPLayout><LoadingState message="Loading Plan details..." /></ERPLayout>;
  if (error || !planData) return <ERPLayout><ErrorState message={error || 'Plan not found.'} onRetry={fetchPlanDetail} /></ERPLayout>;

  const { plan, lines } = planData;

  return (
    <ERPLayout>
      <div className="space-y-6">
        <ERPPageHeader
          title={`Plan ${plan.plan_number}`}
          subtitle={plan.plan_name}
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/plans`)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <ArrowLeft size={14} /> Back to Plans
              </button>

              {plan.status === 'DRAFT' && (
                <button
                  onClick={() => handleStatusAction('submit')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Send size={15} /> Submit for Approval
                </button>
              )}

              {(plan.status === 'SUBMITTED' || plan.status === 'UNDER_REVIEW') && (
                <button
                  onClick={() => handleStatusAction('approve')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <CheckCircle2 size={15} /> Approve Plan
                </button>
              )}

              {plan.status === 'APPROVED' && (
                <button
                  onClick={() => handleStatusAction('generate')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition-all"
                >
                  <Play size={15} /> Generate Production Orders
                </button>
              )}

              {!['COMPLETED', 'CANCELLED'].includes(plan.status) && (
                <button
                  onClick={() => handleStatusAction('cancel')}
                  disabled={actionLoading}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm rounded-lg border border-rose-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <XCircle size={15} /> Cancel Plan
                </button>
              )}
            </div>
          }
        />

        {/* Plan Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xs text-slate-400 font-medium">Status</div>
            <div className="mt-1">
              <StatusBadge status={plan.status} />
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Planning Horizon</div>
            <div className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-400" />
              {plan.start_date} to {plan.end_date}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{plan.period_type}</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Created By</div>
            <div className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
              <User size={14} className="text-slate-400" />
              {plan.created_by_profile?.full_name || 'System User'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{new Date(plan.created_at).toLocaleDateString()}</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Approval State</div>
            <div className="text-sm font-semibold text-slate-200 mt-1">
              {plan.approved_by_profile ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Approved by {plan.approved_by_profile.full_name}
                </span>
              ) : (
                <span className="text-amber-400">Pending Approval</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/materials?plan_id=${plan.id}`)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <PackageCheck size={16} className="text-emerald-400" /> Run Material Availability Check (MRP)
          </button>

          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/reports?plan_id=${plan.id}`)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <FileText size={16} className="text-purple-400" /> View Plan vs Actual Variance Report
          </button>
        </div>

        {/* Lines Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Layers className="text-blue-400" size={18} /> Planned Product Lines ({(lines || []).length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3 text-right">Planned Qty</th>
                  <th className="px-4 py-3">Required Date</th>
                  <th className="px-4 py-3">Demand Source</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Production Order</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {(lines || []).map((line: any) => (
                  <tr key={line.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-slate-400">{line.line_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">{line.product?.name}</div>
                      <div className="font-mono text-slate-400">{line.product?.product_code}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-400">
                      {line.planned_quantity} {line.product?.unit || 'pcs'}
                    </td>
                    <td className="px-4 py-3 font-mono">{line.required_date}</td>
                    <td className="px-4 py-3">
                      {line.sales_order ? (
                        <span className="text-blue-400 font-mono">SO: {line.sales_order.order_number}</span>
                      ) : (
                        <span className="text-slate-400">{line.demand_source}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          line.priority === 'URGENT'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : line.priority === 'HIGH'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {line.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {line.production_order ? (
                        <span className="font-mono text-indigo-400">
                          {line.production_order.production_order_number}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={line.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmDialog
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Proceed"
          cancelText="Cancel"
          onConfirm={confirmModal.action}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </ERPLayout>
  );
};

export default ProductionPlanDetailPage;
