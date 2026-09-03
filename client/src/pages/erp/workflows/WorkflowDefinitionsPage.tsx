import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, CheckCircle2, AlertCircle, Play, Eye } from 'lucide-react';
import { workflowService } from '../../../services/workflow.service';
import { WorkflowDefinition } from '../../../types/workflow';

export const WorkflowDefinitionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    module: 'Procurement',
    entity_type: 'purchase_order',
  });

  const fetchDefinitions = async () => {
    try {
      const data = await workflowService.getDefinitions();
      setDefinitions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load workflow definitions:', err);
      setDefinitions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefinitions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await workflowService.createDefinition(formData);
      setModalOpen(false);
      fetchDefinitions();
    } catch (err) {
      alert('Failed to create workflow definition.');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await workflowService.activateDefinition(id);
      fetchDefinitions();
    } catch (err) {
      alert('Activation failed.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Workflow Definitions Catalog</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage enterprise approval configurations, stages, approver rules, and versioning across ERP modules
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Workflow Definition
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">Loading definitions...</div>
        ) : definitions.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">No workflow definitions configured yet.</div>
        ) : (
          definitions.map((def) => (
            <div
              key={def.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200/80">
                    {def.module}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      def.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        : 'bg-amber-50 text-amber-700 border-amber-200/80'
                    }`}
                  >
                    {def.status} (v{def.active_version_number})
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-3">{def.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{def.description || 'No description provided.'}</p>

                <div className="mt-3 text-[11px] font-mono text-slate-500 space-y-0.5">
                  <div>Entity: <span className="font-semibold text-slate-700">{def.entity_type}</span></div>
                  <div>Code: <span className="font-semibold text-slate-700">{def.code}</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/secure-kolmeks-x0y0/workflows/definitions/${def.id}`)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Builder & Stages
                </button>

                {def.status !== 'Active' && (
                  <button
                    onClick={() => handleActivate(def.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" /> Activate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for new workflow definition */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Create Workflow Definition</h2>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Workflow Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PO_APPROVAL_WF"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Workflow Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Purchase Order Approval"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Target Module</label>
                <select
                  value={formData.module}
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Procurement">Procurement</option>
                  <option value="Documents">Documents</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Quality">Quality</option>
                  <option value="Finance">Finance</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Entity Type</label>
                <select
                  value={formData.entity_type}
                  onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="purchase_order">Purchase Order</option>
                  <option value="purchase_requisition">Purchase Requisition</option>
                  <option value="document">Document</option>
                  <option value="sales_quotation">Sales Quotation</option>
                  <option value="leave_request">Leave Request</option>
                  <option value="capa">CAPA</option>
                  <option value="invoice">Invoice</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer"
                >
                  Save Definition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
