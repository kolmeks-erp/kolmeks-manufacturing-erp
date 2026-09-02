import { apiClient as api } from './api';
import {
  ProcurementTelemetry,
  SupplierEvaluation,
  SupplierDocument,
  SupplierQuotation,
  SupplierReturn,
  ThreeWayMatchResult,
} from '../types/procurement_p2p';

export const procurementP2PService = {
  // Telemetry & KPIs
  getTelemetry: async (): Promise<ProcurementTelemetry> => {
    const res = await api.get('/procurement/p2p/telemetry');
    return res.data.data;
  },

  // Supplier Evaluation & Onboarding
  evaluateSupplier: async (supplierId: string, data: Partial<SupplierEvaluation>): Promise<SupplierEvaluation> => {
    const res = await api.post(`/procurement/p2p/suppliers/${supplierId}/evaluate`, data);
    return res.data.data;
  },

  getSupplierEvaluations: async (supplierId: string): Promise<SupplierEvaluation[]> => {
    const res = await api.get(`/procurement/p2p/suppliers/${supplierId}/evaluations`);
    return res.data.data;
  },

  addSupplierDocument: async (supplierId: string, data: Partial<SupplierDocument>): Promise<SupplierDocument> => {
    const res = await api.post(`/procurement/p2p/suppliers/${supplierId}/documents`, data);
    return res.data.data;
  },

  getSupplierDocuments: async (supplierId: string): Promise<SupplierDocument[]> => {
    const res = await api.get(`/procurement/p2p/suppliers/${supplierId}/documents`);
    return res.data.data;
  },

  updateSupplierOnboardingStatus: async (supplierId: string, onboarding_status: string, remarks?: string): Promise<any> => {
    const res = await api.patch(`/procurement/p2p/suppliers/${supplierId}/onboard-status`, { onboarding_status, remarks });
    return res.data.data;
  },

  // Supplier Quotation & RFQ Matrix
  createSupplierQuotation: async (quoteData: any): Promise<SupplierQuotation> => {
    const res = await api.post('/procurement/p2p/quotations', quoteData);
    return res.data.data;
  },

  getQuotationComparison: async (rfqId: string): Promise<SupplierQuotation[]> => {
    const res = await api.get(`/procurement/p2p/quotations/compare?rfq_id=${rfqId}`);
    return res.data.data;
  },

  selectSupplierForRFQ: async (quotationId: string, payload: { rfq_id?: string; supplier_id: string; reason: string }): Promise<any> => {
    const res = await api.post(`/procurement/p2p/quotations/${quotationId}/select`, payload);
    return res.data.data;
  },

  // PO Amendment
  amendPurchaseOrder: async (poId: string, payload: { field_name: string; old_value?: string; new_value: string; reason: string }): Promise<any> => {
    const res = await api.post(`/procurement/p2p/orders/${poId}/amend`, payload);
    return res.data.data;
  },

  // Supplier Returns
  createSupplierReturn: async (returnData: any): Promise<SupplierReturn> => {
    const res = await api.post('/procurement/p2p/returns', returnData);
    return res.data.data;
  },

  getSupplierReturns: async (): Promise<SupplierReturn[]> => {
    const res = await api.get('/procurement/p2p/returns');
    return res.data.data;
  },

  updateSupplierReturnStatus: async (returnId: string, status: string): Promise<SupplierReturn> => {
    const res = await api.patch(`/procurement/p2p/returns/${returnId}/status`, { status });
    return res.data.data;
  },

  // Three-Way Matching
  performThreeWayMatch: async (invoiceId: string): Promise<ThreeWayMatchResult> => {
    const res = await api.get(`/procurement/p2p/three-way-match/${invoiceId}`);
    return res.data.data;
  },

  // Reports
  getProcurementReports: async (): Promise<any> => {
    const res = await api.get('/procurement/p2p/reports');
    return res.data.data;
  },
};
