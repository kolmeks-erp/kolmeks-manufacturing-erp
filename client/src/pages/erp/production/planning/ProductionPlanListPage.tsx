import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import ERPPageHeader from '../../../../components/erp/ERPPageHeader';
import DataTable, { Column } from '../../../../components/common/DataTable';
import StatusBadge from '../../../../components/erp/StatusBadge';
import LoadingState from '../../../../components/erp/LoadingState';
import ErrorState from '../../../../components/erp/ErrorState';
import EmptyState from '../../../../components/erp/EmptyState';
import { ERP_BASE_PATH } from '../../../../constants/navigation';
import { planningService, ProductionPlan } from '../../../../services/planning.service';

const ProductionPlanListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await planningService.getPlans({
        search,
        status: statusFilter || undefined,
      });
      if (res.success) {
        setPlans(res.data || []);
      } else {
        setError(res.message || 'Failed to load production plans.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading production plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlans();
  };

  const columns: Column<ProductionPlan>[] = [
    {
      header: 'Plan Number',
      accessor: (row: ProductionPlan) => (
        <span
          onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/plans/${row.id}`)}
          className="font-mono text-sm font-semibold text-blue-400 hover:underline cursor-pointer"
        >
          {row.plan_number}
        </span>
      ),
    },
    {
      header: 'Plan Name',
      accessor: (row: ProductionPlan) => (
        <div>
          <div className="font-medium text-slate-100">{row.plan_name}</div>
          <div className="text-xs text-slate-400">{row.period_type} Plan</div>
        </div>
      ),
    },
    {
      header: 'Planning Window',
      accessor: (row: ProductionPlan) => (
        <div className="text-xs text-slate-300 flex items-center gap-1.5">
          <Calendar size={13} className="text-slate-400" />
          {row.start_date} to {row.end_date}
        </div>
      ),
    },
    {
      header: 'Line Items',
      accessor: (row: ProductionPlan) => (
        <span className="text-xs px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
          {row.lines?.length || 0} line(s)
        </span>
      ),
    },
    {
      header: 'Created By',
      accessor: (row: ProductionPlan) => (
        <span className="text-xs text-slate-300">
          {row.created_by_profile?.full_name || 'System User'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: ProductionPlan) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row: ProductionPlan) => (
        <button
          onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/plans/${row.id}`)}
          className="px-2.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs rounded border border-blue-500/20 flex items-center gap-1 transition-colors"
        >
          <Eye size={13} /> View Plan
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Master Production Plans"
        subtitle="Manage period-based production plans, sales demand allocations, and shop floor order releases"
        actions={
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/production/planning/plans/new`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus size={16} /> Create Production Plan
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by plan number or plan name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Filter size={14} /> Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingState message="Loading production plans..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPlans} />
      ) : plans.length === 0 ? (
        <EmptyState
          title="No Production Plans Found"
          description="Create your first production plan to organize manufacturing requirements against sales order demand."
          actionText="Create Production Plan"
          onAction={() => navigate(`${ERP_BASE_PATH}/production/planning/plans/new`)}
        />
      ) : (
        <div className="bg-white dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
          <DataTable columns={columns} data={plans} />
        </div>
      )}
    </div>
  );
};

export default ProductionPlanListPage;
