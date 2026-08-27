import { apiClient } from './api';
import {
  QualityInspection,
  InspectionPlan,
  NonConformanceReport,
  QualityHold,
  QualityKPIs
} from '../types/quality';

export const qualityService = {
  // KPI Metrics
  getKPIs: async () => {
    const res = await apiClient.get<{ success: boolean; data: QualityKPIs }>('/quality/dashboard/kpis');
    return res.data;
  },

  // Inspections
  getInspections: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    result?: string;
    productId?: string;
    supplierId?: string;
  }) => {
    const res = await apiClient.get<{
      success: boolean;
      data: QualityInspection[];
      pagination: { page: number; limit: number; totalItems: number; totalPages: number };
    }>('/quality/inspections', { params });
    return res.data;
  },

  getInspectionById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: QualityInspection }>(`/quality/inspections/${id}`);
    return res.data;
  },

  createInspection: async (data: Partial<QualityInspection>) => {
    const res = await apiClient.post<{ success: boolean; data: QualityInspection; message: string }>('/quality/inspections', data);
    return res.data;
  },

  updateInspection: async (id: string, data: Partial<QualityInspection> & { results?: any[] }) => {
    const res = await apiClient.patch<{ success: boolean; data: QualityInspection; message: string }>(`/quality/inspections/${id}`, data);
    return res.data;
  },

  completeInspection: async (id: string, payload: { quantity_accepted: number; quantity_rejected: number; notes?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: QualityInspection; message: string }>(`/quality/inspections/${id}/complete`, payload);
    return res.data;
  },

  // Inspection Plans
  getInspectionPlans: async (params?: { search?: string; productId?: string; status?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: InspectionPlan[] }>('/quality/inspection-plans', { params });
    return res.data;
  },

  getInspectionPlanById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: InspectionPlan }>(`/quality/inspection-plans/${id}`);
    return res.data;
  },

  createInspectionPlan: async (data: Partial<InspectionPlan> & { items?: any[] }) => {
    const res = await apiClient.post<{ success: boolean; data: InspectionPlan; message: string }>('/quality/inspection-plans', data);
    return res.data;
  },

  // Non-Conformance Reports (NCR)
  getNCRs: async (params?: { search?: string; status?: string; severity?: string; sourceType?: string; productId?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: NonConformanceReport[] }>('/quality/ncr', { params });
    return res.data;
  },

  getNCRById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: NonConformanceReport }>(`/quality/ncr/${id}`);
    return res.data;
  },

  createNCR: async (data: Partial<NonConformanceReport>) => {
    const res = await apiClient.post<{ success: boolean; data: NonConformanceReport; message: string }>('/quality/ncr', data);
    return res.data;
  },

  updateNCR: async (id: string, data: Partial<NonConformanceReport>) => {
    const res = await apiClient.patch<{ success: boolean; data: NonConformanceReport; message: string }>(`/quality/ncr/${id}`, data);
    return res.data;
  },

  closeNCR: async (id: string, payload: { root_cause: string; corrective_action: string; preventive_action?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: NonConformanceReport; message: string }>(`/quality/ncr/${id}/close`, payload);
    return res.data;
  },

  // Quality Holds
  getQualityHolds: async (params?: { search?: string; status?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: QualityHold[] }>('/quality/holds', { params });
    return res.data;
  },

  createQualityHold: async (data: Partial<QualityHold>) => {
    const res = await apiClient.post<{ success: boolean; data: QualityHold; message: string }>('/quality/holds', data);
    return res.data;
  },

  releaseQualityHold: async (id: string, payload: { release_quantity: number; notes?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: QualityHold; message: string }>(`/quality/holds/${id}/release`, payload);
    return res.data;
  }
};
