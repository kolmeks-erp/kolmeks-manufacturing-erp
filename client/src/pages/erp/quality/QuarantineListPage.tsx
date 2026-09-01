import React, { useEffect, useState } from 'react';
import { Lock, Search, Filter, RefreshCw, CheckCircle2, Trash2, ShieldAlert } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { qualityService } from '../../../services/quality.service';
import { QualityHold } from '../../../types/quality';

const QuarantineListPage: React.FC = () => {
  const [holds, setHolds] = useState<QualityHold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Release / Scrap Modal state
  const [selectedHold, setSelectedHold] = useState<QualityHold | null>(null);
  const [modalType, setModalType] = useState<'RELEASE' | 'SCRAP' | null>(null);
  const [quantityInput, setQuantityInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  const fetchHolds = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getQualityHolds({ search, status: statusFilter });
      if (res.success) {
        setHolds(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quarantine holds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolds();
  }, [statusFilter]);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHold || !modalType) return;
    try {
      const qty = parseFloat(quantityInput);
      if (isNaN(qty) || qty <= 0) {
        alert('Please enter a valid positive quantity.');
        return;
      }

      if (modalType === 'RELEASE') {
        await qualityService.releaseQualityHold(selectedHold.id, { release_quantity: qty, notes: notesInput });
      } else {
        await qualityService.scrapQualityHold(selectedHold.id, { scrap_quantity: qty, notes: notesInput });
      }

      setSelectedHold(null);
      setModalType(null);
      setQuantityInput('');
      setNotesInput('');
      fetchHolds();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Quality Quarantine & Hold Management"
        subtitle="Isolate defective or suspect materials, log quality holds, authorize inventory release or scrap."
      />

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search hold # or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Quarantine States</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="RELEASED">Released</option>
              <option value="REJECTED">Scrapped / Rejected</option>
            </select>
          </div>

          <button
            onClick={fetchHolds}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading Quality Quarantine Records..." />
      ) : error ? (
        <ErrorState title="Error Loading Quarantine Data" message={error} onRetry={fetchHolds} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Hold #</th>
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Hold Quantity</th>
                <th className="py-3.5 px-4 font-semibold">Released / Scrapped</th>
                <th className="py-3.5 px-4 font-semibold">Reason for Hold</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No items currently in quality quarantine.
                  </td>
                </tr>
              ) : (
                holds.map((hold) => (
                  <tr key={hold.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-indigo-600 font-mono">
                      {hold.hold_number}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {hold.products?.name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {hold.quantity} units
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold">
                      <span className="text-emerald-600">Rel: {hold.released_quantity}</span> | <span className="text-rose-600">Scrap: {hold.scrapped_quantity || 0}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {hold.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={hold.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {hold.status === 'ON_HOLD' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedHold(hold);
                              setModalType('RELEASE');
                              setQuantityInput(String(hold.quantity - hold.released_quantity));
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Release
                          </button>
                          <button
                            onClick={() => {
                              setSelectedHold(hold);
                              setModalType('SCRAP');
                              setQuantityInput(String(hold.quantity - hold.released_quantity));
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Scrap
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* RELEASE / SCRAP MODAL */}
      {selectedHold && modalType && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className={`text-lg font-bold flex items-center gap-2 ${modalType === 'RELEASE' ? 'text-emerald-600' : 'text-rose-600'}`}>
              <ShieldAlert className="w-5 h-5" />
              {modalType === 'RELEASE' ? 'Authorize Material Release' : 'Authorize Scrap Disposition'}
            </h3>

            <p className="text-xs text-slate-600">
              Hold Record: <strong>{selectedHold.hold_number}</strong> ({selectedHold.products?.name})
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {modalType === 'RELEASE' ? 'Release Quantity *' : 'Scrap Quantity *'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Approval Notes / Rationale</label>
                <textarea
                  rows={3}
                  placeholder="Reason for disposition..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedHold(null); setModalType(null); }}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm ${modalType === 'RELEASE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                  Confirm {modalType === 'RELEASE' ? 'Release' : 'Scrap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuarantineListPage;
