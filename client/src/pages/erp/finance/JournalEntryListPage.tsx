import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { JournalEntry, JournalStatus } from '../../../types/finance';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import StatusBadge from '../../../components/common/StatusBadge';

const JournalEntryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchJournalEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getJournalEntries({
        status: filterStatus,
        start_date: startDate,
        end_date: endDate,
        search: searchTerm,
      });
      setEntries(data);
    } catch (err: any) {
      console.error('Error fetching journal entries:', err);
      setError(err.response?.data?.message || 'Failed to fetch journal entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalEntries();
  }, [filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJournalEntries();
  };

  if (loading) return <LoadingState message="Fetching journal entry register..." />;
  if (error) return <ErrorState message={error} onRetry={fetchJournalEntries} />;

  return (
    <div className="space-y-6">
      {/* Header & New Entry Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-400" />
            Journal Entry Register
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manual and automated double-entry accounting transaction records
          </p>
        </div>

        <button
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/journal-entries/new')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-emerald-900/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Journal Entry
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === '' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              All Entries ({entries.length})
            </button>
            <button
              onClick={() => setFilterStatus('DRAFT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === 'DRAFT' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-amber-400 hover:text-amber-300'}`}
            >
              Drafts
            </button>
            <button
              onClick={() => setFilterStatus('POSTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === 'POSTED' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-emerald-400 hover:text-emerald-300'}`}
            >
              Posted
            </button>
            <button
              onClick={() => setFilterStatus('VOIDED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === 'VOIDED' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-rose-400 hover:text-rose-300'}`}
            >
              Voided / Reversed
            </button>
          </div>

          {/* Date & Keyword Search */}
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
            <span className="text-slate-500 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search JE # or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              Filter
            </button>
          </form>
        </div>
      </div>

      {/* Journal Entries Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Journal No</th>
                <th className="p-3.5">Entry Date</th>
                <th className="p-3.5">Fiscal Period</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5 text-right">Total Debit (₹)</th>
                <th className="p-3.5 text-right">Total Credit (₹)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No journal entries found.
                  </td>
                </tr>
              ) : (
                entries.map(entry => (
                  <tr
                    key={entry.id}
                    onClick={() => navigate(`/secure-kolmeks-x0y0/finance/journal-entries/${entry.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      {entry.journal_number}
                    </td>
                    <td className="p-3.5 text-slate-400">{entry.entry_date}</td>
                    <td className="p-3.5 text-slate-400 font-medium">
                      {entry.period?.period_name || '—'}
                    </td>
                    <td className="p-3.5 max-w-md truncate font-medium text-slate-200">
                      {entry.description}
                      {entry.reference_id && (
                        <span className="ml-2 text-[10px] text-slate-500 font-mono">[{entry.reference_type}: {entry.reference_id}]</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-mono text-cyan-400 font-semibold">
                      ₹{parseFloat(entry.total_debit as any || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono text-purple-400 font-semibold">
                      ₹{parseFloat(entry.total_credit as any || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/secure-kolmeks-x0y0/finance/journal-entries/${entry.id}`);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="View Journal Lines"
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryListPage;
