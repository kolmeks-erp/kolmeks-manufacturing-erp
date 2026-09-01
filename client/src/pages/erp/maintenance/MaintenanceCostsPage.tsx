import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Wrench, Package, UserCheck, Building2, RefreshCw, BarChart2 
} from 'lucide-react';
import ERPLayout from '../../../components/erp/ERPLayout';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/erp/DataTable';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import EmptyState from '../../../components/erp/EmptyState';
import { maintenanceService } from '../../../services/maintenance.service';
import { MaintenanceCostSummary } from '../../../types/maintenance';

const MaintenanceCostsPage: React.FC = () => {
  const [costData, setCostData] = useState<MaintenanceCostSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await maintenanceService.getMaintenanceCosts();
      setCostData(res);
    } catch (err: any) {
      console.error('Failed to load maintenance costs:', err);
      setError(err.message || 'Unable to calculate maintenance cost ledgers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, []);

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  const columns = [
    {
      header: 'Work Order #',
      accessor: (row: any) => (
        <span className="font-semibold text-slate-900 font-mono text-sm">
          {row.work_order_number}
        </span>
      )
    },
    {
      header: 'Title / Asset',
      accessor: (row: any) => (
        <div>
          <div className="font-medium text-slate-900">{row.title}</div>
          <div className="text-xs text-slate-500">{row.assets?.name || 'N/A'} ({row.assets?.asset_code})</div>
        </div>
      )
    },
    {
      header: 'Labor Cost',
      accessor: (row: any) => (
        <span className="font-mono text-sm text-slate-700">{formatCurrency(row.labor_cost)}</span>
      )
    },
    {
      header: 'Spare Parts Cost',
      accessor: (row: any) => (
        <span className="font-mono text-sm text-slate-700">{formatCurrency(row.parts_cost)}</span>
      )
    },
    {
      header: 'External Service',
      accessor: (row: any) => (
        <span className="font-mono text-sm text-slate-700">{formatCurrency(row.external_service_cost)}</span>
      )
    },
    {
      header: 'Total Expense',
      accessor: (row: any) => (
        <span className="font-mono text-sm font-bold text-slate-900">{formatCurrency(row.total_cost)}</span>
      )
    }
  ];

  if (loading) return <ERPLayout><LoadingState message="Calculating maintenance expenditure & cost center ledgers..." /></ERPLayout>;
  if (error) return <ERPLayout><ErrorState message={error} onRetry={fetchCosts} /></ERPLayout>;

  return (
    <ERPLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <ERPPageHeader
          title="Maintenance Financial Costs & Ledgers"
          subtitle="Consolidated labor, spare parts, and external vendor service expenses mapped to cost centers."
          icon={DollarSign}
          actions={
            <button
              onClick={fetchCosts}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Ledger
            </button>
          }
        />

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Labor Cost</span>
              <UserCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {formatCurrency(costData?.summary.totalLabor)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Spare Parts Consumed</span>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {formatCurrency(costData?.summary.totalParts)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">External Vendor Service</span>
              <Wrench className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {formatCurrency(costData?.summary.totalService)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Maintenance Expense</span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono">
              {formatCurrency(costData?.summary.totalOverall)}
            </div>
          </div>
        </div>

        {/* Cost Table */}
        {!costData?.workOrders || costData.workOrders.length === 0 ? (
          <EmptyState
            title="No Maintenance Expense Logs Found"
            description="No work order maintenance cost items have been posted to financial ledgers."
          />
        ) : (
          <DataTable
            data={costData.workOrders}
            columns={columns}
          />
        )}
      </div>
    </ERPLayout>
  );
};

export default MaintenanceCostsPage;
