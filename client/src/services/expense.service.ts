import apiClient from './api';

export interface ExpenseCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  default_account_id?: string;
  is_active: boolean;
  default_account?: {
    id: string;
    account_code: string;
    account_name: string;
    account_type?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseItem {
  id?: string;
  claim_id?: string;
  expense_date: string;
  category_id?: string;
  description: string;
  amount: number;
  currency?: string;
  cost_center_id?: string;
  account_id?: string;
  receipt_url?: string;
  receipt_public_id?: string;
  notes?: string;
  is_approved?: boolean;
  approved_amount?: number;
  category?: ExpenseCategory;
  cost_center?: { id: string; code: string; name: string };
  account?: { id: string; account_code: string; account_name: string };
}

export type ExpenseClaimStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'MANAGER_REVIEW'
  | 'FINANCE_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'REIMBURSEMENT_PENDING'
  | 'PARTIALLY_REIMBURSED'
  | 'REIMBURSED'
  | 'CANCELLED';

export interface ExpenseClaim {
  id: string;
  claim_number: string;
  employee_id: string;
  claim_date: string;
  description: string;
  currency: string;
  total_amount: number;
  approved_amount: number;
  reimbursed_amount: number;
  outstanding_amount: number;
  cost_center_id?: string;
  budget_id?: string;
  status: ExpenseClaimStatus;
  submitted_at?: string;
  submitted_by?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  returned_at?: string;
  returned_by?: string;
  return_reason?: string;
  journal_entry_id?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_code?: string;
    department?: string;
    email?: string;
  };
  cost_center?: { id: string; code: string; name: string; allocated_budget?: number };
  budget?: { id: string; name: string; fiscal_year?: string };
  journal_entry?: { id: string; entry_number: string; entry_date?: string; status?: string };
  items?: ExpenseItem[];
  reimbursements?: Reimbursement[];
  audit_logs?: ExpenseAuditLog[];
  created_at?: string;
  updated_at?: string;
}

export interface Reimbursement {
  id: string;
  reimbursement_number: string;
  claim_id: string;
  employee_id: string;
  reimbursement_date: string;
  amount: number;
  payment_method: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'OTHER';
  reference_number?: string;
  status: 'POSTED' | 'VOIDED';
  notes?: string;
  journal_entry_id?: string;
  voided_at?: string;
  voided_by?: string;
  void_reason?: string;
  claim?: Partial<ExpenseClaim>;
  employee?: { id: string; first_name: string; last_name: string; employee_code?: string; department?: string };
  journal_entry?: { id: string; entry_number: string; status?: string };
  created_at?: string;
}

export interface ExpenseAuditLog {
  id: string;
  claim_id: string;
  reimbursement_id?: string;
  action: string;
  performed_by: string;
  details?: any;
  created_at: string;
}

export interface ExpenseDashboardKPIs {
  total_claims_count: number;
  pending_review_count: number;
  approved_count: number;
  total_approved_amount: number;
  total_reimbursed_amount: number;
  total_outstanding_amount: number;
  draft_count: number;
  rejected_count: number;
}

export interface ExpenseReportsSummary {
  by_employee: {
    employee_id: string;
    employee_name: string;
    department: string;
    total_claims: number;
    total_submitted: number;
    total_approved: number;
    total_reimbursed: number;
    total_outstanding: number;
  }[];
  by_category: {
    code: string;
    name: string;
    items_count: number;
    total_amount: number;
    approved_amount: number;
  }[];
  by_cost_center: {
    cost_center_id: string;
    cost_center_name: string;
    allocated_budget: number;
    approved_expense: number;
    outstanding_reimbursement: number;
  }[];
}

export interface CreateClaimPayload {
  employee_id?: string;
  claim_date: string;
  description: string;
  cost_center_id?: string;
  budget_id?: string;
  items: ExpenseItem[];
  submit_immediately?: boolean;
}

export interface CreateReimbursementPayload {
  claim_id: string;
  reimbursement_date?: string;
  amount: number;
  payment_method?: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'OTHER';
  reference_number?: string;
  notes?: string;
}

