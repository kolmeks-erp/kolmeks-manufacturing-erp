import api from './api';
import {
  CostCenter,
  Budget,
  BudgetTelemetry,
  BudgetVarianceReport,
  ManagementBudgetReportEntry,
} from '../types/budgeting';

export const budgetingService = {
  // Cost Centers
  getCostCenters: async (params?: { search?: string; is_active?: boolean }) => {
    const response = await api.get<{ success: boolean; data: CostCenter[] }>('/finance/cost-centers', { params });
    return response.data;
  },

  getCostCenterById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: CostCenter }>(`/finance/cost-centers/${id}`);
    return response.data;
  },

  createCostCenter: async (payload: Partial<CostCenter>) => {
    const response = await api.post<{ success: boolean; message: string; data: CostCenter }>('/finance/cost-centers', payload);
    return response.data;
  },

  updateCostCenter: async (id: string, payload: Partial<CostCenter>) => {
    const response = await api.patch<{ success: boolean; message: string; data: CostCenter }>(`/finance/cost-centers/${id}`, payload);
    return response.data;
  },

  // Budget Dashboard & Telemetry
  getBudgetSummaryKPIs: async () => {
    const response = await api.get<{ success: boolean; data: BudgetTelemetry }>('/finance/budgets/summary');
    return response.data;
  },

  // Budgets
  getBudgets: async (params?: { status?: string; period_id?: string; search?: string; owner_id?: string }) => {
    const response = await api.get<{ success: boolean; data: Budget[] }>('/finance/budgets', { params });
    return response.data;
  },

  getBudgetApprovalsQueue: async () => {
    const response = await api.get<{ success: boolean; data: Budget[] }>('/finance/budgets/approvals');
    return response.data;
  },

  getBudgetById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Budget }>(`/finance/budgets/${id}`);
    return response.data;
  },

  createBudget: async (payload: Partial<Budget>) => {
    const response = await api.post<{ success: boolean; message: string; data: Budget }>('/finance/budgets', payload);
    return response.data;
  },

  updateBudget: async (id: string, payload: Partial<Budget>) => {
    const response = await api.patch<{ success: boolean; message: string; data: Budget }>(`/finance/budgets/${id}`, payload);
    return response.data;
  },

  submitBudget: async (id: string) => {
    const response = await api.post<{ success: boolean; message: string; data: Budget }>(`/finance/budgets/${id}/submit`);
    return response.data;
  },

  approveBudget: async (id: string) => {
    const response = await api.post<{ success: boolean; message: string; data: Budget }>(`/finance/budgets/${id}/approve`);
    return response.data;
  },

  rejectBudget: async (id: string, rejection_reason: string) => {
    const response = await api.post<{ success: boolean; message: string; data: Budget }>(`/finance/budgets/${id}/reject`, { rejection_reason });
    return response.data;
  },

  lockBudget: async (id: string) => {
    const response = await api.post<{ success: boolean; message: string; data: Budget }>(`/finance/budgets/${id}/lock`);
    return response.data;
  },

  archiveBudget: async (id: string) => {
    const response = await api.post<{ success: boolean; message: string; data: Budget }>(`/finance/budgets/${id}/archive`);
    return response.data;
  },

  createBudgetVersion: async (id: string) => {
    const response = await api.post<{ success: boolean; message: string; data: Budget }>(`/finance/budgets/${id}/version`);
    return response.data;
  },

  // Variance & Reports
  getBudgetVariance: async (id: string) => {
    const response = await api.get<{ success: boolean; data: BudgetVarianceReport }>(`/finance/budgets/${id}/variance`);
    return response.data;
  },

  getBudgetVersions: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Budget[] }>(`/finance/budgets/${id}/versions`);
    return response.data;
  },

  getManagementBudgetReport: async (params?: { period_id?: string; cost_center_id?: string; account_type?: string }) => {
    const response = await api.get<{ success: boolean; data: ManagementBudgetReportEntry[] }>('/finance/budget-vs-actual', { params });
    return response.data;
  },
};
