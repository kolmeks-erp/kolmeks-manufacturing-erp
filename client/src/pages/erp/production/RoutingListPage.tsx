import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitFork, Plus, Search, Eye, CheckCircle2 } from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { productionService } from '../../../services/production.service';
import { Routing } from '../../../types/production';

export const RoutingListPage: React.FC = () => {
  const navigate = useNavigate();
  const [routings, setRoutings] = useState<Routing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchRoutings();
  }, [search]);

  const fetchRoutings = async () => {
    try {
      setLoading(true);
      const data = await productionService.getRoutings({ search });
      setRoutings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
            <GitFork className="w-3.5 h-3.5" />
            <span>Process Engineering</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manufacturing Routings</h1>
          <p className="text-slate-400 text-sm">Sequence of work center operations, setup times, and machine routings.</p>
        </div>

        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/production/routings/new`)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Routing Definition</span>
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-4 rounded-2xl flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by routing number or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Routing Number</th>
                <th className="px-5 py-4">Product Master</th>
                <th className="px-5 py-4">Version</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    Loading routings...
                  </td>
                </tr>
              ) : routings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    No manufacturing routings found.
                  </td>
                </tr>
              ) : (
                routings.map((rtg) => (
                  <tr key={rtg.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-cyan-400">{rtg.routing_number}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{rtg.product?.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{rtg.product?.product_code}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">{rtg.version}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {rtg.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/production/routings/${rtg.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
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
