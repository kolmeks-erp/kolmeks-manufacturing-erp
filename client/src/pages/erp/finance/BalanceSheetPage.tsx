import React, { useEffect, useState } from 'react';
import { PieChart, ArrowLeft, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { financeService } from '../../../services/finance.service';
import { BalanceSheetData } from '../../../types/finance';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import { FinancialIntegrityAlert } from '../../../components/erp/finance/FinancialIntegrityAlert';

const BalanceSheetPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BalanceSheetData | null>(null);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeService.getBalanceSheet();
      setData(res);
    } catch (err: any) {
      console.error('Error fetching Balance Sheet:', err);
      setError(err.response?.data?.message || 'Failed to calculate Balance Sheet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceSheet();
  }, []);

  if (loading) return <LoadingState message="Generating Balance Sheet statement & evaluating accounting equation..." />;
  if (error) return <ErrorState message={error} onRetry={fetchBalanceSheet} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/secure-kolmeks-x0y0/finance')}
            className="p-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-7 h-7 text-indigo-600" />
              Balance Sheet Statement
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Financial Position Statement: Assets = Liabilities + Shareholder Equity
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          Print Balance Sheet
        </button>
      </div>

      {/* Financial Integrity Check Alert */}
      {data && (
        <FinancialIntegrityAlert
          isBalanced={data.isBalanced}
          difference={data.difference}
          type="balance_sheet"
        />
      )}

      {/* Balance Sheet Grid (2 Columns: Assets on Left, Liabilities & Equity on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: ASSETS */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-emerald-800 uppercase tracking-wider">
              1. ASSETS
            </h3>
            <span className="font-mono text-emerald-800 font-extrabold text-lg">
              ₹{(data?.totalAssets || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200/80 tracking-wider">
                <tr>
                  <th className="p-2.5">Code</th>
                  <th className="p-2.5">Asset Account</th>
                  <th className="p-2.5 text-right font-mono">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {!data?.assets || data.assets.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      No asset accounts registered.
                    </td>
                  </tr>
                ) : (
                  data.assets.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-mono text-emerald-800 font-bold">{item.account_code}</td>
                      <td className="p-2.5 font-semibold text-slate-900">{item.account_name}</td>
                      <td className="p-2.5 text-right font-mono text-emerald-800 font-bold">
                        ₹{item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-50 font-mono text-xs border-t-2 border-slate-200 font-bold text-slate-900">
                <tr>
                  <td colSpan={2} className="p-3 text-right uppercase text-slate-600">Total Assets:</td>
                  <td className="p-3 text-right text-emerald-800 text-sm">
                    ₹{(data?.totalAssets || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: LIABILITIES & EQUITY */}
        <div className="space-y-6">
          {/* LIABILITIES */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-amber-800 uppercase tracking-wider">
                2. LIABILITIES
              </h3>
              <span className="font-mono text-amber-800 font-extrabold text-lg">
                ₹{(data?.totalLiabilities || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200/80 tracking-wider">
                  <tr>
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Liability Account</th>
                    <th className="p-2.5 text-right font-mono">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {!data?.liabilities || data.liabilities.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        No liability accounts registered.
                      </td>
                    </tr>
                  ) : (
                    data.liabilities.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 font-mono text-amber-800 font-bold">{item.account_code}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{item.account_name}</td>
                        <td className="p-2.5 text-right font-mono text-amber-800 font-bold">
                          ₹{item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-mono text-xs border-t border-slate-200 font-bold text-slate-900">
                  <tr>
                    <td colSpan={2} className="p-3 text-right uppercase text-slate-600">Total Liabilities:</td>
                    <td className="p-3 text-right text-amber-800 text-sm">
                      ₹{(data?.totalLiabilities || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* EQUITY */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-purple-800 uppercase tracking-wider">
                3. SHAREHOLDER EQUITY
              </h3>
              <span className="font-mono text-purple-800 font-extrabold text-lg">
                ₹{(data?.totalEquity || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200/80 tracking-wider">
                  <tr>
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Equity Account</th>
                    <th className="p-2.5 text-right font-mono">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {!data?.equity || data.equity.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        No equity accounts registered.
                      </td>
                    </tr>
                  ) : (
                    data.equity.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 font-mono text-purple-800 font-bold">{item.account_code}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{item.account_name}</td>
                        <td className="p-2.5 text-right font-mono text-purple-800 font-bold">
                          ₹{item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-mono text-xs border-t-2 border-slate-200 font-bold text-slate-900">
                  <tr>
                    <td colSpan={2} className="p-3 text-right uppercase text-slate-600">Total Liabilities + Equity:</td>
                    <td className="p-3 text-right text-indigo-800 text-sm">
                      ₹{(data?.totalLiabilitiesAndEquity || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetPage;
