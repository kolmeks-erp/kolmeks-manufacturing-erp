import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
} from 'lucide-react';
import { costingService, WIPRecord } from '../../../../services/costing.service';

export const WIPDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [wipList, setWipList] = useState<WIPRecord[]>([]);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [closingId, setClosingId] = useState<string | null>(null);

  const fetchWIP = async () => {
    try {
      setLoading(true);
      const res = await costingService.getWIPRecords({ search, status });
      if (res.success) {
        setWipList(res.data);
      }
    } catch (err) {
      console.error('Error fetching WIP records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWIP();
  }, [status]);

  const handleCloseWIP = async (e: React.MouseEvent, wipId: string) => {
    e.stopPropagation();
    try {
      setClosingId(wipId);
      const res = await costingService.closeWIPRecord(wipId);
      if (res.success) {
        fetchWIP();
      }
    } catch (err) {
      console.error('Error closing WIP record:', err);
    } finally {
      setClosingId(null);
    }
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getWIPStatusBadge = (st: string) => {
    switch (st) {
      case 'CLOSED':
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold rounded-full flex items-center gap-1"><Lock className="w-3 h-3"/> CLOSED</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> COMPLETED</span>;
      case 'PARTIALLY_COMPLETED':
        return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded-full flex items-center gap-1"><Clock className="w-3 h-3"/> PARTIAL</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full flex items-center gap-1"><Activity className="w-3 h-3"/> OPEN</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-amber-400" />
            Work In Progress (WIP) Tracking
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor incomplete production orders, WIP aging, material/labor/overhead absorption balances
          </p>
        </div>
        <button
          onClick={fetchWIP}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh WIP
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by WIP #, Production Order, or Product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWIP()}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-amber-500"
        >
          <option value="">All WIP Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="PARTIALLY_COMPLETED">PARTIALLY COMPLETED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      {/* WIP Master Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">WIP Reference</th>
                <th className="p-4">Production Order</th>
                <th className="p-4">Product / Item</th>
                <th className="p-4">Material WIP</th>
                <th className="p-4">Labor WIP</th>
                <th className="p-4">Overhead WIP</th>
                <th className="p-4">Total WIP Balance</th>
                <th className="p-4">WIP Age</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    Loading Work In Progress telemetry...
                  </td>
                </tr>
              ) : wipList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No active Work In Progress records found.
                  </td>
                </tr>
              ) : (
                wipList.map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => navigate(`/secure-kolmeks-x0y0/production/wip/${w.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="p-4 font-semibold text-white">{w.wip_number}</td>
                    <td className="p-4 text-amber-400 font-medium font-mono text-xs">
                      {w.production_order?.production_order_number}
                    </td>
                    <td className="p-4">
                      <div className="text-slate-200 font-medium">{w.product?.name}</div>
                      <div className="text-xs text-slate-500">{w.product?.product_code}</div>
                    </td>
                    <td className="p-4 text-slate-300">{formatCurrency(w.material_wip)}</td>
                    <td className="p-4 text-slate-300">{formatCurrency(w.labor_wip)}</td>
                    <td className="p-4 text-slate-300">{formatCurrency(w.overhead_wip)}</td>
                    <td className="p-4 text-white font-bold">{formatCurrency(w.total_wip)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded font-medium">
                        {w.age_days || 0} Days
                      </span>
                    </td>
                    <td className="p-4">{getWIPStatusBadge(w.status)}</td>
                    <td className="p-4 text-right">
                      {w.status !== 'CLOSED' && (
                        <button
                          onClick={(e) => handleCloseWIP(e, w.id)}
                          disabled={closingId === w.id}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold rounded-lg transition"
                        >
                          {closingId === w.id ? 'Closing...' : 'Close WIP'}
                        </button>
                      )}
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

export default WIPDashboardPage;
