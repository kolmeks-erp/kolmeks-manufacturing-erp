import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  TrendingDown,
  RefreshCw,
  Trash2,
  Box,
  Building2,
  FileText,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Info,
} from 'lucide-react';
import assetService, { FixedAsset, DepreciationScheduleItem } from '../../../../services/asset.service';
import apiClient from '../../../../services/api';

export const AssetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [asset, setAsset] = useState<FixedAsset | null>(null);
  const [schedule, setSchedule] = useState<DepreciationScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [transferForm, setTransferForm] = useState({
    to_cost_center_id: '',
    to_location: '',
    reason: '',
  });

  // Disposal Modal State
  const [showDisposalModal, setShowDisposalModal] = useState<boolean>(false);
  const [disposalForm, setDisposalForm] = useState({
    disposal_date: new Date().toISOString().split('T')[0],
    disposal_reason: 'SOLD' as 'SOLD' | 'SCRAPPED' | 'LOST' | 'RETIRED' | 'OTHER',
    disposal_proceeds: 0,
    buyer_reference: '',
    notes: '',
  });

  const loadAssetDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [astData, schedData] = await Promise.all([
        assetService.getAssetById(id),
        assetService.getDepreciationSchedule(id).catch(() => ({ schedule: [] })),
      ]);
      setAsset(astData);
      setSchedule(schedData.schedule || []);
    } catch (err: any) {
      console.error('Error fetching asset details:', err);
      setError('Unable to load fixed asset detail record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssetDetail();
  }, [id]);

  const handleCapitalize = async () => {
    if (!id || !asset) return;
    if (!window.confirm(`Are you sure you want to Capitalize asset ${asset.asset_number}? This will post a balanced Journal Entry to the General Ledger.`)) return;

    try {
      setActionLoading(true);
      setError(null);
      const res = await assetService.capitalizeAsset(id);
      setSuccessMsg(res.message);
      loadAssetDetail();
    } catch (err: any) {
      console.error('Error capitalizing asset:', err);
      setError(err.response?.data?.message || err.message || 'Capitalization failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenTransferModal = async () => {
    try {
      const ccRes = await apiClient.get('/finance/cost-centers').catch(() => ({ data: { data: [] } }));
      setCostCenters(ccRes.data?.data || []);
      setTransferForm({
        to_cost_center_id: asset?.cost_center_id || '',
        to_location: asset?.location_id || '',
        reason: '',
      });
      setShowTransferModal(true);
    } catch (err) {
      console.error('Error loading cost centers:', err);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setActionLoading(true);
      setError(null);
      const res = await assetService.transferAsset(id, transferForm);
      setSuccessMsg(res.message);
      setShowTransferModal(false);
      loadAssetDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Asset transfer failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !asset) return;
    if (!window.confirm(`Are you sure you want to dispose asset ${asset.asset_number}? This action posts balanced disposal journal entries.`)) return;

    try {
      setActionLoading(true);
      setError(null);
      const res = await assetService.disposeAsset(id, disposalForm);
      setSuccessMsg(res.message);
      setShowDisposalModal(false);
      loadAssetDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Asset disposal failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading asset detail record...</div>;
  }

  if (!asset) {
    return <div className="p-12 text-center text-slate-500">Asset record not found.</div>;
  }

  const depreciableAmount = Math.max(0, asset.acquisition_cost - asset.residual_value);
  const gainLossCalc = disposalForm.disposal_proceeds - asset.net_book_value;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/list')}
            className="flex items-center space-x-1 text-sm font-medium text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Asset Register</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{asset.asset_number}</h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                asset.status === 'ACTIVE' || asset.status === 'CAPITALIZED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : asset.status === 'ACQUIRED'
                  ? 'bg-amber-100 text-amber-800'
                  : asset.status === 'FULLY_DEPRECIATED'
                  ? 'bg-indigo-100 text-indigo-800'
                  : asset.status === 'DISPOSED'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {asset.status}
            </span>
          </div>
          <p className="text-base font-semibold text-slate-700 mt-1">{asset.asset_name}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {['DRAFT', 'ACQUIRED', 'PENDING_CAPITALIZATION'].includes(asset.status) && (
            <button
              onClick={handleCapitalize}
              disabled={actionLoading}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Capitalize & Post Journal</span>
            </button>
          )}

          {['CAPITALIZED', 'ACTIVE', 'FULLY_DEPRECIATED'].includes(asset.status) && (
            <>
              <button
                onClick={handleOpenTransferModal}
                disabled={actionLoading}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm"
              >
                <RefreshCw className="w-4 h-4 text-sky-400" />
                <span>Transfer Asset</span>
              </button>
              <button
                onClick={() => setShowDisposalModal(true)}
                disabled={actionLoading}
                className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Dispose / Retire</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-800 font-bold">×</button>
        </div>
      )}

      {/* Financial Valuation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Original Acquisition Cost</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(asset.acquisition_cost)}</h3>
          <p className="text-xs text-slate-400 mt-1">Acquired: {asset.acquisition_date}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Accumulated Depreciation</span>
          <h3 className="text-2xl font-bold text-amber-700 mt-2">{formatCurrency(asset.accumulated_depreciation)}</h3>
          <p className="text-xs text-slate-400 mt-1">Depreciation Engine Status</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Net Book Value</span>
          <h3 className="text-2xl font-bold text-emerald-700 mt-2">{formatCurrency(asset.net_book_value)}</h3>
          <p className="text-xs text-slate-400 mt-1">Residual: {formatCurrency(asset.residual_value)}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Useful Life & Method</span>
          <h3 className="text-lg font-bold text-slate-900 mt-2">{asset.useful_life_months} Months</h3>
          <p className="text-xs text-indigo-600 font-medium mt-1">{asset.depreciation_method}</p>
        </div>
      </div>

      {/* Detail Section Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Asset Attributes & GL Mapping */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center space-x-2">
              <Box className="w-4 h-4 text-indigo-600" />
              <span>Asset Master Details</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Category</span>
                <span className="font-semibold text-slate-800">{asset.category?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Cost Center</span>
                <span className="font-semibold text-slate-800">
                  {asset.cost_center ? `${asset.cost_center.code} - ${asset.cost_center.name}` : 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Physical Location</span>
                <span className="font-semibold text-slate-800">{asset.location_id || 'Factory Main Floor'}</span>
              </div>
              {asset.operational_asset && (
                <div>
                  <span className="text-xs text-slate-500 block">Linked Operational Asset</span>
                  <span className="font-semibold text-indigo-600">
                    {asset.operational_asset.asset_code} ({asset.operational_asset.name})
                  </span>
                </div>
              )}
              {asset.description && (
                <div>
                  <span className="text-xs text-slate-500 block">Notes & Specifications</span>
                  <p className="text-xs text-slate-600 mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {asset.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* GL Accounting References */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>General Ledger Account Mapping</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Asset Account (Debit):</span>
                <span className="font-semibold text-slate-800">
                  {asset.asset_account ? `${asset.asset_account.account_code} - ${asset.asset_account.account_name}` : '1510 Machinery'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Accumulated Depreciation (Credit):</span>
                <span className="font-semibold text-slate-800">
                  {asset.accumulated_depreciation_account
                    ? `${asset.accumulated_depreciation_account.account_code} - ${asset.accumulated_depreciation_account.account_name}`
                    : '1550 Accumulated Depreciation'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Depreciation Expense (Debit):</span>
                <span className="font-semibold text-slate-800">
                  {asset.depreciation_expense_account
                    ? `${asset.depreciation_expense_account.account_code} - ${asset.depreciation_expense_account.account_name}`
                    : '5600 Depreciation Expense'}
                </span>
              </div>
              {asset.capitalization_journal && (
                <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200">
                  <span className="text-emerald-700 block font-semibold">Capitalization Journal Entry:</span>
                  <span>{asset.capitalization_journal.journal_number} ({asset.capitalization_journal.status})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Straight Line Depreciation Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-indigo-600" />
                  <span>Straight-Line Depreciation Schedule</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Depreciable Amount: {formatCurrency(depreciableAmount)} over {asset.useful_life_months} Months
                </p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                  <tr className="text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3 text-right">Opening NBV</th>
                    <th className="py-2.5 px-3 text-right">Depreciation</th>
                    <th className="py-2.5 px-3 text-right">Accum Dep</th>
                    <th className="py-2.5 px-3 text-right">Closing NBV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {schedule.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No depreciation schedule available.
                      </td>
                    </tr>
                  ) : (
                    schedule.map((row) => (
                      <tr key={row.period_number} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-500">{row.period_number}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">{row.period_name}</td>
                        <td className="py-2 px-3 text-right">{formatCurrency(row.opening_nbv)}</td>
                        <td className="py-2 px-3 text-right font-medium text-indigo-600">{formatCurrency(row.depreciation_amount)}</td>
                        <td className="py-2 px-3 text-right text-slate-500">{formatCurrency(row.accumulated_depreciation)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatCurrency(row.closing_nbv)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transfer History */}
          {asset.transfers && asset.transfers.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-sky-600" />
                <span>Transfer Movement History</span>
              </h3>
              <div className="space-y-2">
                {asset.transfers.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-indigo-600">{t.transfer_number}</span>
                      <p className="text-slate-600 mt-0.5">
                        To Cost Center: <span className="font-semibold">{t.to_cost_center?.name || 'N/A'}</span> ({t.to_location || 'N/A'})
                      </p>
                      <p className="text-slate-400 italic">Reason: {t.reason}</p>
                    </div>
                    <span className="text-slate-400">{t.transfer_date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Transfer Asset Cost Center / Location</h3>
            <form onSubmit={handleTransferSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Cost Center</label>
                <select
                  value={transferForm.to_cost_center_id}
                  onChange={(e) => setTransferForm({ ...transferForm, to_cost_center_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Select Cost Center...</option>
                  {costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.code} - {cc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Plant Location</label>
                <input
                  type="text"
                  placeholder="e.g. Machining Bay 3"
                  value={transferForm.to_location}
                  onChange={(e) => setTransferForm({ ...transferForm, to_location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Reason *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Reason for movement..."
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disposal Modal */}
      {showDisposalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Dispose / Retire Fixed Asset</h3>
            <form onSubmit={handleDisposalSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Disposal Reason *</label>
                <select
                  value={disposalForm.disposal_reason}
                  onChange={(e) => setDisposalForm({ ...disposalForm, disposal_reason: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="SOLD">SOLD (Sale to Buyer)</option>
                  <option value="SCRAPPED">SCRAPPED (Scrapped for parts)</option>
                  <option value="LOST">LOST / DAMAGED</option>
                  <option value="RETIRED">RETIRED from Service</option>
                  <option value="OTHER">OTHER Authorized Reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Disposal Date</label>
                <input
                  type="date"
                  value={disposalForm.disposal_date}
                  onChange={(e) => setDisposalForm({ ...disposalForm, disposal_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sale / Disposal Proceeds (₹)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={disposalForm.disposal_proceeds}
                  onChange={(e) => setDisposalForm({ ...disposalForm, disposal_proceeds: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              {/* Gain/Loss preview card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block">Current Net Book Value (NBV): {formatCurrency(asset.net_book_value)}</span>
                <div className="mt-1 font-bold">
                  {gainLossCalc >= 0 ? (
                    <span className="text-emerald-700">Expected Gain on Disposal: {formatCurrency(gainLossCalc)}</span>
                  ) : (
                    <span className="text-rose-700">Expected Loss on Disposal: {formatCurrency(Math.abs(gainLossCalc))}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Buyer Reference / Invoice #</label>
                <input
                  type="text"
                  placeholder="e.g. Scrap Invoice #10492"
                  value={disposalForm.buyer_reference}
                  onChange={(e) => setDisposalForm({ ...disposalForm, buyer_reference: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowDisposalModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-500"
                >
                  Confirm Disposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
