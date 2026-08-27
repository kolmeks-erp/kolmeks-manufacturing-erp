import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Save } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { apiClient } from '../../../services/api';
import { qualityService } from '../../../services/quality.service';
import { NCRSeverity, NCRSourceType } from '../../../types/quality';

const NCRFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const prefillInspectionId = searchParams.get('inspectionId');
  const prefillProductId = searchParams.get('productId');

  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<NCRSeverity>('MEDIUM');
  const [sourceType, setSourceType] = useState<NCRSourceType>('INCOMING_INSPECTION');
  const [productId, setProductId] = useState(prefillProductId || '');
  const [supplierId, setSupplierId] = useState('');
  const [inspectionId, setInspectionId] = useState(prefillInspectionId || '');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/products').then((res) => {
      if (res.data.success) setProducts(res.data.data);
    }).catch(console.error);

    apiClient.get('/suppliers').then((res) => {
      if (res.data.success) setSuppliers(res.data.data);
    }).catch(console.error);

    apiClient.get('/employees').then((res) => {
      if (res.data.success) setEmployees(res.data.data);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await qualityService.createNCR({
        title,
        description,
        severity,
        source_type: sourceType,
        product_id: productId || undefined,
        supplier_id: supplierId || undefined,
        inspection_id: inspectionId || undefined,
        assigned_to: assignedTo || undefined,
        due_date: dueDate || undefined
      });

      if (res.success && res.data) {
        navigate(`/secure-kolmeks-x0y0/quality/ncr/${res.data.id}`);
      }
    } catch (err: any) {
      console.error('Failed to create NCR:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create NCR.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ERPPageHeader
        title="Create Non-Conformance Report (NCR)"
        subtitle="Log engineering non-conformance, dimensional failure, or raw material defect."
        actions={
          <Link
            to="/secure-kolmeks-x0y0/quality/ncr"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              NCR Title / Issue Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Pump Shaft Journal Diameter out of tolerance tolerance (+0.08mm)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Severity Level <span className="text-rose-500">*</span>
            </label>
            <select
              value={severity}
              onChange={(e: any) => setSeverity(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-semibold"
            >
              <option value="LOW">LOW — Minor Cosmetic / Non-functional</option>
              <option value="MEDIUM">MEDIUM — Dimensional rework possible</option>
              <option value="HIGH">HIGH — Critical fit / Component scrap</option>
              <option value="CRITICAL">CRITICAL — Safety / Customer stoppage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Source Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={sourceType}
              onChange={(e: any) => setSourceType(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="INCOMING_INSPECTION">INCOMING_INSPECTION</option>
              <option value="IN_PROCESS_INSPECTION">IN_PROCESS_INSPECTION</option>
              <option value="FINAL_INSPECTION">FINAL_INSPECTION</option>
              <option value="SUPPLIER">SUPPLIER Defect</option>
              <option value="PRODUCTION">PRODUCTION Floor Issue</option>
              <option value="CUSTOMER">CUSTOMER Return / Complaint</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">Supplier (If applicable)</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.supplier_code} — {s.company_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">Assign Engineer / Manager</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Unassigned...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.department || 'Quality'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">Target Resolution Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Detailed Non-Conformance Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Describe what was observed, deviation from specification, affected batch quantity..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            to="/secure-kolmeks-x0y0/quality/ncr"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-sm transition-colors disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            {submitting ? 'Creating NCR...' : 'Create NCR Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NCRFormPage;
