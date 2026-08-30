import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Save,
  Send,
} from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { ChartOfAccount } from '../../../types/finance';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';

interface FormLine {
  account_id: string;
  description: string;
  debit: string;
  credit: string;
}

const JournalEntryFormPage: React.FC = () => {
  const navigate = useNavigate();

  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [referenceType, setReferenceType] = useState<string>('MANUAL');
  const [referenceId, setReferenceId] = useState<string>('');

  const [lines, setLines] = useState<FormLine[]>([
    { account_id: '', description: '', debit: '0', credit: '0' },
    { account_id: '', description: '', debit: '0', credit: '0' },
  ]);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoadingAccounts(true);
        const data = await financeService.getAccounts({ status: 'ACTIVE' });
        setAccounts(data);
      } catch (err: any) {
        console.error('Error fetching CoA:', err);
        setError('Failed to load active Chart of Accounts.');
      } finally {
        setLoadingAccounts(false);
      }
    };
    loadAccounts();
  }, []);

  const handleAddLine = () => {
    setLines([...lines, { account_id: '', description: '', debit: '0', credit: '0' }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      alert('Journal entry requires a minimum of 2 line items for double-entry accounting.');
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof FormLine, value: string) => {
    const newLines = [...lines];
    newLines[index][field] = value;

    // Enforce Debit XOR Credit per line
    if (field === 'debit' && parseFloat(value || '0') > 0) {
      newLines[index].credit = '0';
    } else if (field === 'credit' && parseFloat(value || '0') > 0) {
      newLines[index].debit = '0';
    }

    setLines(newLines);
  };

  // Real-time calculations
  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit || '0') || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit || '0') || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01 && totalDebit > 0;

  const handleSubmit = async (autoPost: boolean) => {
    if (!description.trim()) {
      setError('Please provide an entry description.');
      return;
    }

    if (lines.some(l => !l.account_id)) {
      setError('All lines must have a valid account selected.');
      return;
    }

    if (autoPost && !isBalanced) {
      setError(`Cannot post unbalanced entry! Total Debit (₹${totalDebit.toFixed(2)}) must EQUAL Total Credit (₹${totalCredit.toFixed(2)}).`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // 1. Create Draft Journal
      const created = await financeService.createJournalEntry({
        entry_date: entryDate,
        description: description.trim(),
        reference_type: referenceType,
        reference_id: referenceId || undefined,
        lines: lines.map(l => ({
          account_id: l.account_id,
          description: l.description || description.trim(),
          debit: parseFloat(l.debit || '0') || 0,
          credit: parseFloat(l.credit || '0') || 0,
        })),
      });

      // 2. Post immediately if requested
      if (autoPost) {
        await financeService.postJournalEntry(created.id);
      }

      navigate(`/secure-kolmeks-x0y0/finance/journal-entries/${created.id}`);
    } catch (err: any) {
      console.error('Error saving journal:', err);
      setError(err.response?.data?.message || 'Failed to save journal entry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAccounts) return <LoadingState message="Loading Chart of Accounts..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/journal-entries')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-7 h-7 text-emerald-400" />
              New Double-Entry Journal Entry
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Record manual debit and credit journal transactions into the General Ledger
            </p>
          </div>
        </div>

        {/* Live Balance Status Badge */}
        <div className={`px-4 py-2 rounded-xl font-mono font-bold text-xs flex items-center gap-2 ${isBalanced ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
          {isBalanced ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Balanced (Diff: ₹0.00)
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
              Unbalanced Diff: ₹{difference.toFixed(2)}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Header Fields Form */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Journal Header Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Posting Date *</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Reference Type</label>
            <select
              value={referenceType}
              onChange={(e) => setReferenceType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="MANUAL">MANUAL JOURNAL</option>
              <option value="SALES_ORDER">SALES ORDER</option>
              <option value="PURCHASE_ORDER">PURCHASE ORDER</option>
              <option value="GRN">GOODS RECEIPT (GRN)</option>
              <option value="PAYROLL">PAYROLL</option>
              <option value="MAINTENANCE">PLANT MAINTENANCE</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Reference ID / Ref No</label>
            <input
              type="text"
              placeholder="e.g. INV-2026-089"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Journal Description *</label>
          <input
            type="text"
            placeholder="e.g. Monthly factory electricity utility bill accrual"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
            required
          />
        </div>
      </div>

      {/* Dynamic Journal Lines Table */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Double-Entry Transaction Lines (Min 2 required)
          </h3>

          <button
            type="button"
            onClick={handleAddLine}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Line
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3 w-12">#</th>
                <th className="p-3 w-1/3">Account (CoA) *</th>
                <th className="p-3">Line Description</th>
                <th className="p-3 text-right w-40">Debit (₹)</th>
                <th className="p-3 text-right w-40">Credit (₹)</th>
                <th className="p-3 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono text-slate-500 font-bold">{idx + 1}</td>

                  <td className="p-3">
                    <select
                      value={line.account_id}
                      onChange={(e) => handleLineChange(idx, 'account_id', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                      required
                    >
                      <option value="">-- Select Account --</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.account_code} - {a.account_name} ({a.account_type})
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Line remark (optional)"
                      value={line.description}
                      onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.debit}
                      onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-right text-cyan-400 font-mono focus:outline-none focus:border-cyan-500 font-bold text-xs"
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.credit}
                      onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-right text-purple-400 font-mono focus:outline-none focus:border-purple-500 font-bold text-xs"
                    />
                  </td>

                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Remove Line"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Totals Summary Footer */}
            <tfoot className="bg-slate-800/60 font-mono text-xs border-t-2 border-slate-700 font-bold">
              <tr>
                <td colSpan={3} className="p-3 text-right uppercase text-slate-400">Total Amounts:</td>
                <td className="p-3 text-right text-cyan-400 text-sm">
                  ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-right text-purple-400 text-sm">
                  ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Submission Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/journal-entries')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={() => handleSubmit(false)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-amber-400" />
          Save as Draft
        </button>

        <button
          type="button"
          disabled={submitting || !isBalanced}
          onClick={() => handleSubmit(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-emerald-900/30 disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Posting...' : 'Save & Post to Ledger'}
        </button>
      </div>
    </div>
  );
};

export default JournalEntryFormPage;
