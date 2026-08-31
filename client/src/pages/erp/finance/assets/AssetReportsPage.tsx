import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, ArrowLeft, Download, FileSpreadsheet, PieChart, Building2 } from 'lucide-react';
import assetService, { AssetFinancialReports } from '../../../../services/asset.service';

export const AssetReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<AssetFinancialReports | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'category' | 'cost_center' | 'register'>('category');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await assetService.getReports();
        setReports(data);
      } catch (err) {
        console.error('Error fetching asset financial reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
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
            <BarChart2 className="w-6 h-6 text-purple-600" />
            <span>Fixed Asset Financial Reports</span>
          </h1>
          <p className="text-sm text-slate-500">
            Valuation reports by category, cost center allocation, and asset register schedule
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('category')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'category'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          By Category Summary
        </button>
        <button
          onClick={() => setActiveTab('cost_center')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'cost_center'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          By Cost Center Allocation
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'register'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Full Asset Register Schedule
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Generating asset valuation reports...</div>
      ) : !reports ? (
        <div className="p-12 text-center text-slate-500">Failed to load asset reports.</div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'category' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Fixed Asset Summary by Category</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/60">
                      <th className="py-3.5 px-4">Category Code & Name</th>
                      <th className="py-3.5 px-4 text-center">Asset Count</th>
                      <th className="py-3.5 px-4 text-right">Gross Cost</th>
                      <th className="py-3.5 px-4 text-right">Accum Dep</th>
                      <th className="py-3.5 px-4 text-right">Net Book Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reports.by_category.map((cat) => (
                      <tr key={cat.code} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-indigo-600 mr-2">[{cat.code}]</span>
                          <span className="font-medium text-slate-900">{cat.name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">{cat.asset_count}</td>
                        <td className="py-3.5 px-4 text-right font-medium">{formatCurrency(cat.gross_cost)}</td>
                        <td className="py-3.5 px-4 text-right text-slate-500">{formatCurrency(cat.accumulated_depreciation)}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(cat.net_book_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'cost_center' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Fixed Asset Allocation by Cost Center</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/60">
                      <th className="py-3.5 px-4">Cost Center Code & Name</th>
                      <th className="py-3.5 px-4 text-center">Asset Count</th>
                      <th className="py-3.5 px-4 text-right">Gross Cost</th>
                      <th className="py-3.5 px-4 text-right">Accum Dep</th>
                      <th className="py-3.5 px-4 text-right">Net Book Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reports.by_cost_center.map((cc) => (
                      <tr key={cc.cost_center_code} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-sky-600 mr-2">[{cc.cost_center_code}]</span>
                          <span className="font-medium text-slate-900">{cc.cost_center_name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">{cc.asset_count}</td>
                        <td className="py-3.5 px-4 text-right font-medium">{formatCurrency(cc.gross_cost)}</td>
                        <td className="py-3.5 px-4 text-right text-slate-500">{formatCurrency(cc.accumulated_depreciation)}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(cc.net_book_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Complete Asset Register Valuation Schedule</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/60">
                      <th className="py-3.5 px-4">Asset Code & Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Acquisition Date</th>
                      <th className="py-3.5 px-4 text-right">Gross Cost</th>
                      <th className="py-3.5 px-4 text-right">Accum Dep</th>
                      <th className="py-3.5 px-4 text-right">Net Book Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reports.asset_register.map((ast) => (
                      <tr key={ast.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-indigo-600">{ast.asset_number}</div>
                          <div className="font-medium text-slate-900">{ast.asset_name}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{ast.category?.name || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-500">{ast.acquisition_date}</td>
                        <td className="py-3.5 px-4 text-right font-medium">{formatCurrency(ast.acquisition_cost)}</td>
                        <td className="py-3.5 px-4 text-right text-slate-500">{formatCurrency(ast.accumulated_depreciation)}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(ast.net_book_value)}</td>
                      </tr>
                    ))}
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
