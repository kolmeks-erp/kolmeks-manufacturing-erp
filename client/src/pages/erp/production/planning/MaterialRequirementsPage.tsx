import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PackageCheck,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ERPLayout } from '../../../../layouts/ERPLayout';
import ERPPageHeader from '../../../../components/erp/ERPPageHeader';
import StatusBadge from '../../../../components/erp/StatusBadge';
import LoadingState from '../../../../components/erp/LoadingState';
import ErrorState from '../../../../components/erp/ErrorState';
import EmptyState from '../../../../components/erp/EmptyState';
import { planningService, MaterialRequirement } from '../../../../services/planning.service';

const MaterialRequirementsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan_id') || undefined;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<MaterialRequirement[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await planningService.getMaterialRequirements({
        plan_id: planId,
      });
      if (res.success) {
        setMaterials(res.data || []);
      } else {
        setError(res.message || 'Failed to load material requirements.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error executing material requirement explosion.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [planId]);

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.component_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.component_code?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? m.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalShortages = materials.filter((m) => m.status === 'SHORTAGE' || m.status === 'PARTIAL').length;

  return (
    <ERPLayout>
      <div className="space-y-6">
        <ERPPageHeader
          title="Material Requirements Planning (MRP)"
          subtitle="BOM component requirement explosion, live stock availability comparison, and shortage detection"
          actions={
            <button
              onClick={fetchMaterials}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <RefreshCw size={14} /> Recalculate Requirements
            </button>
          }
        />

        {/* Shortage Warning Banner */}
        {totalShortages > 0 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-amber-400 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle size={18} />
              <span>
                Shortage Warning: {totalShortages} raw material component(s) have insufficient stock for planned production orders.
              </span>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded font-mono">
              Action Required
            </span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by raw material component name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Stock Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="SHORTAGE">SHORTAGE</option>
              <option value="UNKNOWN">UNKNOWN</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState message="Executing BOM Explosion and Stock Balance Check..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchMaterials} />
        ) : filteredMaterials.length === 0 ? (
          <EmptyState
            title="No Material Requirements Found"
            description="Ensure that planned production orders have active BOMs configured for component calculation."
          />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Component Code</th>
                    <th className="px-4 py-3">Component Name</th>
                    <th className="px-4 py-3 text-right">Gross Requirement</th>
                    <th className="px-4 py-3 text-right">On-Hand Stock</th>
                    <th className="px-4 py-3 text-right">Reserved Stock</th>
                    <th className="px-4 py-3 text-right">Available Stock</th>
                    <th className="px-4 py-3 text-right">Shortage</th>
                    <th className="px-4 py-3 text-center">Material Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredMaterials.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono text-blue-400 font-semibold">{item.component_code}</td>
                      <td className="px-4 py-3 font-medium text-slate-100">{item.component_name}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-100">
                        {item.gross_requirement} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">{item.on_hand_quantity}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">{item.reserved_quantity}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{item.available_quantity}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        {item.shortage_quantity > 0 ? (
                          <span className="text-rose-400">-{item.shortage_quantity}</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.status === 'AVAILABLE' && (
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-semibold text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 size={12} /> AVAILABLE
                          </span>
                        )}
                        {item.status === 'PARTIAL' && (
                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-semibold text-[11px] inline-flex items-center gap-1">
                            <AlertTriangle size={12} /> PARTIAL
                          </span>
                        )}
                        {item.status === 'SHORTAGE' && (
                          <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full font-semibold text-[11px] inline-flex items-center gap-1">
                            <AlertTriangle size={12} /> SHORTAGE
                          </span>
                        )}
                        {item.status === 'UNKNOWN' && (
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full font-semibold text-[11px] inline-flex items-center gap-1">
                            <HelpCircle size={12} /> UNKNOWN
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ERPLayout>
  );
};

export default MaterialRequirementsPage;
