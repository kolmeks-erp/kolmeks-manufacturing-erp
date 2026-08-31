import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RefreshCw, Server } from 'lucide-react';

import { DashboardKPIGrid } from '../../components/erp/dashboard/DashboardKPIGrid';
import { RecentRFQsTable, RFQRecord } from '../../components/erp/dashboard/RecentRFQsTable';
import { RecentActivity } from '../../components/erp/dashboard/RecentActivity';
import { QuickActions } from '../../components/erp/dashboard/QuickActions';
import { DashboardCharts } from '../../components/erp/dashboard/DashboardCharts';
import { ErrorState } from '../../components/erp/ErrorState';

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

      {/* 2. RECENT RFQS TABLE & RECENT ACTIVITY SIDE-BY-SIDE */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentRFQsTable rfqs={dashboardData?.recentRfqs || []} isLoading={isDashboardLoading} />
        </div>
        <div>
          <RecentActivity rfqs={dashboardData?.recentRfqs || []} isLoading={isDashboardLoading} />
        </div>
      </section>

      {/* 3. EXECUTIVE QUICK ACTIONS */}
      <section>
        <QuickActions />
      </section>

      {/* 4. DASHBOARD CHARTS & ANALYTICS */}
      <section>
        <DashboardCharts />
      </section>

      {/* 5. BACKEND & SUPABASE TELEMETRY CARD */}
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
