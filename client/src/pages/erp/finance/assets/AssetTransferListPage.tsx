import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft, Building2, Calendar, FileSpreadsheet } from 'lucide-react';
import assetService, { FixedAssetTransfer } from '../../../../services/asset.service';

export const AssetTransferListPage: React.FC = () => {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState<FixedAssetTransfer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        const data = await assetService.getTransfers();
        setTransfers(data);
      } catch (err) {
        console.error('Error fetching asset transfers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, []);

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
            <RefreshCw className="w-6 h-6 text-sky-600" />
            <span>Asset Transfer Register</span>
          </h1>
          <p className="text-sm text-slate-500">History of asset movements across cost centers and plant locations</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading asset transfer history...</div>
        ) : transfers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No asset transfers recorded</h3>
            <p className="text-sm text-slate-500">Asset transfers can be performed from an asset's detail page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/60">
                  <th className="py-3.5 px-4">Transfer #</th>
                  <th className="py-3.5 px-4">Asset Code & Name</th>
                  <th className="py-3.5 px-4">From Cost Center</th>
                  <th className="py-3.5 px-4">To Cost Center</th>
                  <th className="py-3.5 px-4">New Location</th>
                  <th className="py-3.5 px-4">Transfer Date</th>
                  <th className="py-3.5 px-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-sky-600">{t.transfer_number}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-indigo-600">{t.asset?.asset_number}</div>
                      <div className="font-medium text-slate-900">{t.asset?.asset_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{t.from_cost_center?.name || 'Unassigned'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{t.to_cost_center?.name || 'Unassigned'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{t.to_location || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{t.transfer_date}</td>
                    <td className="py-3.5 px-4 text-slate-600 italic">{t.reason}</td>
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
