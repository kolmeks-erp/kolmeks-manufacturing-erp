import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RefreshCw, Server, AlertTriangle, ArrowRight, ShieldAlert, Wrench, Package, Receipt } from 'lucide-react';

import { DashboardKPIGrid } from '../../components/erp/dashboard/DashboardKPIGrid';
import { RecentRFQsTable, RFQRecord } from '../../components/erp/dashboard/RecentRFQsTable';
import { RecentActivity } from '../../components/erp/dashboard/RecentActivity';
import { QuickActions } from '../../components/erp/dashboard/QuickActions';
import { DashboardCharts } from '../../components/erp/dashboard/DashboardCharts';
import { ErrorState } from '../../components/erp/ErrorState';
import { ERP_BASE_PATH } from '../../constants/navigation';

interface DashboardSummaryResponse {
  success: boolean;
  authenticatedUser: string;
  userRole: string;
  metrics: {
    totalRfqs: number;
    newRfqs: number;
    activeQuotations: number;
    openSalesOrders: number;
    lowStockItems: number;
    productionOrders: number;
    qualityIssues: number;
    machinesAttention: number;
    pendingPurchaseOrders: number;
  };
  recentRfqs: RFQRecord[];
}

export const ERPDashboardPage: React.FC = () => {
  // Query ERP dashboard summary telemetry
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    refetch,
  } = useQuery<DashboardSummaryResponse>({
    queryKey: ['erpDashboardSummary'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardSummaryResponse>('/erp/dashboard-summary');
      return response.data;
    },
    refetchInterval: 30000,
  });

  const metrics = dashboardData?.metrics;

  const attentionItems = [
    {
      label: 'Low Stock Alerts',
      count: metrics?.lowStockItems || 0,
      description: 'Items below reorder point threshold',
      route: `${ERP_BASE_PATH}/inventory`,
      icon: Package,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    },
    {
      label: 'Pending PO Approvals',
      count: metrics?.pendingPurchaseOrders || 0,
      description: 'Purchase orders awaiting authorization',
      route: `${ERP_BASE_PATH}/procurement/orders`,
      icon: Receipt,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    },
    {
      label: 'Open Quality NCRs',
      count: metrics?.qualityIssues || 0,
      description: 'Non-conformance reports needing resolution',
      route: `${ERP_BASE_PATH}/quality/inspections`,
      icon: ShieldAlert,
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    },
    {
      label: 'Overdue Maintenance',
      count: metrics?.machinesAttention || 0,
      description: 'Equipment PM work orders flagged',
      route: `${ERP_BASE_PATH}/maintenance/work-orders`,
      icon: Wrench,
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* PAGE HEADER */}
      <PageHeader
        title="Executive Manufacturing Dashboard"
        description="Real-time telemetry, live RFQ pipeline metrics, and operational module controls."
        badge="ERP Shell & Dashboard"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Telemetry
          </Button>
        }
      />

      {/* DASHBOARD SUMMARY ERROR BOUNDARY */}
      {isDashboardError && (
        <ErrorState
          title="Telemetry Data Connection Alert"
          message="Unable to communicate with the Express ERP API backend. Please verify your authentication session and backend server status."
          onRetry={() => refetch()}
        />
      )}

      {/* 1. KPI METRICS GRID */}
      <section>
        <DashboardKPIGrid metrics={dashboardData?.metrics} isLoading={isDashboardLoading} />
      </section>

      {/* 2. NEEDS ATTENTION / CRITICAL EXCEPTIONS AREA */}
      <section className="bg-white dark:bg-[#0F2647] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Operational Needs Attention</h3>
          </div>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-400 uppercase">Live Exception Queue</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {attentionItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.route}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {item.label}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded-full ${item.badgeColor}`}>
                    {item.count}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mb-3">{item.description}</p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. RECENT RFQS TABLE & RECENT ACTIVITY SIDE-BY-SIDE */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentRFQsTable rfqs={dashboardData?.recentRfqs || []} isLoading={isDashboardLoading} />
        </div>
        <div>
          <RecentActivity rfqs={dashboardData?.recentRfqs || []} isLoading={isDashboardLoading} />
        </div>
      </section>

      {/* 4. EXECUTIVE QUICK ACTIONS */}
      <section>
        <QuickActions />
      </section>

      {/* 5. DASHBOARD CHARTS & ANALYTICS */}
      <section>
        <DashboardCharts />
      </section>

      {/* 6. BACKEND & SUPABASE TELEMETRY CARD */}
      <Card variant="industrial">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>Express & Supabase System Status</CardTitle>
          </div>
          <Badge variant={dashboardData ? 'success' : 'warning'}>
            {isDashboardLoading ? 'Checking...' : dashboardData ? 'Online' : 'Offline'}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Active Staff User</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{dashboardData?.authenticatedUser || 'Staff'}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Assigned Security Role</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">{dashboardData?.userRole || 'Staff'}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Database Engine</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Supabase PostgreSQL</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">ERP Route</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">/secure-kolmeks-x0y0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
