import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  ArrowLeft,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import assetService, { FixedAsset, FixedAssetCategory } from '../../../../services/asset.service';

export const AssetListPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [categories, setCategories] = useState<FixedAssetCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetList, catList] = await Promise.all([
        assetService.getAssets({
          search,
          category_id: selectedCategory || undefined,
          status: selectedStatus || undefined,
        }),
        assetService.getCategories(),
      ]);
      setAssets(assetList);
      setCategories(catList);
    } catch (err) {
      console.error('Error fetching asset list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fixed Asset Register</h1>
          <p className="text-slate-500 text-sm">Full catalog of physical & financial plant assets</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets/new')}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Asset # or Asset Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACQUIRED">ACQUIRED (Uncapitalized)</option>
            <option value="ACTIVE">ACTIVE (Capitalized)</option>
            <option value="FULLY_DEPRECIATED">FULLY DEPRECIATED</option>
            <option value="DISPOSED">DISPOSED</option>
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading asset register...</div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No fixed assets found</h3>
            <p className="text-sm text-slate-500">Try adjusting your filters or register a new asset.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/60">
                  <th className="py-3.5 px-4">Asset Code & Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Acquisition Date</th>
                  <th className="py-3.5 px-4 text-right">Cost</th>
                  <th className="py-3.5 px-4 text-right">Accum Dep</th>
                  <th className="py-3.5 px-4 text-right">Net Book Value</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {assets.map((ast) => (
                  <tr key={ast.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-indigo-600">{ast.asset_number}</div>
                      <div className="font-medium text-slate-900">{ast.asset_name}</div>
                      {ast.operational_asset && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          Linked Maint Asset: {ast.operational_asset.asset_code}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{ast.category?.name || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{ast.acquisition_date}</td>
                    <td className="py-3.5 px-4 text-right font-medium">{formatCurrency(ast.acquisition_cost)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-500">{formatCurrency(ast.accumulated_depreciation)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(ast.net_book_value)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          ast.status === 'ACTIVE' || ast.status === 'CAPITALIZED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ast.status === 'ACQUIRED'
                            ? 'bg-amber-100 text-amber-800'
                            : ast.status === 'FULLY_DEPRECIATED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : ast.status === 'DISPOSED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {ast.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => navigate(`/secure-kolmeks-x0y0/finance/assets/${ast.id}`)}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
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