export const expenseService = {
  // Categories
  getCategories: async (include_inactive = false): Promise<ExpenseCategory[]> => {
    const res = await apiClient.get<{ success: boolean; data: ExpenseCategory[] }>('/finance/expense-categories', {
      params: { include_inactive },
    });
    return res.data.data;
  },

  createCategory: async (payload: { code: string; name: string; description?: string; default_account_id?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: ExpenseCategory; message: string }>('/finance/expense-categories', payload);
    return res.data;
  },

  updateCategory: async (id: string, payload: Partial<ExpenseCategory>) => {
    const res = await apiClient.patch<{ success: boolean; data: ExpenseCategory; message: string }>(`/finance/expense-categories/${id}`, payload);
    return res.data;
  },

  // Receipt Upload
  uploadReceipt: async (file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    const res = await apiClient.post<{
      success: boolean;
      data: { receipt_url: string; receipt_public_id: string; original_name: string };
      message: string;
    }>('/finance/expenses/upload-receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  // Claims
  getClaims: async (params?: {
    employee_id?: string;
    cost_center_id?: string;
    status?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ExpenseClaim[]> => {
    const res = await apiClient.get<{ success: boolean; data: ExpenseClaim[] }>('/finance/expenses', { params });
    return res.data.data;
  },

  getMyClaims: async (): Promise<ExpenseClaim[]> => {
    const res = await apiClient.get<{ success: boolean; data: ExpenseClaim[] }>('/finance/expenses/my');
    return res.data.data;
  },

  getClaimById: async (id: string): Promise<ExpenseClaim> => {
    const res = await apiClient.get<{ success: boolean; data: ExpenseClaim }>(`/finance/expenses/${id}`);
    return res.data.data;
  },

  createClaim: async (payload: CreateClaimPayload) => {
    const res = await apiClient.post<{ success: boolean; data: ExpenseClaim; message: string }>('/finance/expenses', payload);
    return res.data;
  },

  updateClaim: async (id: string, payload: Partial<CreateClaimPayload>) => {
    const res = await apiClient.put<{ success: boolean; data: ExpenseClaim; message: string }>(`/finance/expenses/${id}`, payload);
    return res.data;
  },

  submitClaim: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: ExpenseClaim; message: string }>(`/finance/expenses/${id}/submit`);
    return res.data;
  },

  approveClaim: async (
    id: string,
    payload?: { items_approval?: { item_id: string; is_approved: boolean; approved_amount: number }[] }
  ) => {
    const res = await apiClient.post<{
      success: boolean;
      data: ExpenseClaim;
      journal_entry?: any;
      budget_warning?: string;
      message: string;
    }>(`/finance/expenses/${id}/approve`, payload || {});
    return res.data;
  },

  rejectClaim: async (id: string, rejection_reason: string) => {
    const res = await apiClient.post<{ success: boolean; data: ExpenseClaim; message: string }>(`/finance/expenses/${id}/reject`, {
      rejection_reason,
    });
    return res.data;
  },

  returnClaim: async (id: string, return_reason: string) => {
    const res = await apiClient.post<{ success: boolean; data: ExpenseClaim; message: string }>(`/finance/expenses/${id}/return`, {
      return_reason,
    });
    return res.data;
  },

  // Reimbursements
  getReimbursements: async (params?: {
    claim_id?: string;
    employee_id?: string;
    status?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Reimbursement[]> => {
    const res = await apiClient.get<{ success: boolean; data: Reimbursement[] }>('/finance/reimbursements', { params });
    return res.data.data;
  },

  getReimbursementById: async (id: string): Promise<Reimbursement> => {
    const res = await apiClient.get<{ success: boolean; data: Reimbursement }>(`/finance/reimbursements/${id}`);
    return res.data.data;
  },

  createReimbursement: async (payload: CreateReimbursementPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Reimbursement; message: string }>('/finance/reimbursements', payload);
    return res.data;
  },

  voidReimbursement: async (id: string, void_reason: string) => {
    const res = await apiClient.post<{ success: boolean; data: Reimbursement; message: string }>(`/finance/reimbursements/${id}/void`, {
      void_reason,
    });
    return res.data;
  },

  // Dashboard & Reports
  getDashboardKPIs: async (): Promise<ExpenseDashboardKPIs> => {
    const res = await apiClient.get<{ success: boolean; data: ExpenseDashboardKPIs }>('/finance/expenses/dashboard/kpis');
    return res.data.data;
  },

  getReports: async (params?: { start_date?: string; end_date?: string }): Promise<ExpenseReportsSummary> => {
    const res = await apiClient.get<{ success: boolean; data: ExpenseReportsSummary }>('/finance/expenses/reports/summary', { params });
    return res.data.data;
  },
};

export default expenseService;
