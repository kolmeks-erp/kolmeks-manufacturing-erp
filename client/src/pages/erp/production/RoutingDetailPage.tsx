import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitFork, Clock } from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { productionService } from '../../../services/production.service';
import { Routing } from '../../../types/production';

export const RoutingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [routing, setRouting] = useState<Routing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) fetchRouting();
  }, [id]);

  const fetchRouting = async () => {
    try {
      setLoading(true);
      const data = await productionService.getRoutingById(id!);
      setRouting(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading Routing...</div>;
  if (!routing) return <div className="p-12 text-center text-slate-400">Routing not found.</div>;

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/production/routings`)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-cyan-400">{routing.routing_number}</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300">{routing.version}</span>
          </div>
          <p className="text-slate-400 text-sm">Product: <strong className="text-white">{routing.product?.name}</strong> ({routing.product?.product_code})</p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
          Operations Sequence
        </h3>

        <div className="space-y-3">
          {routing.operations?.map((op) => (
            <div key={op.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                  {op.sequence}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{op.operation_name}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Work Center: <strong className="text-slate-200">{op.work_center?.name || 'Any'}</strong> | Machine: <strong className="text-slate-200">{op.machine?.name || 'Any'}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>Setup: <span className="text-amber-400">{op.setup_time_mins} min</span></div>
                <div>Run: <span className="text-indigo-400">{op.run_time_mins} min</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
