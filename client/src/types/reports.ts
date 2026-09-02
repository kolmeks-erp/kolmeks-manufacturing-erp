export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'previous_month'
  | 'this_quarter'
  | 'this_year'
  | 'custom'
  | 'all';

export interface GlobalReportFilters {
  date_range: DateRangePreset;
  start_date?: string;
  end_date?: string;
  location_id?: string;
  department_id?: string;
  status?: string;
  customer_id?: string;
  supplier_id?: string;
  category?: string;
}

export interface ExecutiveDashboardKPIs {
  totalSales: number;
  openOrdersCount: number;
  purchaseCommitments: number;
  inventoryValue: number;
  productionOrdersCount: number;
  qualityIssuesCount: number;
  maintenanceOverdueCount: number;
  pendingApprovalsCount: number;
}

export interface SavedReport {
  id: string;
  user_id: string;
  name: string;
  report_type: string;
  filters: Record<string, any>;
  grouping?: string;
  sorting?: Record<string, any>;
  visible_columns?: string[];
  is_shared: boolean;
  created_at: string;
}

export interface ReportSchedule {
  id: string;
  user_id: string;
  saved_report_id?: string;
  saved_report?: { name: string };
  report_type: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'csv' | 'excel' | 'pdf';
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
}
