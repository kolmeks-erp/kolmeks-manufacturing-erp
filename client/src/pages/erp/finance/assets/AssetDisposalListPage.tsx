import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, TrendingUp, TrendingDown, FileSpreadsheet } from 'lucide-react';
import assetService, { FixedAssetDisposal } from '../../../../services/asset.service';

export const AssetDisposalListPage: React.FC = () => {
  const navigate = useNavigate();
  const [disposals, setDisposals] = useState<FixedAssetDisposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDisposals = async () => {
      try {
        setLoading(true);
        const data = await assetService.getDisposals();
        setDisposals(data);
      } catch (err) {
        console.error('Error fetching asset disposals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDisposals();
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
            <Trash2 className="w-6 h-6 text-rose-600" />
            <span>Asset Disposal & Gain/Loss Register</span>
          </h1>
          <p className="text-sm text-slate-500">
            Records of asset disposals, sales proceeds, retired status, and financial GL gain/loss adjustments
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading asset disposal register...</div>
        ) : disposals.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No asset disposals recorded</h3>
            <p className="text-sm text-slate-500">Assets can be disposed or retired from their detail view page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/60">
                  <th className="py-3.5 px-4">Disposal #</th>
                  <th className="py-3.5 px-4">Asset Code & Name</th>
                  <th className="py-3.5 px-4">Disposal Date</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4 text-right">Book Value at Disposal</th>
                  <th className="py-3.5 px-4 text-right">Proceeds</th>
                  <th className="py-3.5 px-4 text-right">Gain / Loss Amount</th>
                  <th className="py-3.5 px-4 text-center">GL Journal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {disposals.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-rose-600">{d.disposal_number}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-indigo-600">{d.asset?.asset_number}</div>
                      <div className="font-medium text-slate-900">{d.asset?.asset_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{d.disposal_date}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{d.disposal_reason}</td>
                    <td className="py-3.5 px-4 text-right text-slate-600">{formatCurrency(d.book_value_at_disposal)}</td>
                    <td className="py-3.5 px-4 text-right font-medium">{formatCurrency(d.disposal_proceeds)}</td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      {d.gain_loss_amount >= 0 ? (
                        <span className="text-emerald-600 flex items-center justify-end space-x-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+ {formatCurrency(d.gain_loss_amount)}</span>
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center justify-end space-x-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>- {formatCurrency(Math.abs(d.gain_loss_amount))}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-500">
                      {d.journal_entry?.journal_number || 'POSTED'}
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
