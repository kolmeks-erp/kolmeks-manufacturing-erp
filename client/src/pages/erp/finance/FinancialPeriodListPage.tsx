import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Plus,
  Lock,
  Unlock,
  AlertCircle,
  X,
} from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { FinancialPeriod } from '../../../types/finance';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import StatusBadge from '../../../components/common/StatusBadge';

const FinancialPeriodListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periods, setPeriods] = useState<FinancialPeriod[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // New Period Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [periodName, setPeriodName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Reopen Modal
  const [reopenPeriodId, setReopenPeriodId] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState('');

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getPeriods();
      setPeriods(data);
    } catch (err: any) {
      console.error('Error fetching periods:', err);
      setError(err.response?.data?.message || 'Failed to fetch financial periods.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodName || !startDate || !endDate) return;

    try {
      setSubmitting(true);
      setError(null);
      await financeService.createPeriod({ period_name: periodName.trim(), start_date: startDate, end_date: endDate });
      setIsNewModalOpen(false);
      setPeriodName('');
      setStartDate('');
      setEndDate('');
      fetchPeriods();
    } catch (err: any) {
      console.error('Error creating period:', err);
      setError(err.response?.data?.message || 'Failed to create financial period.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClosePeriod = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to CLOSE financial period '${name}'? No further journal entries can be posted to this period once closed.`)) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await financeService.closePeriod(id);
      fetchPeriods();
    } catch (err: any) {
      console.error('Error closing period:', err);
      setError(err.response?.data?.message || 'Failed to close period.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReopenPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenPeriodId || !reopenReason.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await financeService.reopenPeriod(reopenPeriodId, reopenReason.trim());
      setReopenPeriodId(null);
      setReopenReason('');
      fetchPeriods();
    } catch (err: any) {
      console.error('Error reopening period:', err);
      setError(err.response?.data?.message || 'Failed to reopen period.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Fetching fiscal periods..." />;
  if (error) return <ErrorState message={error} onRetry={fetchPeriods} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-emerald-400" />
            Financial Periods & Fiscal Controls
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage fiscal accounting periods, lock closed periods, and audit reopening logs
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-emerald-900/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Fiscal Period
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Period Name</th>
                <th className="p-3.5">Start Date</th>
                <th className="p-3.5">End Date</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Closed / Reopened Audit</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {periods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No financial periods configured yet.
                  </td>
                </tr>
              ) : (
                periods.map(period => (
                  <tr key={period.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-slate-200">{period.period_name}</td>
                    <td className="p-3.5 font-mono text-slate-400">{period.start_date}</td>
                    <td className="p-3.5 font-mono text-slate-400">{period.end_date}</td>
                    <td className="p-3.5 text-center">
                      <StatusBadge status={period.status} />
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {period.closed_at && (
                        <p className="text-[11px] text-slate-500">
                          Closed: {new Date(period.closed_at).toLocaleDateString()}
                        </p>
                      )}
                      {period.reopened_at && (
                        <p className="text-[11px] text-amber-400/80">
                          Reopened: {new Date(period.reopened_at).toLocaleDateString()} ({period.reopen_reason})
                        </p>
                      )}
                      {!period.closed_at && !period.reopened_at && '—'}
                    </td>
                    <td className="p-3.5 text-right">
                      {period.status === 'OPEN' ? (
                        <button
                          onClick={() => handleClosePeriod(period.id, period.period_name)}
                          disabled={submitting}
                          className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5 inline mr-1" />
                          Close Period
                        </button>
                      ) : (
                        <button
                          onClick={() => setReopenPeriodId(period.id)}
                          disabled={submitting}
                          className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Unlock className="w-3.5 h-3.5 inline mr-1" />
                          Reopen Period
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

      {/* New Period Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Add Fiscal Period
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePeriod} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Period Name *</label>
                <input
                  type="text"
                  placeholder="e.g. FY 2026-27 - Q2"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      {reopenPeriodId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-amber-400" />
              Reopen Financial Period
            </h3>

            <form onSubmit={handleReopenPeriod} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Audit Reopening Reason *</label>
                <textarea
                  rows={3}
                  placeholder="Mandatory explanation for reopening closed period..."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReopenPeriodId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-amber-900/30 disabled:opacity-50"
                >
                  {submitting ? 'Reopening...' : 'Confirm Reopen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialPeriodListPage;
