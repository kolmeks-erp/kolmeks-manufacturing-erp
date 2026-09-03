import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderTree, CheckCircle2, AlertCircle } from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { productionService } from '../../../services/production.service';
import { BOM } from '../../../types/production';

export const BOMDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bom, setBom] = useState<BOM | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activating, setActivating] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    if (id) fetchBOM();
  }, [id]);

  const fetchBOM = async () => {
    try {
      setLoading(true);
      const data = await productionService.getBOMById(id!);
      setBom(data);
    } catch (err) {
      console.error('Fetch BOM error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!bom) return;
    try {
      setActivating(true);
      const updated = await productionService.activateBOM(bom.id);
      setBom(updated);
      setMsg('BOM activated successfully.');
      fetchBOM();
    } catch (err) {
      console.error('Activate BOM error:', err);
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading BOM...</div>;
  }

  if (!bom) {
    return <div className="p-12 text-center text-slate-400">BOM not found.</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/production/boms`)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-amber-400">{bom.bom_number}</h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300">
                {bom.version}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Product: <strong className="text-white">{bom.product?.name}</strong> ({bom.product?.product_code})</p>
          </div>
        </div>

        {bom.status !== 'ACTIVE' && (
          <button
            onClick={handleActivate}
            disabled={activating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Set Active BOM</span>
          </button>
        )}
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
          {msg}
        </div>
      )}

      {/* Component Items Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
          Component Material Line Items
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Component Product</th>
                <th className="px-4 py-3 text-right">Quantity Per Unit</th>
                <th className="px-4 py-3 text-right">Scrap %</th>
                <th className="px-4 py-3">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bom.items?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-mono text-slate-500">{item.line_order}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{item.component?.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.component?.product_code}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">{item.quantity_per}</td>
                  <td className="px-4 py-3 text-right font-mono">{item.scrap_percentage}%</td>
                  <td className="px-4 py-3 text-slate-400">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
