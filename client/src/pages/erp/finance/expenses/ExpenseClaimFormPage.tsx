import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  Upload,
  Save,
  Send,
  ArrowLeft,
  CheckCircle,
  Paperclip,
  IndianRupee,
  Building2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import { ERPPageHeader } from '../../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../../components/erp/LoadingState';
import { ErrorState } from '../../../../components/erp/ErrorState';
import {
  expenseService,
  ExpenseCategory,
  ExpenseItem,
} from '../../../../services/expense.service';
import { budgetingService } from '../../../../services/budgeting.service';
import { CostCenter } from '../../../../types/budgeting';
import { ERP_BASE_PATH } from '../../../../constants/navigation';

export const ExpenseClaimFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [claimDate, setClaimDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [costCenterId, setCostCenterId] = useState<string>('');
  
  // Dropdown options
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);

  // Expense Line Items
  const [items, setItems] = useState<ExpenseItem[]>([
    {
      expense_date: new Date().toISOString().split('T')[0],
      category_id: '',
      description: '',
      amount: 0,
      notes: '',
      receipt_url: '',
      receipt_public_id: '',
    },
  ]);

  // Uploading status tracker per line index
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [catData, ccData] = await Promise.all([
          expenseService.getCategories(false),
          budgetingService.getCostCenters({ is_active: true }),
        ]);

        setCategories(catData);
        if (ccData.success && ccData.data) setCostCenters(ccData.data);

        if (isEditMode && id) {
          const claim = await expenseService.getClaimById(id);
          setClaimDate(claim.claim_date);
          setDescription(claim.description);
          setCostCenterId(claim.cost_center_id || '');
          if (claim.items && claim.items.length > 0) {
            setItems(
              claim.items.map((it) => ({
                expense_date: it.expense_date,
                category_id: it.category_id || '',
                description: it.description,
                amount: it.amount,
                notes: it.notes || '',
                receipt_url: it.receipt_url || '',
                receipt_public_id: it.receipt_public_id || '',
              }))
            );
          }
        }
      } catch (err: any) {
        console.error('Error initializing claim form:', err);
        setError(err?.response?.data?.message || 'Failed to load form data.');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, isEditMode]);

  // Line item manipulation
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        expense_date: claimDate,
        category_id: categories.length > 0 ? categories[0].id : '',
        description: '',
        amount: 0,
        notes: '',
        receipt_url: '',
        receipt_public_id: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ExpenseItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Handle Receipt File Upload
  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingIndex(index);
      const res = await expenseService.uploadReceipt(file);
      handleItemChange(index, 'receipt_url', res.receipt_url);
      handleItemChange(index, 'receipt_public_id', res.receipt_public_id);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to upload receipt file.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const calculateTotal = () => items.reduce((sum, it) => sum + (parseFloat(String(it.amount)) || 0), 0);

  const handleSubmitForm = async (submitImmediately: boolean) => {
    try {
      if (!description.trim()) {
        setError('Please enter a claim description.');
        return;
      }

      if (items.length === 0) {
        setError('Please add at least one expense line item.');
        return;
      }

      for (let i = 0; i < items.length; i++) {
        if (!items[i].description.trim()) {
          setError(`Item #${i + 1} description is required.`);
          return;
        }
        if (!items[i].amount || items[i].amount <= 0) {
          setError(`Item #${i + 1} amount must be greater than zero.`);
          return;
        }
      }

      setSubmitting(true);
      setError(null);

      const payload = {
        claim_date: claimDate,
        description: description.trim(),
        cost_center_id: costCenterId || undefined,
        items,
        submit_immediately: submitImmediately,
      };

      if (isEditMode && id) {
        await expenseService.updateClaim(id, payload);
        if (submitImmediately) {
          await expenseService.submitClaim(id);
        }
        setSuccessMsg('Expense claim updated successfully.');
      } else {
        const res = await expenseService.createClaim(payload);
        setSuccessMsg(res.message || 'Expense claim created successfully.');
      }

      setTimeout(() => {
        navigate(`${ERP_BASE_PATH}/finance/expenses/claims`);
      }, 1200);
    } catch (err: any) {
      console.error('Failed to save claim:', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to submit expense claim.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ERPLayout activeTab="finance">
        <LoadingState message="Loading Expense Claim form..." />
      </ERPLayout>
    );
  }

  return (
    <ERPLayout activeTab="finance">
      <div className="space-y-6 max-w-5xl mx-auto">
        <ERPPageHeader
          title={isEditMode ? 'Edit Expense Claim' : 'Submit New Expense Claim'}
          subtitle="Record detailed business expense line items, attach receipt files, allocate cost centers, and submit for approval."
          actions={
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          }
        />

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-sm flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-sm flex items-center">
            <CheckCircle className="w-5 h-5 mr-3 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Claim Header Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-slate-100 flex items-center border-b border-slate-800 pb-3">
            <FileText className="w-4 h-4 mr-2 text-emerald-400" />
            Claim General Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Claim Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={claimDate}
                onChange={(e) => setClaimDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Cost Center Allocation
              </label>
              <select
                value={costCenterId}
                onChange={(e) => setCostCenterId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="">-- General / Unallocated --</option>
                {costCenters.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.code} - {cc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Total Claim Amount (INR)
              </label>
              <div className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-bold px-3 py-2 rounded-lg text-base">
                ₹{calculateTotal().toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Purpose / Description <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Client Onsite Visit Expense - Pune Manufacturing Plant"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Expense Items Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-100 flex items-center">
              <IndianRupee className="w-4 h-4 mr-2 text-emerald-400" />
              Expense Line Items Breakdown
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Item Line
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 relative">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-850 pb-2">
                  <span>Line Item #{idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-rose-400 hover:text-rose-300 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Expense Date</label>
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={item.expense_date}
                      onChange={(e) => handleItemChange(idx, 'expense_date', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                    <select
                      value={item.category_id}
                      onChange={(e) => handleItemChange(idx, 'category_id', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-sm"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Description / Particulars</label>
                    <input
                      type="text"
                      placeholder="e.g. Flight Ticket Mumbai to Delhi"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 px-3 py-1.5 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      placeholder="0.00"
                      value={item.amount || ''}
                      onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 font-semibold px-3 py-1.5 rounded-lg text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Receipt Attachment (PDF/JPG/PNG)</label>
                    <div className="flex items-center space-x-3">
                      <label className="inline-flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                        {uploadingIndex === idx ? 'Uploading...' : 'Choose Receipt File'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={(e) => handleFileUpload(idx, e)}
                          className="hidden"
                          disabled={uploadingIndex === idx}
                        />
                      </label>
                      {item.receipt_url ? (
                        <a
                          href={item.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-400 hover:underline flex items-center truncate max-w-xs"
                        >
                          <Paperclip className="w-3.5 h-3.5 mr-1" />
                          View Uploaded Receipt
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">No receipt attached</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmitForm(false)}
            className="inline-flex items-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold border border-slate-700 transition"
          >
            <Save className="w-4 h-4 mr-2 text-slate-400" />
            Save as Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmitForm(true)}
            className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-sm font-semibold shadow-md transition"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Claim for Review'}
          </button>
        </div>
      </div>
    </ERPLayout>
  );
};

export default ExpenseClaimFormPage;
