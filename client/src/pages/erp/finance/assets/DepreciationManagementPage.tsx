import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingDown,
  ArrowLeft,
  Calendar,
  Play,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
} from 'lucide-react';
import assetService, { DepreciationRunPreview } from '../../../../services/asset.service';
import apiClient from '../../../../services/api';

export const DepreciationManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [financialPeriods, setFinancialPeriods] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [previewData, setPreviewData] = useState<DepreciationRunPreview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [posting, setPosting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadPeriods = async () => {
    try {
      const res = await apiClient.get('/finance/periods').catch(() => ({ data: { data: [] } }));
      const periods = res.data?.data || [];
      setFinancialPeriods(periods);
      const openPeriod = periods.find((p: any) => p.status === 'OPEN');
      if (openPeriod) {
        setSelectedPeriodId(openPeriod.id);
      }
    } catch (err) {
      console.error('Error fetching financial periods:', err);
    }
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const handlePreview = async () => {
    if (!selectedPeriodId) {
      setError('Please select an open financial period.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      const preview = await assetService.previewDepreciationRun(selectedPeriodId);
      setPreviewData(preview);
    } catch (err: any) {
      console.error('Error calculating depreciation run preview:', err);
      setError(err.response?.data?.message || err.message || 'Failed to preview depreciation run.');
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPeriodId) {
      handlePreview();
    }
  }, [selectedPeriodId]);

  const handlePostRun = async () => {
    if (!selectedPeriodId || !previewData) return;
    if (
      !window.confirm(
        `Are you sure you want to post Depreciation Run for period ${previewData.period_name}? Total amount: ₹${previewData.total_depreciation_amount.toLocaleString()}. This will create an atomic Journal Entry.`
      )
    )
      return;

    try {
      setPosting(true);
      setError(null);
      const res = await assetService.postDepreciationRun(selectedPeriodId);
      setSuccessMsg(res.message);
      setPreviewData(null);
      handlePreview();
    } catch (err: any) {
      console.error('Error posting depreciation run:', err);
      setError(err.response?.data?.message || err.message || 'Depreciation posting failed.');
    } finally {
      setPosting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const selectedPeriodObj = financialPeriods.find((p) => p.id === selectedPeriodId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets')}
            className="flex items-center space-x-1 text-sm font-medium text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Asset Dashboard</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <TrendingDown className="w-6 h-6 text-indigo-600" />
            <span>Monthly Depreciation Run Engine</span>
          </h1>
          <p className="text-sm text-slate-500">
            Automated straight-line depreciation engine with atomic GL journal entry posting
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-800 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Period Selector Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Select Financial Period
            </label>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-base rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Period...</option>
              {financialPeriods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.period_name} ({p.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {selectedPeriodObj?.status === 'CLOSED' ? (
            <div className="flex items-center space-x-2 text-rose-600 font-medium text-sm bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100">
              <AlertCircle className="w-4 h-4" />
              <span>Selected Period is CLOSED. Depreciation posting disabled.</span>
            </div>
          ) : (
            <button
              onClick={handlePostRun}
              disabled={posting || !previewData || previewData.total_assets_count === 0}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg transition-all text-sm disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{posting ? 'Posting Run...' : 'Post Depreciation Run & GL Journal'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      {previewData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Eligible Active Assets</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{previewData.total_assets_count}</h3>
            <p className="text-xs text-slate-400 mt-1">Assets ready for period calculation</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Period Depreciation</span>
            <h3 className="text-2xl font-bold text-indigo-600 mt-2">
              {formatCurrency(previewData.total_depreciation_amount)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Will debit 5600 Dep Exp & credit 1550 Accum Dep</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Financial Period</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{previewData.period_name}</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1">OPEN FOR POSTING</p>
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Depreciation Calculation Preview</h3>
            <p className="text-xs text-slate-500 mt-0.5">Asset level breakdown before posting</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Calculating period depreciation preview...</div>
        ) : !previewData || previewData.items.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-semibold text-slate-800">No assets eligible for depreciation</h4>
            <p className="text-xs text-slate-400">
              Either all active assets are fully depreciated or depreciation has already been posted for this period.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/60">
                  <th className="py-3.5 px-4">Asset Code & Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Opening NBV</th>
                  <th className="py-3.5 px-4 text-right">Period Depreciation</th>
                  <th className="py-3.5 px-4 text-right">New Accum Dep</th>
                  <th className="py-3.5 px-4 text-right">Closing NBV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {previewData.items.map((item) => (
                  <tr key={item.asset_id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-indigo-600">{item.asset_number}</div>
                      <div className="font-medium text-slate-900">{item.asset_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.category_name}</td>
                    <td className="py-3.5 px-4 text-right">{formatCurrency(item.opening_nbv)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-indigo-600">
                      {formatCurrency(item.depreciation_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">{formatCurrency(item.accumulated_depreciation)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(item.closing_nbv)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
