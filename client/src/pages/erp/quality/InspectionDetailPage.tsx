import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Save,
  Clock,
  User,
  ShieldCheck,
  Package,
  FileCheck
} from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { ConfirmDialog } from '../../../components/erp/ConfirmDialog';
import { qualityService } from '../../../services/quality.service';
import { QualityInspection, InspectionResult } from '../../../types/quality';

const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState<QualityInspection | null>(null);
  const [results, setResults] = useState<InspectionResult[]>([]);
  const [quantityAccepted, setQuantityAccepted] = useState<number>(0);
  const [quantityRejected, setQuantityRejected] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dialogs
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [holdReason, setHoldReason] = useState('');

  const fetchInspection = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getInspectionById(id);
      if (res.success && res.data) {
        setInspection(res.data);
        setResults(res.data.results || []);
        setQuantityAccepted(res.data.quantity_accepted || res.data.quantity_inspected || 0);
        setQuantityRejected(res.data.quantity_rejected || 0);
        setNotes(res.data.notes || '');
      }
    } catch (err: any) {
      console.error('Failed to load inspection:', err);
      setError(err.message || 'Unable to load quality inspection details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspection();
  }, [id]);

  const handleResultValueChange = (index: number, field: string, value: any) => {
    const updated = [...results];
    const item = { ...updated[index], [field]: value };

    // Auto-calculate numeric tolerance if numeric
    if (item.characteristic_type === 'NUMERIC' && item.measured_value !== undefined && item.measured_value !== null) {
      const val = parseFloat(item.measured_value as any);
      const min = item.min_value !== undefined && item.min_value !== null ? item.min_value : -Infinity;
      const max = item.max_value !== undefined && item.max_value !== null ? item.max_value : Infinity;

      if (!isNaN(val)) {
        item.result = (val >= min && val <= max) ? 'PASS' : 'FAIL';
      }
    }

    updated[index] = item;
    setResults(updated);
  };

  const handleSaveMeasurements = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await qualityService.updateInspection(id, {
        quantity_accepted: quantityAccepted,
        quantity_rejected: quantityRejected,
        notes,
        results
      });
      if (res.success) {
        setSuccessMsg('Inspection measurements saved successfully.');
        fetchInspection();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save measurements.');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteInspection = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    setShowCompleteDialog(false);
    try {
      const res = await qualityService.completeInspection(id, {
        quantity_accepted: quantityAccepted,
        quantity_rejected: quantityRejected,
        notes
      });
      if (res.success) {
        setSuccessMsg(res.message);
        fetchInspection();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to complete inspection.');
    } finally {
      setSaving(false);
    }
  };

  const handlePlaceOnHold = async () => {
    if (!id || !inspection) return;
    if (!holdReason) {
      setError('Please provide a reason for placing this material on quality hold.');
      return;
    }
    setSaving(true);
    setError(null);
    setShowHoldDialog(false);
    try {
      const res = await qualityService.createQualityHold({
        product_id: inspection.product_id,
        inspection_id: id,
        grn_id: inspection.grn_id,
        production_order_id: inspection.production_order_id,
        quantity: inspection.quantity_inspected,
        reason: holdReason
      });

      if (res.success) {
        setSuccessMsg('Material placed on Quality Hold successfully.');
        fetchInspection();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to place on quality hold.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading Inspection Details..." />;
  if (error && !inspection) return <ErrorState title="Inspection Not Found" message={error} onRetry={fetchInspection} />;
  if (!inspection) return null;

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title={`Inspection ${inspection.inspection_number}`}
        subtitle={`Product Quality Verification (${inspection.inspection_type})`}
        actions={
          <div className="flex items-center gap-3">
            <Link
              to="/secure-kolmeks-x0y0/quality/inspections"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to List
            </Link>

            {inspection.status !== 'PASSED' && inspection.status !== 'FAILED' && (
              <>
                <button
                  type="button"
                  onClick={handleSaveMeasurements}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
                >
                  <Save className="w-4 h-4 text-slate-600" />
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => setShowHoldDialog(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  Place on Quality Hold
                </button>

                <button
                  type="button"
                  onClick={() => setShowCompleteDialog(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm"
                >
                  <FileCheck className="w-4 h-4" />
                  Complete Inspection
                </button>
              </>
            )}

            <Link
              to={`/secure-kolmeks-x0y0/quality/ncr/new?inspectionId=${inspection.id}&productId=${inspection.product_id}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 shadow-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              Create NCR
            </Link>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl font-medium">
          {successMsg}
        </div>
      )}

      {/* HEADER SUMMARY CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Inspection Type</span>
          <p className="text-base font-bold text-slate-900 mt-1">{inspection.inspection_type}</p>
        </div>

        <div>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Product</span>
          <p className="text-base font-bold text-blue-600 mt-1">{inspection.products?.name || 'N/A'}</p>
          <p className="text-xs text-slate-500">{inspection.products?.code}</p>
        </div>

        <div>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Overall Result</span>
          <div className="mt-1">
            <StatusBadge status={inspection.result || 'PENDING'} />
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Inspection Status</span>
          <div className="mt-1">
            <StatusBadge status={inspection.status} />
          </div>
        </div>
      </div>

      {/* QUANTITIES & REFERENCES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Quantity Verification</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase">Quantity Inspected</label>
              <p className="text-lg font-bold text-slate-900">{inspection.quantity_inspected}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase">Accepted Quantity</label>
              {inspection.status === 'PASSED' || inspection.status === 'FAILED' ? (
                <p className="text-lg font-extrabold text-emerald-600">{inspection.quantity_accepted}</p>
              ) : (
                <input
                  type="number"
                  min="0"
                  max={inspection.quantity_inspected}
                  value={quantityAccepted}
                  onChange={(e) => setQuantityAccepted(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-emerald-600"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase">Rejected Quantity</label>
              {inspection.status === 'PASSED' || inspection.status === 'FAILED' ? (
                <p className="text-lg font-extrabold text-rose-600">{inspection.quantity_rejected}</p>
              ) : (
                <input
                  type="number"
                  min="0"
                  max={inspection.quantity_inspected}
                  value={quantityRejected}
                  onChange={(e) => setQuantityRejected(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-rose-600"
                />
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Traceability & Source Context</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 font-semibold uppercase">Goods Receipt (GRN)</span>
              <p className="font-semibold text-slate-800 mt-1">
                {inspection.goods_receipts?.grn_number || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 font-semibold uppercase">Production Order</span>
              <p className="font-semibold text-slate-800 mt-1">
                {inspection.production_orders?.production_order_number || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 font-semibold uppercase">Inspector Profile</span>
              <p className="font-semibold text-slate-800 mt-1">
                {inspection.inspected_by_profile
                  ? `${inspection.inspected_by_profile.full_name || inspection.inspected_by_profile.email}`
                  : 'Quality Officer'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 font-semibold uppercase">Inspection Date</span>
              <p className="font-semibold text-slate-800 mt-1">
                {inspection.created_at ? new Date(inspection.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CHARACTERISTICS MEASUREMENT TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Characteristics Measurements & Tolerances
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase bg-slate-100/70 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Characteristic</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-center">Target</th>
                <th className="py-3.5 px-4 text-center">Min Tol</th>
                <th className="py-3.5 px-4 text-center">Max Tol</th>
                <th className="py-3.5 px-4 w-44">Measured Value</th>
                <th className="py-3.5 px-4 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    No template characteristics configured for this inspection. You can accept/reject based on overall visual audit.
                  </td>
                </tr>
              ) : (
                results.map((resItem, idx) => (
                  <tr key={resItem.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {resItem.characteristic_name}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-500">{resItem.characteristic_type}</td>
                    <td className="py-3 px-4 text-center font-mono text-xs">
                      {resItem.target_value !== null && resItem.target_value !== undefined ? `${resItem.target_value} ${resItem.unit || ''}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-600">
                      {resItem.min_value !== null && resItem.min_value !== undefined ? `${resItem.min_value} ${resItem.unit || ''}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-600">
                      {resItem.max_value !== null && resItem.max_value !== undefined ? `${resItem.max_value} ${resItem.unit || ''}` : '—'}
                    </td>

                    {/* Measured Value Input */}
                    <td className="py-3 px-4">
                      {resItem.characteristic_type === 'NUMERIC' ? (
                        <input
                          type="number"
                          step="any"
                          disabled={inspection.status === 'PASSED' || inspection.status === 'FAILED'}
                          placeholder="Measured..."
                          value={resItem.measured_value ?? ''}
                          onChange={(e) => handleResultValueChange(idx, 'measured_value', e.target.value)}
                          className="w-full px-2.5 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      ) : resItem.characteristic_type === 'BOOLEAN' ? (
                        <select
                          disabled={inspection.status === 'PASSED' || inspection.status === 'FAILED'}
                          value={resItem.boolean_value ? 'true' : 'false'}
                          onChange={(e) => handleResultValueChange(idx, 'boolean_value', e.target.value === 'true')}
                          className="w-full px-2.5 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="true">YES / PASS</option>
                          <option value="false">NO / FAIL</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          disabled={inspection.status === 'PASSED' || inspection.status === 'FAILED'}
                          value={resItem.text_value || ''}
                          onChange={(e) => handleResultValueChange(idx, 'text_value', e.target.value)}
                          className="w-full px-2.5 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </td>

                    {/* Result Badge */}
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={resItem.result || 'PENDING'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM COMPLETE DIALOG */}
      <ConfirmDialog
        isOpen={showCompleteDialog}
        onClose={() => setShowCompleteDialog(false)}
        onConfirm={handleCompleteInspection}
        title="Complete Quality Inspection"
        message={`Are you sure you want to complete this inspection with Accepted Quantity: ${quantityAccepted} and Rejected Quantity: ${quantityRejected}?`}
        confirmText="Complete Inspection"
      />

      {/* QUALITY HOLD DIALOG */}
      {showHoldDialog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-600" />
              Place Material on Quality Hold
            </h3>
            <p className="text-sm text-slate-600">
              Quarantine {inspection.quantity_inspected} units of <strong>{inspection.products?.name}</strong> to prevent issuance or dispatch.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Quality Hold *</label>
              <textarea
                rows={3}
                placeholder="e.g. Out of tolerance dimension on bore diameter, pending metallurgical review..."
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowHoldDialog(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePlaceOnHold}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 shadow-sm"
              >
                Confirm Quality Hold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionDetailPage;
