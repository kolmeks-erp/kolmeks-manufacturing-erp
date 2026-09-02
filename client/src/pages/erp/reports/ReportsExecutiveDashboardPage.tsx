import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  Truck,
  Boxes,
  Factory,
  ShieldCheck,
  Wrench,
  CheckSquare,
  Download
} from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { GlobalReportFilterBar } from '../../../components/reports/GlobalReportFilterBar';
import { KPICard } from '../../../components/reports/KPICard';
import { GlobalReportFilters, ExecutiveDashboardKPIs } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const ReportsExecutiveDashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<GlobalReportFilters>({
    date_range: 'this_month'
  });
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<ExecutiveDashboardKPIs | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getExecutiveDashboard(filters);
      setKpis(data);
    } catch (err) {
      console.error('Failed to load executive dashboard KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filters]);

  const handleExport = () => {
    if (!kpis) return;
    const headers = ['KPI Metric', 'Current Value'];
    const rows = [
      ['Total Sales Revenue (₹)', kpis.totalSales.toFixed(2)],
      ['Open Customer Orders', kpis.openOrdersCount],
      ['Purchase Commitments (₹)', kpis.purchaseCommitments.toFixed(2)],
      ['Total Inventory Valuation (₹)', kpis.inventoryValue.toFixed(2)],
      ['Active Production Orders', kpis.productionOrdersCount],
      ['Quality Issues / Failed Inspections', kpis.qualityIssuesCount],
      ['Overdue Maintenance Orders', kpis.maintenanceOverdueCount],
      ['Pending Workflow Approvals', kpis.pendingApprovalsCount]
    ];
    reportsService.exportToCSV('Executive_ERP_KPI_Report', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <BarChart3 className="w-7 h-7 text-blue-400" />
            <span>Executive ERP Performance Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time cross-functional metrics across sales, procurement, inventory, manufacturing, quality, and finances.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Executive Summary</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <ReportsNavigationHeader />

      {/* Global Filter Bar */}
      <GlobalReportFilterBar filters={filters} onChange={setFilters} onRefresh={fetchDashboard} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Sales Revenue"
          value={loading ? '...' : `₹${(kpis?.totalSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Realized sales orders in period"
          icon={DollarSign}
          color="emerald"
          drillDownUrl={`${ERP_BASE_PATH}/reports/sales`}
        />

        <KPICard
          title="Open Customer Orders"
          value={loading ? '...' : kpis?.openOrdersCount || 0}
          subtitle="Orders awaiting fulfillment"
          icon={ShoppingCart}
          color="blue"
          drillDownUrl={`${ERP_BASE_PATH}/reports/sales`}
        />

        <KPICard
          title="Purchase Commitments"
          value={loading ? '...' : `₹${(kpis?.purchaseCommitments || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Committed PO vendor spend"
          icon={Truck}
          color="indigo"
          drillDownUrl={`${ERP_BASE_PATH}/reports/procurement`}
        />

        <KPICard
          title="Total Inventory Valuation"
          value={loading ? '...' : `₹${(kpis?.inventoryValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="On-hand warehouse stock value"
          icon={Boxes}
          color="purple"
          drillDownUrl={`${ERP_BASE_PATH}/reports/inventory`}
        />

        <KPICard
          title="Active Production Orders"
          value={loading ? '...' : kpis?.productionOrdersCount || 0}
          subtitle="Orders in progress on shop floor"
          icon={Factory}
          color="amber"
          drillDownUrl={`${ERP_BASE_PATH}/reports/production`}
        />

        <KPICard
          title="Quality Issues / NCRs"
          value={loading ? '...' : kpis?.qualityIssuesCount || 0}
          subtitle="Failed inspections / open NCRs"
          icon={ShieldCheck}
          color="rose"
          drillDownUrl={`${ERP_BASE_PATH}/reports/quality`}
        />

        <KPICard
          title="Overdue Maintenance"
          value={loading ? '...' : kpis?.maintenanceOverdueCount || 0}
          subtitle="Equipment work orders past due"
          icon={Wrench}
          color="rose"
          drillDownUrl={`${ERP_BASE_PATH}/reports/maintenance`}
        />

        <KPICard
          title="Pending Approvals"
          value={loading ? '...' : kpis?.pendingApprovalsCount || 0}
          subtitle="Workflow tasks awaiting decision"
          icon={CheckSquare}
          color="cyan"
          drillDownUrl={`${ERP_BASE_PATH}/reports/workflows`}
        />
      </div>
    </div>
  );
};
