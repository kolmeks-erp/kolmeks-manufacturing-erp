import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Save,
  Clock,
  UserCheck,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { qualityService } from '../../../services/quality.service';
import { NonConformanceReport, NCRStatus } from '../../../types/quality';

const NCRDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [ncr, setNcr] = useState<NonConformanceReport | null>(null);
  const [rootCause, setRootCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [status, setStatus] = useState<NCRStatus>('OPEN');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchNCR = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getNCRById(id);
      if (res.success && res.data) {
        setNcr(res.data);
        setRootCause(res.data.root_cause || '');
        setCorrectiveAction(res.data.corrective_action || '');
        setPreventiveAction(res.data.preventive_action || '');
        setStatus(res.data.status);
      }
    } catch (err: any) {
      console.error('Failed to fetch NCR details:', err);
      setError(err.message || 'Unable to load Non-Conformance Report details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNCR();
  }, [id]);

  const handleSaveInvestigation = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await qualityService.updateNCR(id, {
        status,
        root_cause: rootCause,
        corrective_action: correctiveAction,
        preventive_action: preventiveAction
      });

      if (res.success) {
        setSuccessMsg('CAPA investigation details saved successfully.');
        fetchNCR();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save investigation.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNCR = async () => {
    if (!id) return;
    if (!rootCause || !correctiveAction) {
      setError('Root Cause Analysis and Corrective Action are mandatory before closing an NCR.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await qualityService.closeNCR(id, {
        root_cause: rootCause,
        corrective_action: correctiveAction,
        preventive_action: preventiveAction
      });

      if (res.success) {
        setSuccessMsg('Non-Conformance Report closed successfully.');
        fetchNCR();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to close NCR.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading NCR Details..." />;
  if (error && !ncr) return <ErrorState title="NCR Not Found" message={error} onRetry={fetchNCR} />;
  if (!ncr) return null;

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title={`NCR ${ncr.ncr_number}`}
        subtitle={ncr.title}
        actions={
          <div className="flex items-center gap-3">
            <Link
              to="/secure-kolmeks-x0y0/quality/ncr"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to NCRs
            </Link>

            {ncr.status !== 'CLOSED' && (
              <>
                <button
                  type="button"
                  onClick={handleSaveInvestigation}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Save Investigation
                </button>

                <button
                  type="button"
                  onClick={handleCloseNCR}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Close NCR
                </button>
              </>
            )}
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

      {/* SUMMARY CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Severity</span>
          <div className="mt-1">
            <StatusBadge status={ncr.severity} />
          </div>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Source Type</span>
          <p className="text-sm font-bold text-slate-900 mt-1">{ncr.source_type}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Product</span>
          <p className="text-sm font-bold text-blue-600 mt-1">{ncr.products?.name || 'N/A'}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Status</span>
          <div className="mt-1">
            <StatusBadge status={ncr.status} />
          </div>
        </div>
      </div>

      {/* MAIN CAPA INVESTIGATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Defect Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{ncr.description}</p>
          </div>

          {/* ROOT CAUSE & CAPA */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Root Cause Analysis & Corrective / Preventive Actions (CAPA)
            </h3>

            {ncr.status !== 'CLOSED' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full sm:w-64 px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="UNDER_INVESTIGATION">UNDER_INVESTIGATION</option>
                  <option value="ACTION_REQUIRED">ACTION_REQUIRED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="VERIFICATION">VERIFICATION</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Root Cause Analysis (5-Why / Ishakawa Fishbone) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                disabled={ncr.status === 'CLOSED'}
                placeholder="Identify exact root cause (e.g. worn insert tooling, incorrect CNC feed rate, vendor material flaw)..."
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Immediate Corrective Action (Rework / Quarantine / Scrap) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                disabled={ncr.status === 'CLOSED'}
                placeholder="Immediate action taken (e.g. skim-turned bore to +0.02mm, quarantined batchlot #881)..."
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Preventive Action (Long-Term Systems Control)
              </label>
              <textarea
                rows={3}
                disabled={ncr.status === 'CLOSED'}
                placeholder="Preventive steps (e.g. updated tool replacement cycle to 150 cycles, added mandatory FAI check)..."
                value={preventiveAction}
                onChange={(e) => setPreventiveAction(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* TIMELINE & METADATA */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Assignment & Timeline</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Assigned Engineer</span>
                <p className="font-semibold text-slate-800 mt-1">
                  {ncr.assigned_profile ? `${ncr.assigned_profile.first_name} ${ncr.assigned_profile.last_name}` : 'Unassigned'}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Target Due Date</span>
                <p className="font-semibold text-slate-800 mt-1">{ncr.due_date || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Created Date</span>
                <p className="font-semibold text-slate-800 mt-1">{new Date(ncr.created_at).toLocaleDateString()}</p>
              </div>
              {ncr.closed_at && (
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Closed Date</span>
                  <p className="font-semibold text-emerald-600 mt-1">{new Date(ncr.closed_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NCRDetailPage;
