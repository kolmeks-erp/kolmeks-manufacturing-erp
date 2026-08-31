import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, RefreshCw, Lock, Layers, Calendar, CheckCircle2 } from 'lucide-react';
import { costingService, WIPRecord } from '../../../../services/costing.service';

export const WIPDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [wip, setWip] = useState<WIPRecord | null>(null);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await costingService.getWIPRecords();
      if (res.success) {
        const found = (res.data || []).find((w: WIPRecord) => w.id === id);
        setWip(found || null);
      }
    } catch (err) {
      console.error('Error fetching WIP detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading WIP details...</div>;
  }

  if (!wip) {
    return <div className="p-8 text-center text-slate-400">WIP Record not found.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/secure-kolmeks-x0y0/production/wip')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to WIP Records
      </button>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{wip.wip_number}</h1>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full">
              {wip.status}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Production Order:{' '}
            <span className="text-white font-mono">{wip.production_order?.production_order_number}</span>
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Total WIP Value</div>
          <div className="text-3xl font-bold text-white">{formatCurrency(wip.total_wip)}</div>
        </div>
      </div>

      {/* Cost Split Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-sm font-semibold text-blue-400 uppercase">Material WIP</div>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(wip.material_wip)}</div>
          <div className="text-xs text-slate-500 mt-1">Uncompleted Raw Materials</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-sm font-semibold text-emerald-400 uppercase">Labor WIP</div>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(wip.labor_wip)}</div>
          <div className="text-xs text-slate-500 mt-1">Incurred Operation Hours</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-sm font-semibold text-purple-400 uppercase">Overhead WIP</div>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(wip.overhead_wip)}</div>
          <div className="text-xs text-slate-500 mt-1">Allocated Factory Overhead</div>
        </div>
      </div>
    </div>
  );
};

export default WIPDetailPage;
