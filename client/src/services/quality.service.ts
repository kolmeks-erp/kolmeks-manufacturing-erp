import { apiClient } from './api';
import {
  QualityInspection,
  InspectionPlan,
  NonConformanceReport,
  QualityHold,
  QualityKPIs,
  QualityDefect,
  RootCauseAnalysis,
  CAPARecord,
  CAPAAction,
  SupplierQualityMetric,
  CustomerComplaint
} from '../types/quality';

export const qualityService = {
  // KPI Metrics
  getKPIs: async () => {
    const res = await apiClient.get<{ success: boolean; data: QualityKPIs }>('/quality/dashboard/kpis');
    return res.data;
  },

  // Defects Catalog
  getDefects: async (params?: { category?: string; search?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: QualityDefect[] }>('/quality/defects', { params });
    return res.data;
  },

  createDefect: async (data: Partial<QualityDefect>) => {
    const res = await apiClient.post<{ success: boolean; data: QualityDefect; message: string }>('/quality/defects', data);
    return res.data;
  },

  updateDefect: async (id: string, data: Partial<QualityDefect>) => {
    const res = await apiClient.put<{ success: boolean; data: QualityDefect; message: string }>(`/quality/defects/${id}`, data);
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

  // Non-Conformance Reports (NCR) & Root Cause Analysis
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

  saveNCRRootCause: async (ncrId: string, payload: Partial<RootCauseAnalysis>) => {
    const res = await apiClient.post<{ success: boolean; data: RootCauseAnalysis; message: string }>(`/quality/ncr/${ncrId}/root-cause`, payload);
    return res.data;
  },

  closeNCR: async (id: string, payload: { root_cause: string; corrective_action: string; preventive_action?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: NonConformanceReport; message: string }>(`/quality/ncr/${id}/close`, payload);
    return res.data;
  },

  // CAPA Management
  getCAPAs: async (params?: { search?: string; status?: string; priority?: string; sourceType?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: CAPARecord[] }>('/quality/capa', { params });
    return res.data;
  },

  getCAPAById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: CAPARecord }>(`/quality/capa/${id}`);
    return res.data;
  },

  createCAPA: async (data: Partial<CAPARecord> & { actions?: Partial<CAPAAction>[] }) => {
    const res = await apiClient.post<{ success: boolean; data: CAPARecord; message: string }>('/quality/capa', data);
    return res.data;
  },

  updateCAPA: async (id: string, data: Partial<CAPARecord>) => {
    const res = await apiClient.patch<{ success: boolean; data: CAPARecord; message: string }>(`/quality/capa/${id}`, data);
    return res.data;
  },

  addCAPAAction: async (capaId: string, payload: Partial<CAPAAction>) => {
    const res = await apiClient.post<{ success: boolean; data: CAPAAction; message: string }>(`/quality/capa/${capaId}/actions`, payload);
    return res.data;
  },

  updateCAPAAction: async (actionId: string, payload: Partial<CAPAAction>) => {
    const res = await apiClient.patch<{ success: boolean; data: CAPAAction; message: string }>(`/quality/capa/actions/${actionId}`, payload);
    return res.data;
  },

  verifyCAPA: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: CAPARecord; message: string }>(`/quality/capa/${id}/verify`);
    return res.data;
  },

  closeCAPA: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: CAPARecord; message: string }>(`/quality/capa/${id}/close`);
    return res.data;
  },

  // Quality Holds & Quarantine
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
  },

  scrapQualityHold: async (id: string, payload: { scrap_quantity: number; notes?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: QualityHold; message: string }>(`/quality/holds/${id}/scrap`, payload);
    return res.data;
  },

  // Supplier Quality Performance
  getSupplierPerformance: async () => {
    const res = await apiClient.get<{ success: boolean; data: SupplierQualityMetric[] }>('/quality/suppliers/performance');
    return res.data;
  },

  // Customer Complaints
  getCustomerComplaints: async (params?: { search?: string; status?: string; severity?: string; customerId?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: CustomerComplaint[] }>('/quality/complaints', { params });
    return res.data;
  },

  getCustomerComplaintById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: CustomerComplaint }>(`/quality/complaints/${id}`);
    return res.data;
  },

  createCustomerComplaint: async (data: Partial<CustomerComplaint>) => {
    const res = await apiClient.post<{ success: boolean; data: CustomerComplaint; message: string }>('/quality/complaints', data);
    return res.data;
  },

  updateCustomerComplaint: async (id: string, data: Partial<CustomerComplaint>) => {
    const res = await apiClient.patch<{ success: boolean; data: CustomerComplaint; message: string }>(`/quality/complaints/${id}`, data);
    return res.data;
  },

  // Analytics & Reports
  getQualityReportSummary: async () => {
    const res = await apiClient.get<{ success: boolean; data: { monthlyTrend: any[] } }>('/quality/reports/summary');
    return res.data;
  },

  getDefectsParetoReport: async () => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/quality/reports/defects-pareto');
    return res.data;
  },

  getSPCReport: async () => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/quality/reports/spc');
    return res.data;
  }
};
