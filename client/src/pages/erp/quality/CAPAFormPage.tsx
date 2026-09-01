import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, CheckSquare } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { qualityService } from '../../../services/quality.service';
import { NonConformanceReport } from '../../../types/quality';

const CAPAFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const linkedNcrId = searchParams.get('ncr_id');

  const [loading, setLoading] = useState(false);
  const [ncrs, setNcrs] = useState<NonConformanceReport[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ncr_id: linkedNcrId || '',
    source_type: linkedNcrId ? 'NCR' : 'AUDIT',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    due_date: ''
  });

  const [actionItems, setActionItems] = useState<Array<{ action_type: 'CORRECTIVE' | 'PREVENTIVE'; description: string; due_date: string }>>([
    { action_type: 'CORRECTIVE', description: '', due_date: '' },
    { action_type: 'PREVENTIVE', description: '', due_date: '' }
  ]);

  useEffect(() => {
    const fetchNCRs = async () => {
      try {
        const res = await qualityService.getNCRs();
        if (res.success) {
          setNcrs(res.data);
          if (linkedNcrId) {
            const found = res.data.find(n => n.id === linkedNcrId);
            if (found) {
              setFormData(prev => ({
                ...prev,
                title: `CAPA for ${found.ncr_number}: ${found.title}`,
                description: `Corrective and Preventive Action Plan initiated to address root cause: ${found.root_cause || found.description}`
              }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load NCR list:', err);
      }
    };
    fetchNCRs();
  }, [linkedNcrId]);

  const handleAddAction = () => {
    setActionItems([...actionItems, { action_type: 'CORRECTIVE', description: '', due_date: '' }]);
  };

  const handleRemoveAction = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validActions = actionItems.filter(a => a.description.trim() !== '');
      const res = await qualityService.createCAPA({
        ...formData,
        ncr_id: formData.ncr_id || undefined,
        actions: validActions as any
      });

      if (res.success) {
        navigate(`/secure-kolmeks-x0y0/quality/capa/${res.data.id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create CAPA plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ERPPageHeader
        title="Create CAPA Action Plan"
        subtitle="Initiate a formal Corrective and Preventive Action plan with action tasks and verification milestones."
        actions={
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            1. CAPA Details & Classification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">CAPA Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Update CNC Milling Jig Tolerance to Prevent Oversized Bore Defect"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source Type</label>
              <select
                value={formData.source_type}
                onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="NCR">Linked Non-Conformance Report (NCR)</option>
                <option value="AUDIT">Internal / External Audit</option>
                <option value="CUSTOMER_COMPLAINT">Customer Complaint / RMA</option>
                <option value="INTERNAL_INSPECTION">Routine Quality Inspection</option>
                <option value="SUPPLIER_REJECT">Supplier Material Rejection</option>
                <option value="CONTINUOUS_IMPROVEMENT">Continuous Improvement (Kaizen)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Linked NCR (Optional)</label>
              <select
                value={formData.ncr_id}
                onChange={(e) => setFormData({ ...formData, ncr_id: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- No Linked NCR --</option>
                {ncrs.map(n => (
                  <option key={n.id} value={n.id}>{n.ncr_number} - {n.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Completion Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Problem Description & Scope *</label>
              <textarea
                rows={4}
                required
                placeholder="Comprehensive background of the non-conformance and why action is required..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* ACTION ITEMS SECTION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              2. Corrective & Preventive Action Items
            </h3>
            <button
              type="button"
              onClick={handleAddAction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Action Item
            </button>
          </div>

          <div className="space-y-3">
            {actionItems.map((action, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Action Item #{idx + 1}
                  </span>
                  {actionItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Action Type</label>
                    <select
                      value={action.action_type}
                      onChange={(e) => {
                        const updated = [...actionItems];
                        updated[idx].action_type = e.target.value as any;
                        setActionItems(updated);
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                    >
                      <option value="CORRECTIVE">Corrective Action (Immediate Fix)</option>
                      <option value="PREVENTIVE">Preventive Action (System Change)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Action Description</label>
                    <input
                      type="text"
                      placeholder="Specific action step..."
                      value={action.description}
                      onChange={(e) => {
                        const updated = [...actionItems];
                        updated[idx].description = e.target.value;
                        setActionItems(updated);
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving Plan...' : 'Save & Publish CAPA'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CAPAFormPage;
