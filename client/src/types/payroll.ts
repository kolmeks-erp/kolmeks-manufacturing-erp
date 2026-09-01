import { Employee } from './employee';

export type PayrollPeriodStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'PROCESSING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'POSTED'
  | 'CLOSED'
  | 'CANCELLED';

export type PayrollRunStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'POSTED'
  | 'CANCELLED';

export interface EmployeeCompensation {
  id?: string;
  employee_id: string;
  basic_salary: number;
  allowances: number;
  hourly_rate: number;
  currency: string;
  effective_date?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface PayrollPeriod {
  id: string;
  period_code: string;
  name: string;
  start_date: string;
  end_date: string;
  status: PayrollPeriodStatus;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollRun {
  id: string;
  run_number: string;
  payroll_period_id: string;
  payroll_period?: PayrollPeriod;
  run_date: string;
  total_employees: number;
  gross_payroll: number;
  total_deductions: number;
  net_payroll: number;
  status: PayrollRunStatus;
  journal_entry_id?: string;
  approved_by?: string;
  approver?: { first_name: string; last_name: string };
  approved_at?: string;
  created_at?: string;
}

export interface PayrollEntry {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  department_id?: string;
  cost_center_id?: string;
  payslip_number: string;
  basic_salary: number;
  allowances: number;
  overtime_pay: number;
  bonus: number;
  other_earnings: number;
  gross_pay: number;
  loan_deductions: number;
  unpaid_leave_deductions: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
  status: 'DRAFT' | 'APPROVED' | 'POSTED' | 'CANCELLED';
  employee?: Partial<Employee> & { department?: { name: string } };
  department?: { name: string };
  payroll_run?: { id: string; run_number: string; run_date: string; payroll_period?: PayrollPeriod };
  created_at?: string;
}

export interface PayrollDashboardKPIs {
  totalEmployees: number;
  activePeriod?: PayrollPeriod;
  totalRuns: number;
  cumulativeGross: number;
  cumulativeNet: number;
}
