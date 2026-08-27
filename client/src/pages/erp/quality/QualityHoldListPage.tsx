import React, { useEffect, useState } from 'react';
import { Lock, Search, Filter, CheckCircle2, Unlock } from 'lucide-react';
import { ERPPageHeader } from '../../../components/erp/ERPPageHeader';
import { StatusBadge } from '../../../components/erp/StatusBadge';
import { LoadingState } from '../../../components/erp/LoadingState';
import { EmptyState } from '../../../components/erp/EmptyState';
import { ErrorState } from '../../../components/erp/ErrorState';
import { qualityService } from '../../../services/quality.service';
import { QualityHold } from '../../../types/quality';

const QualityHoldListPage: React.FC = () => {
  const [holds, setHolds] = useState<QualityHold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ON_HOLD');

  // Release Modal
  const [selectedHold, setSelectedHold] = useState<QualityHold | null>(null);
  const [releaseQty, setReleaseQty] = useState<number>(0);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [releasing, setReleasing] = useState(false);

  const fetchHolds = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await qualityService.getQualityHolds({
        search,
        status: statusFilter || undefined
      });
      if (res.success) setHolds(res.data);
    } catch (err: any) {
      console.error('Failed to fetch quality holds:', err);
      setError(err.message || 'Unable to load quality holds.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolds();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHolds();
  };

  const handleOpenReleaseModal = (hold: QualityHold) => {
    setSelectedHold(hold);
    const remaining = hold.quantity - hold.released_quantity;
    setReleaseQty(remaining);
    setReleaseNotes('');
  };

  const handleConfirmRelease = async () => {
    if (!selectedHold) return;
    setReleasing(true);
    try {
      const res = await qualityService.releaseQualityHold(selectedHold.id, {
        release_quantity: releaseQty,
        notes: releaseNotes
      });

      if (res.success) {
        setSelectedHold(null);
        fetchHolds();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to release quality hold');
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Quality Holds & Quarantined Inventory"
        subtitle="Review quarantined stock batches, reasons for hold, and perform release authorizations."
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Hold #, Reason, Product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="">All Holds</option>
            <option value="ON_HOLD">Currently Active Holds</option>
            <option value="RELEASED">Released</option>
            <option value="REJECTED">Scrapped / Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading Quality Holds..." />
      ) : error ? (
        <ErrorState title="Failed to Load Quality Holds" message={error} onRetry={fetchHolds} />
      ) : holds.length === 0 ? (
        <EmptyState
          icon={Lock}
          title="No Active Quality Holds"
          description="There are currently no inventory items on quality quarantine hold."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Hold #</th>
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Reason</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Held Qty</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Released Qty</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Placed Date</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holds.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-rose-600">{h.hold_number}</td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">{h.products?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-xs text-slate-700 max-w-xs truncate">{h.reason}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{h.quantity}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">{h.released_quantity}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={h.status} />
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {new Date(h.placed_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {h.status === 'ON_HOLD' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenReleaseModal(h)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded hover:bg-emerald-100 transition-colors"
                        >
                          <Unlock className="w-3.5 h-3.5" /> Release Qty
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Fully Released</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RELEASE HOLD MODAL */}
      {selectedHold && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-600" />
              Authorize Release from Quality Hold
            </h3>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg space-y-1">
              <p>Product: <strong>{selectedHold.products?.name}</strong></p>
              <p>Total Quarantined: <strong>{selectedHold.quantity}</strong> | Already Released: <strong>{selectedHold.released_quantity}</strong></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Release Quantity *</label>
              <input
                type="number"
                min="0.01"
                max={selectedHold.quantity - selectedHold.released_quantity}
                step="any"
                value={releaseQty}
                onChange={(e) => setReleaseQty(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Authorization Notes</label>
              <textarea
                rows={3}
                placeholder="e.g. Engineering disposition granted after 100% rework verification..."
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedHold(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRelease}
                disabled={releasing}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm"
              >
                Authorize Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityHoldListPage;
