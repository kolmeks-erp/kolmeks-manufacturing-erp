import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Wrench, Eye, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import EmptyState from '../../../components/erp/EmptyState';
import Pagination from '../../../components/erp/Pagination';
import { maintenanceService } from '../../../services/maintenance.service';
import { WorkOrder, WorkOrderStatus, Priority } from '../../../types/maintenance';

const WorkOrderListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await maintenanceService.getWorkOrders({
        page,
        limit: 15,
        search,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        type: typeFilter || undefined
      });
      setWorkOrders(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load maintenance work orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [page, statusFilter, priorityFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchWorkOrders();
  };

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">COMPLETED</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse whitespace-nowrap">IN PROGRESS</span>;
      case 'ASSIGNED':
      case 'OPEN':
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">OPEN</span>;
      case 'ON_HOLD':
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">ON HOLD</span>;
      case 'CANCELLED':
      default:
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">{status.replace(/_/g, ' ')}</span>;
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'URGENT':
        return <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg whitespace-nowrap">URGENT</span>;
      case 'HIGH':
        return <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg whitespace-nowrap">HIGH</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg whitespace-nowrap">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg whitespace-nowrap">LOW</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      {/* Modern Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 shrink-0">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Work Orders</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage preventive routines, corrective breakdown tasks, checklists & spare consumption
            </p>
          </div>
        </div>
        <Link
          to="/secure-kolmeks-x0y0/maintenance/work-orders/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Work Order
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search WO number, Title, Asset, Technician..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="w-40">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="w-36">
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priority</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="w-40">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="PREVENTIVE">Preventive</option>
              <option value="CORRECTIVE">Corrective</option>
              <option value="INSPECTION">Inspection</option>
              <option value="CALIBRATION">Calibration</option>
              <option value="LUBRICATION">Lubrication</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Work Orders Table */}
      {loading ? (
        <LoadingState message="Loading work orders..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchWorkOrders} />
      ) : workOrders.length === 0 ? (
        <EmptyState
          title="No maintenance work orders found"
          description="Create a work order for preventive maintenance or breakdown repair."
          actionText="Create Work Order"
          onAction={() => window.location.href = '/secure-kolmeks-x0y0/maintenance/work-orders/new'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs whitespace-nowrap">
                <tr>
                  <th className="py-3.5 px-4">WO Number</th>
                  <th className="py-3.5 px-4">Asset</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Task / Title</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {wo.work_order_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {wo.assets?.name || 'N/A'}
                      <p className="text-xs text-slate-400 font-mono">{wo.assets?.asset_code}</p>
                    </td>
                    <td className="py-3 px-4 text-xs uppercase font-semibold text-slate-600 whitespace-nowrap">
                      {wo.maintenance_type}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <Link to={`/secure-kolmeks-x0y0/maintenance/work-orders/${wo.id}`} className="hover:text-indigo-600">
                        {wo.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getPriorityBadge(wo.priority)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {wo.assigned_profile ? `${wo.assigned_profile.first_name || ''} ${wo.assigned_profile.last_name || ''}` : 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(wo.status)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/secure-kolmeks-x0y0/maintenance/work-orders/${wo.id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                      >
                        Manage Execution
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderListPage;
