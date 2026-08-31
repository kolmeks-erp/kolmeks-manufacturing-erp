import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TrendingDown,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Trash2,
  FolderTree,
  BarChart2,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import assetService, { AssetDashboardSummary, FixedAsset } from '../../../../services/asset.service';

export const AssetDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AssetDashboardSummary | null>(null);
  const [recentAssets, setRecentAssets] = useState<FixedAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, assetsData] = await Promise.all([
        assetService.getDashboardSummary(),
        assetService.getAssets({ search: '' }),
      ]);
      setSummary(sumData);
      setRecentAssets(assetsData.slice(0, 6));
    } catch (err: any) {
      console.error('Error loading asset dashboard:', err);
      setError('Unable to load fixed asset dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-sm font-semibold mb-1">
            <Box className="w-5 h-5" />
            <span>Kolmeks Fixed Asset Finance & Capitalization</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Fixed Assets & Depreciation</h1>
          <p className="text-slate-300 text-sm mt-1">
            Asset capitalization, straight-line depreciation engine, transfer tracking, and gain/loss disposal accounting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/new')}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/depreciation')}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
          >
            <TrendingDown className="w-4 h-4 text-indigo-400" />
            <span>Depreciation Run</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gross Asset Cost</span>
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.total_gross_cost || 0)}</h2>
            <p className="text-xs text-slate-500 mt-1">Total acquisition value registered</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Accumulated Dep.</span>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.total_accumulated_depreciation || 0)}</h2>
            <p className="text-xs text-slate-500 mt-1">Total depreciation posted to GL</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Book Value (NBV)</span>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-emerald-700">{formatCurrency(summary?.total_net_book_value || 0)}</h2>
            <p className="text-xs text-slate-500 mt-1">Current total balance sheet asset value</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Latest Period Dep.</span>
            <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.current_period_depreciation || 0)}</h2>
            <p className="text-xs text-slate-500 mt-1">Period: {summary?.latest_depreciation_period || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Secondary Status Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <div>
            <span className="text-xs text-slate-500 block">Active Capitalized</span>
            <span className="font-semibold text-slate-800 text-sm">{summary?.active_assets_count || 0} Assets</span>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div>
            <span className="text-xs text-slate-500 block">Pending Capitalization</span>
            <span className="font-semibold text-slate-800 text-sm">{summary?.pending_capitalization_count || 0} Assets</span>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          <div>
            <span className="text-xs text-slate-500 block">Fully Depreciated</span>
            <span className="font-semibold text-slate-800 text-sm">{summary?.fully_depreciated_count || 0} Assets</span>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <div>
            <span className="text-xs text-slate-500 block">Disposed Assets</span>
            <span className="font-semibold text-slate-800 text-sm">{summary?.disposed_count || 0} Assets</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/list')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-md transition-all text-left group"
        >
          <FileSpreadsheet className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-slate-900 text-sm">Asset Register</h3>
          <p className="text-xs text-slate-500 mt-0.5">Search & filter assets</p>
        </button>

        <button
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/depreciation')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-md transition-all text-left group"
        >
          <TrendingDown className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-slate-900 text-sm">Depreciation Runs</h3>
          <p className="text-xs text-slate-500 mt-0.5">Preview & post runs</p>
        </button>

        <button
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/transfers')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-md transition-all text-left group"
        >
          <RefreshCw className="w-6 h-6 text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-slate-900 text-sm">Asset Transfers</h3>
          <p className="text-xs text-slate-500 mt-0.5">Cost center movement</p>
        </button>

        <button
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/disposals')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-md transition-all text-left group"
        >
          <Trash2 className="w-6 h-6 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-slate-900 text-sm">Asset Disposals</h3>
          <p className="text-xs text-slate-500 mt-0.5">Gain/Loss accounting</p>
        </button>

        <button
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/categories')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-md transition-all text-left group"
        >
          <FolderTree className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-slate-900 text-sm">Categories</h3>
          <p className="text-xs text-slate-500 mt-0.5">GL account mappings</p>
        </button>

        <button
          onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/reports')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-md transition-all text-left group"
        >
          <BarChart2 className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-slate-900 text-sm">Financial Reports</h3>
          <p className="text-xs text-slate-500 mt-0.5">Category & cost center</p>
        </button>
      </div>

      {/* Recent Fixed Assets Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Fixed Asset Register</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest registered financial assets</p>
          </div>
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/list')}
            className="flex items-center space-x-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/60">
                <th className="py-3 px-4">Asset Number</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost</th>
                <th className="py-3 px-4 text-right">Accum Dep</th>
                <th className="py-3 px-4 text-right">Net Book Value</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {recentAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No fixed assets found. Click "Register Asset" to create one.
                  </td>
                </tr>
              ) : (
                recentAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-indigo-600">{asset.asset_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{asset.asset_name}</td>
                    <td className="py-3 px-4 text-slate-600">{asset.category?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(asset.acquisition_cost)}</td>
                    <td className="py-3 px-4 text-right text-slate-500">{formatCurrency(asset.accumulated_depreciation)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(asset.net_book_value)}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => navigate(`/secure-kolmeks-x0y0/finance/assets/${asset.id}`)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        Details
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
