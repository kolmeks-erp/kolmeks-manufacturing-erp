import { Employee } from './employee';
import { Account } from './finance';

export type BudgetStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'LOCKED'
  | 'ARCHIVED';

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  manager_id?: string | null;
  is_active: boolean;
  parent?: { id: string; code: string; name: string };
  manager?: Employee;
  children?: CostCenter[];
  budgetLines?: BudgetLine[];
  created_at: string;
  updated_at: string;
}

export interface BudgetLine {
  id?: string;
  budget_id?: string;
  account_id: string;
  cost_center_id?: string | null;
  period_id?: string | null;
  budget_amount: number;
  notes?: string | null;
  account?: Account;
  cost_center?: CostCenter;
}

export interface Budget {
  id: string;
  budget_code: string;
  budget_name: string;
  period_id: string;
  version: number;
  currency: string;
  status: BudgetStatus;
  description?: string | null;
  total_budget_amount: number;
  owner_id?: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  locked_at?: string | null;
  parent_version_id?: string | null;
  period?: { id: string; period_name: string; start_date: string; end_date: string };
  owner?: Employee;
  lines?: BudgetLine[];
  created_at: string;
  updated_at: string;
}

export interface BudgetTelemetry {
  totalApprovedBudget: number;
  totalActualSpend: number;
  remainingBudget: number;
  overallUtilization: number;
  statusCounts: {
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
    locked: number;
  };
  totalBudgetsCount: number;
}

export interface BudgetLineVariance {
  id: string;
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  cost_center?: { id: string; code: string; name: string } | null;
  budget_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_percent: number | 'N/A';
  utilization_percent: number | 'N/A';
  is_over_budget: boolean;
  is_favorable: boolean;
  status_label: string;
  notes?: string;
}

export interface BudgetVarianceReport {
  budget: {
    id: string;
    budget_code: string;
    budget_name: string;
    version: number;
    status: BudgetStatus;
    period?: { id: string; period_name: string; start_date: string; end_date: string };
  };
  summary: {
    total_budget: number;
    total_actual: number;
    total_variance: number;
    total_utilization_percent: number;
  };
  lines: BudgetLineVariance[];
}

export interface ManagementBudgetReportEntry {
  budget_code: string;
  budget_name: string;
  period_name: string;
  account_code: string;
  account_name: string;
  account_type: string;
  cost_center_name: string;
  budget_amount: number;
  actual_amount: number;
  variance_amount: number;
  utilization_percent: number;
}
