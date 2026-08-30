import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { JournalEntry } from '../../../types/finance';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import StatusBadge from '../../../components/common/StatusBadge';

const JournalEntryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Reverse Modal State
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getJournalEntryById(id);
      setEntry(data);
    } catch (err: any) {
      console.error('Error fetching journal detail:', err);
      setError(err.response?.data?.message || 'Failed to fetch journal entry detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handlePost = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      setError(null);
      await financeService.postJournalEntry(id);
      fetchDetail();
    } catch (err: any) {
      console.error('Error posting journal:', err);
      setError(err.response?.data?.message || 'Failed to post journal entry.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReverse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !voidReason.trim()) return;

    try {
      setActionLoading(true);
      setError(null);
      await financeService.reverseJournalEntry(id, voidReason.trim());
      setIsReverseModalOpen(false);
      setVoidReason('');
      fetchDetail();
    } catch (err: any) {
      console.error('Error reversing journal:', err);
      setError(err.response?.data?.message || 'Failed to reverse journal entry.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Fetching journal entry line items..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDetail} />;
  if (!entry) return <ErrorState message="Journal entry not found." />;

  const totalDebit = parseFloat(entry.total_debit as any || 0);
  const totalCredit = parseFloat(entry.total_credit as any || 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-emerald-400">{entry.journal_number}</h1>
              <StatusBadge status={entry.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Posting Date: <span className="text-slate-200 font-medium">{entry.entry_date}</span> • Period:{' '}
              <span className="text-slate-200 font-medium">{entry.period?.period_name || '—'}</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3">
          {entry.status === 'DRAFT' && (
            <button
              onClick={handlePost}
              disabled={actionLoading || !isBalanced}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-lg shadow-emerald-900/30 disabled:opacity-40"
            >
              <CheckCircle className="w-4 h-4" />
              {actionLoading ? 'Posting...' : 'Post Journal to Ledger'}
            </button>
          )}

          {entry.status === 'POSTED' && (
            <button
              onClick={() => setIsReverseModalOpen(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reverse / Void Journal
            </button>
          )}
        </div>
      </div>

      {/* Header Info Box */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Journal Metadata & Audit</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Reference Type</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">{entry.reference_type || 'MANUAL'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Reference Ref No</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">{entry.reference_id || '—'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Posted Timestamp</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">
              {entry.posted_at ? new Date(entry.posted_at).toLocaleString() : 'Not Posted'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Voided Timestamp</span>
            <span className="font-semibold text-slate-200 mt-0.5 block text-rose-400">
              {entry.voided_at ? new Date(entry.voided_at).toLocaleString() : 'Active'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-500 block">Description / Note:</span>
          <p className="text-slate-200 font-medium mt-1">{entry.description}</p>
        </div>

        {entry.void_reason && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
            <span className="font-bold block">Void / Reversal Audit Reason:</span>
            {entry.void_reason}
          </div>
        )}
      </div>

      {/* Journal Lines Table */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Double-Entry Journal Line Items</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Account Code</th>
                <th className="p-3">Account Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Line Remark</th>
                <th className="p-3 text-right">Debit (₹)</th>
                <th className="p-3 text-right">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {(entry.lines || []).map((line, idx) => (
                <tr key={line.id || idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono text-emerald-400 font-bold">{line.account?.account_code || '—'}</td>
                  <td className="p-3 font-semibold text-slate-200">{line.account?.account_name || '—'}</td>
                  <td className="p-3 text-slate-400">{line.account?.account_type || '—'}</td>
                  <td className="p-3 text-slate-400">{line.description || '—'}</td>
                  <td className="p-3 text-right font-mono text-cyan-400 font-bold">
                    {parseFloat(line.debit as any || 0) > 0 ? `₹${parseFloat(line.debit as any).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td className="p-3 text-right font-mono text-purple-400 font-bold">
                    {parseFloat(line.credit as any || 0) > 0 ? `₹${parseFloat(line.credit as any).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-800/80 font-mono text-xs border-t-2 border-slate-700 font-bold">
              <tr>
                <td colSpan={4} className="p-3 text-right uppercase text-slate-400">Total Journal Balance:</td>
                <td className="p-3 text-right text-cyan-400 text-sm">
                  ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-right text-purple-400 text-sm">
                  ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Reverse Modal */}
      {isReverseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-400" />
              Reverse Journal Entry
            </h3>
            <p className="text-xs text-slate-400">
              Reversing will mark <span className="font-mono text-emerald-400 font-bold">{entry.journal_number}</span> as VOIDED and generate an exact opposing reversing entry in an OPEN period.
            </p>

            <form onSubmit={handleReverse} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Reason for Reversal / Void *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State accounting justification for reversal..."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReverseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-rose-900/30 disabled:opacity-50"
                >
                  {actionLoading ? 'Reversing...' : 'Confirm Reversal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntryDetailPage;
