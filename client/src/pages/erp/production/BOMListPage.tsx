import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { productionService } from '../../../services/production.service';
import { BOM } from '../../../types/production';

export const BOMListPage: React.FC = () => {
  const navigate = useNavigate();
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchBOMs();
  }, [search, statusFilter]);

  const fetchBOMs = async () => {
    try {
      setLoading(true);
      const data = await productionService.getBOMs({ search, status: statusFilter });
      setBoms(data);
    } catch (err) {
      console.error('Failed to fetch BOMs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Product Master Structures</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bills of Materials (BOM)</h1>
          <p className="text-slate-400 text-sm">Manage component structures, raw materials, and version controls.</p>
        </div>

        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/production/boms/new`)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-all shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New BOM Definition</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by BOM number or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DRAFT">DRAFT</option>
            <option value="OBSOLETE">OBSOLETE</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">BOM Number</th>
                <th className="px-5 py-4">Product Master</th>
                <th className="px-5 py-4">Version</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created Date</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    Loading BOM definitions...
                  </td>
                </tr>
              ) : boms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    No Bill of Materials found.
                  </td>
                </tr>
              ) : (
                boms.map((bom) => (
                  <tr key={bom.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-amber-400">{bom.bom_number}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{bom.product?.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{bom.product?.product_code}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">{bom.version}</td>
                    <td className="px-5 py-4">
                      {bom.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          {bom.status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {new Date(bom.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/production/boms/${bom.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
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
