import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckSquare, ShieldCheck, CheckCircle2, Lock, Plus, Calendar, User, FileText, AlertTriangle } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { qualityService } from '../../../services/quality.service';
import { CAPARecord, CAPAAction } from '../../../types/quality';

const CAPADetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [capa, setCapa] = useState<CAPARecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New action modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [newAction, setNewAction] = useState({
    action_type: 'CORRECTIVE' as 'CORRECTIVE' | 'PREVENTIVE',
    description: '',
    due_date: ''
  });

  const fetchCAPADetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getCAPAById(id);
      if (res.success) {
        setCapa(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load CAPA details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCAPADetails();
  }, [id]);

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const res = await qualityService.addCAPAAction(id, newAction);
      if (res.success) {
        setShowActionModal(false);
        setNewAction({ action_type: 'CORRECTIVE', description: '', due_date: '' });
        fetchCAPADetails();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add action item');
    }
  };

  const handleUpdateActionStatus = async (actionId: string, status: string) => {
    try {
      const notes = prompt('Enter completion / verification notes:');
      const res = await qualityService.updateCAPAAction(actionId, { status: status as any, completion_notes: notes || undefined });
      if (res.success) {
        fetchCAPADetails();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update action item');
    }
  };

  const handleVerifyCAPA = async () => {
    if (!id) return;
    try {
      const res = await qualityService.verifyCAPA(id);
      if (res.success) {
        fetchCAPADetails();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to verify CAPA');
    }
  };

  const handleCloseCAPA = async () => {
    if (!id) return;
    try {
      const res = await qualityService.closeCAPA(id);
      if (res.success) {
        fetchCAPADetails();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to close CAPA');
    }
  };

  if (loading) return <LoadingState message="Loading CAPA Details..." />;
  if (error || !capa) return <ErrorState title="Error Loading CAPA" message={error || 'CAPA Record not found'} onRetry={fetchCAPADetails} />;

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title={`CAPA Record: ${capa.capa_number}`}
        subtitle={capa.title}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/secure-kolmeks-x0y0/quality/capa')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {capa.status !== 'VERIFIED' && capa.status !== 'CLOSED' && (
              <button
                onClick={handleVerifyCAPA}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Verify CAPA
              </button>
            )}

            {capa.status === 'VERIFIED' && (
              <button
                onClick={handleCloseCAPA}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-sm transition-colors"
              >
                <Lock className="w-4 h-4" />
                Close CAPA Record
              </button>
            )}
          </div>
        }
      />

      {/* SUMMARY BANNER */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">CAPA Status</p>
          <div className="mt-1">
            <StatusBadge status={capa.status} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">Priority Level</p>
          <div className="mt-1">
            <StatusBadge status={capa.priority} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">Linked Source</p>
          {capa.non_conformance_reports ? (
            <Link
              to={`/secure-kolmeks-x0y0/quality/ncr/${capa.non_conformance_reports.id}`}
              className="text-sm font-bold text-indigo-600 hover:underline mt-1 block"
            >
              {capa.non_conformance_reports.ncr_number}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-slate-700 mt-1">{capa.source_type || 'Internal Audit'}</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">Target Completion Due Date</p>
          <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            {capa.due_date || 'N/A'}
          </p>
        </div>
      </div>

      {/* DESCRIPTION BLOCK */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Problem Description & Background
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
          {capa.description}
        </p>
      </div>

      {/* ACTION PLAN ITEMS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            Action Plan Items ({capa.actions?.length || 0})
          </h3>

          {capa.status !== 'CLOSED' && (
            <button
              onClick={() => setShowActionModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Action Step
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Action Type</th>
                <th className="py-3 px-4 font-semibold">Action Description</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Notes</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!capa.actions || capa.actions.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No action steps added to this CAPA yet.
                  </td>
                </tr>
              ) : (
                capa.actions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-md ${act.action_type === 'CORRECTIVE' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
                        {act.action_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {act.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={act.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {act.completion_notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {act.status === 'OPEN' && (
                        <button
                          onClick={() => handleUpdateActionStatus(act.id, 'COMPLETED')}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ACTION MODAL */}
      {showActionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              Add CAPA Action Item
            </h3>

            <form onSubmit={handleAddAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action Type</label>
                <select
                  value={newAction.action_type}
                  onChange={(e) => setNewAction({ ...newAction, action_type: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="CORRECTIVE">Corrective Action (Immediate Fix)</option>
                  <option value="PREVENTIVE">Preventive Action (Prevent Recurrence)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the action step..."
                  value={newAction.description}
                  onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={newAction.due_date}
                  onChange={(e) => setNewAction({ ...newAction, due_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Add Action Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CAPADetailPage;
