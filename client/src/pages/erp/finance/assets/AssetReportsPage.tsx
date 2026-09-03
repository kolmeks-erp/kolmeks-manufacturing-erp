import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  PieChart,
  Building2,
  Layers,
  RefreshCw,
  Printer,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react';
import assetService, { AssetFinancialReports } from '../../../../services/asset.service';

export const AssetReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<AssetFinancialReports | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'category' | 'cost_center' | 'register'>('category');

  const fetchReports = async () => {
    try {
      setRefreshing(true);
      const data = await assetService.getReports();
      setReports(data);
    } catch (err) {
      console.error('Error fetching asset financial reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Calculate high-level summary KPIs
  const totalGrossCost = reports?.by_category?.reduce((acc, c) => acc + (c.gross_cost || 0), 0) || 0;
  const totalAccumDep = reports?.by_category?.reduce((acc, c) => acc + (c.accumulated_depreciation || 0), 0) || 0;
  const totalNetBookValue = reports?.by_category?.reduce((acc, c) => acc + (c.net_book_value || 0), 0) || 0;
  const totalAssetUnits = reports?.by_category?.reduce((acc, c) => acc + (c.asset_count || 0), 0) || 0;

  const handleExportCSV = () => {
    if (!reports) return;
    let rows: string[][] = [];
    let filename = `asset_report_${activeTab}.csv`;

    if (activeTab === 'category') {
      rows = [
        ['Category Code', 'Category Name', 'Asset Count', 'Gross Cost (INR)', 'Accumulated Dep (INR)', 'Net Book Value (INR)'],
        ...reports.by_category.map((c) => [c.code, c.name, String(c.asset_count), String(c.gross_cost), String(c.accumulated_depreciation), String(c.net_book_value)]),
      ];
    } else if (activeTab === 'cost_center') {
      rows = [
        ['Cost Center Code', 'Cost Center Name', 'Asset Count', 'Gross Cost (INR)', 'Accumulated Dep (INR)', 'Net Book Value (INR)'],
        ...reports.by_cost_center.map((cc) => [cc.cost_center_code, cc.cost_center_name, String(cc.asset_count), String(cc.gross_cost), String(cc.accumulated_depreciation), String(cc.net_book_value)]),
      ];
    } else {
      rows = [
        ['Asset Code', 'Asset Name', 'Category', 'Acquisition Date', 'Gross Cost (INR)', 'Accumulated Dep (INR)', 'Net Book Value (INR)'],
        ...reports.asset_register.map((a) => [a.asset_number, a.asset_name, a.category?.name || '', a.acquisition_date || '', String(a.acquisition_cost), String(a.accumulated_depreciation), String(a.net_book_value)]),
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 print:p-0">
      {/* Integrated Unified Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/secure-kolmeks-x0y0/finance/assets')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all shadow-2xs mb-3 print:hidden"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Asset Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl shadow-2xs">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Fixed Asset Financial Reports
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Valuation reports by category, cost center allocation, and asset register schedule
                </p>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-2.5 shrink-0 print:hidden">
            <button
              onClick={fetchReports}
              disabled={refreshing}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 shadow-2xs transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Report</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Integrated Segmented Pill Navigation */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'category'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>By Category Summary</span>
            <span
              className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                activeTab === 'category' ? 'bg-purple-700/80 text-white' : 'bg-slate-200/70 text-slate-700'
              }`}
            >
              {reports?.by_category?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cost_center')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'cost_center'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>By Cost Center Allocation</span>
            <span
              className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                activeTab === 'cost_center' ? 'bg-purple-700/80 text-white' : 'bg-slate-200/70 text-slate-700'
              }`}
            >
              {reports?.by_cost_center?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Full Asset Register Schedule</span>
            <span
              className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                activeTab === 'register' ? 'bg-purple-700/80 text-white' : 'bg-slate-200/70 text-slate-700'
              }`}
            >
              {reports?.asset_register?.length || 0}
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center text-slate-400 font-medium animate-pulse">
          Generating asset valuation reports...
        </div>
      ) : !reports ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center text-slate-500 font-medium">
          Failed to load asset reports. Please check your backend connection.
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: BY CATEGORY SUMMARY */}
          {activeTab === 'category' && (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Fixed Asset Summary by Category</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Asset count and valuation metrics grouped by category code</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200/80">
                  {reports.by_category.length} Categories
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/60">
                      <th className="py-3.5 px-6">Category Code & Name</th>
                      <th className="py-3.5 px-4 text-center">Asset Count</th>
                      <th className="py-3.5 px-4 text-right">Gross Cost</th>
                      <th className="py-3.5 px-4 text-right">Accum Dep</th>
                      <th className="py-3.5 px-4 text-right">Net Book Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reports.by_category.map((cat) => (
                      <tr key={cat.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mr-2.5">
                            {cat.code}
                          </span>
                          <span className="font-bold text-slate-900">{cat.name}</span>
                        </td>
                        <td className="py-4 px-4 text-center font-bold font-mono text-slate-800">{cat.asset_count}</td>
                        <td className="py-4 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(cat.gross_cost)}</td>
                        <td className="py-4 px-4 text-right font-mono text-slate-500">{formatCurrency(cat.accumulated_depreciation)}</td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600">{formatCurrency(cat.net_book_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Total Summary Footer */}
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                      <td className="py-4 px-6">TOTAL CATEGORY VALUATION</td>
                      <td className="py-4 px-4 text-center font-mono">{totalAssetUnits}</td>
                      <td className="py-4 px-4 text-right font-mono text-slate-900">{formatCurrency(totalGrossCost)}</td>
                      <td className="py-4 px-4 text-right font-mono text-slate-600">{formatCurrency(totalAccumDep)}</td>
                      <td className="py-4 px-4 text-right font-mono text-emerald-700 text-base">{formatCurrency(totalNetBookValue)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: BY COST CENTER ALLOCATION */}
          {activeTab === 'cost_center' && (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Fixed Asset Allocation by Cost Center</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Asset deployment and book value distribution across operational cost centers</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200/80">
                  {reports.by_cost_center.length} Cost Centers
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/60">
                      <th className="py-3.5 px-6">Cost Center Code & Name</th>
                      <th className="py-3.5 px-4 text-center">Asset Count</th>
                      <th className="py-3.5 px-4 text-right">Gross Cost</th>
                      <th className="py-3.5 px-4 text-right">Accum Dep</th>
                      <th className="py-3.5 px-4 text-right">Net Book Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reports.by_cost_center.map((cc) => (
                      <tr key={cc.cost_center_code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200/80 mr-2.5">
                            {cc.cost_center_code}
                          </span>
                          <span className="font-bold text-slate-900">{cc.cost_center_name}</span>
                        </td>
                        <td className="py-4 px-4 text-center font-bold font-mono text-slate-800">{cc.asset_count}</td>
                        <td className="py-4 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(cc.gross_cost)}</td>
                        <td className="py-4 px-4 text-right font-mono text-slate-500">{formatCurrency(cc.accumulated_depreciation)}</td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600">{formatCurrency(cc.net_book_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                      <td className="py-4 px-6">TOTAL COST CENTER VALUATION</td>
                      <td className="py-4 px-4 text-center font-mono">{reports.by_cost_center.reduce((a, b) => a + (b.asset_count || 0), 0)}</td>
                      <td className="py-4 px-4 text-right font-mono text-slate-900">{formatCurrency(reports.by_cost_center.reduce((a, b) => a + (b.gross_cost || 0), 0))}</td>
                      <td className="py-4 px-4 text-right font-mono text-slate-600">{formatCurrency(reports.by_cost_center.reduce((a, b) => a + (b.accumulated_depreciation || 0), 0))}</td>
                      <td className="py-4 px-4 text-right font-mono text-emerald-700 text-base">{formatCurrency(reports.by_cost_center.reduce((a, b) => a + (b.net_book_value || 0), 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FULL ASSET REGISTER SCHEDULE */}
          {activeTab === 'register' && (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Complete Asset Register Valuation Schedule</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Itemized asset ledger with acquisition date and current book value</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/80">
                  {reports.asset_register.length} Assets
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/60">
                      <th className="py-3.5 px-6">Asset Code & Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Acquisition Date</th>
                      <th className="py-3.5 px-4 text-right">Gross Cost</th>
                      <th className="py-3.5 px-4 text-right">Accum Dep</th>
                      <th className="py-3.5 px-4 text-right">Net Book Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reports.asset_register.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                          No asset register items capitalized yet.
                        </td>
                      </tr>
                    ) : (
                      reports.asset_register.map((ast) => (
                        <tr key={ast.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-mono font-bold text-purple-700">{ast.asset_number}</div>
                            <div className="font-bold text-slate-900">{ast.asset_name}</div>
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-medium">{ast.category?.name || 'N/A'}</td>
                          <td className="py-4 px-4 text-slate-500 font-mono">{ast.acquisition_date || 'N/A'}</td>
                          <td className="py-4 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(ast.acquisition_cost)}</td>
                          <td className="py-4 px-4 text-right font-mono text-slate-500">{formatCurrency(ast.accumulated_depreciation)}</td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600">{formatCurrency(ast.net_book_value)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

