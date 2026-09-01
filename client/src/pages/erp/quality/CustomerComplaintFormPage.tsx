import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MessageSquare } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { qualityService } from '../../../services/quality.service';

const CustomerComplaintFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    batch_number: '',
    serial_number: '',
    description: '',
    severity: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await qualityService.createCustomerComplaint(formData);
      if (res.success) {
        navigate('/secure-kolmeks-x0y0/quality/complaints');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to log customer complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <ERPPageHeader
        title="Log Customer Quality Complaint"
        subtitle="Record product issue details, serial numbers, and trigger non-conformance investigation."
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Complaint Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Batch / Lot Number (Optional)</label>
            <input
              type="text"
              placeholder="e.g. LOT-2026-0041"
              value={formData.batch_number}
              onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number (Optional)</label>
            <input
              type="text"
              placeholder="e.g. SN-KOL-9921"
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Severity Level</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              <option value="LOW">Low (Cosmetic / Packaging)</option>
              <option value="MEDIUM">Medium (Minor Functional Fault)</option>
              <option value="HIGH">High (Major Operational Failure)</option>
              <option value="CRITICAL">Critical (Safety / Recall Risk)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Description *</label>
            <textarea
              rows={5}
              required
              placeholder="Describe the defect, customer report, and observed symptoms..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Submitting...' : 'Log Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerComplaintFormPage;
