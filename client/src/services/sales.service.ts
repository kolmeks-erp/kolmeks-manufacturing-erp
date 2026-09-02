import api from './api';
import {
  SalesDashboardData,
  AdvancedQuotation,
  FulfillmentSummaryItem,
  PickingList,
  PackingList,
  DeliveryOrder,
  SalesReturn,
  CreditNote,
  PricingRule,
} from '../types/sales';

export const salesService = {
  // Sales Dashboard Telemetry
  getDashboardData: async (): Promise<SalesDashboardData> => {
    const response = await api.get('/sales/dashboard');
    return response.data.data;
  },

  // Quotations
  getQuotations: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const response = await api.get('/sales/quotations', { params });
    return response.data;
  },

  getQuotationById: async (id: string): Promise<AdvancedQuotation> => {
    const response = await api.get(`/sales/quotations/${id}`);
    return response.data.data;
  },

  createQuotation: async (data: Partial<AdvancedQuotation>) => {
    const response = await api.post('/sales/quotations', data);
    return response.data;
  },

  updateQuotationStatus: async (id: string, status: string) => {
    const response = await api.patch(`/sales/quotations/${id}/status`, { status });
    return response.data;
  },

  // Fulfillment Overview
  getOrderFulfillment: async (): Promise<FulfillmentSummaryItem[]> => {
    const response = await api.get('/sales/fulfillment');
    return response.data.data;
  },

  // Picking & Packing
  getPickings: async (): Promise<PickingList[]> => {
    const response = await api.get('/sales/picking');
    return response.data.data;
  },

  createPicking: async (data: any) => {
    const response = await api.post('/sales/picking', data);
    return response.data;
  },

  updatePickingStatus: async (id: string, status: string, items?: any[]) => {
    const response = await api.patch(`/sales/picking/${id}`, { status, items });
    return response.data;
  },

  getPackings: async (): Promise<PackingList[]> => {
    const response = await api.get('/sales/packing');
    return response.data.data;
  },

  createPacking: async (data: any) => {
    const response = await api.post('/sales/packing', data);
    return response.data;
  },

  // Deliveries
  getDeliveries: async (): Promise<DeliveryOrder[]> => {
    const response = await api.get('/sales/deliveries');
    return response.data.data;
  },

  getDeliveryById: async (id: string): Promise<DeliveryOrder> => {
    const response = await api.get(`/sales/deliveries/${id}`);
    return response.data.data;
  },

  createDelivery: async (data: any) => {
    const response = await api.post('/sales/deliveries', data);
    return response.data;
  },

  dispatchDelivery: async (id: string, carrier?: string, tracking_reference?: string) => {
    const response = await api.post(`/sales/deliveries/${id}/dispatch`, { carrier, tracking_reference });
    return response.data;
  },

  confirmDelivery: async (id: string, proof_reference?: string, notes?: string) => {
    const response = await api.post(`/sales/deliveries/${id}/deliver`, { proof_reference, notes });
    return response.data;
  },

  // Returns & Credit Notes
  getSalesReturns: async (): Promise<SalesReturn[]> => {
    const response = await api.get('/sales/returns');
    return response.data.data;
  },

  createSalesReturn: async (data: any) => {
    const response = await api.post('/sales/returns', data);
    return response.data;
  },

  updateSalesReturnStatus: async (id: string, status: string) => {
    const response = await api.patch(`/sales/returns/${id}/status`, { status });
    return response.data;
  },

  getCreditNotes: async (): Promise<CreditNote[]> => {
    const response = await api.get('/sales/credit-notes');
    return response.data.data;
  },

  createCreditNote: async (data: any) => {
    const response = await api.post('/sales/credit-notes', data);
    return response.data;
  },

  // Pricing
  getPricingRules: async (): Promise<PricingRule[]> => {
    const response = await api.get('/sales/pricing');
    return response.data.data;
  },

  createPricingRule: async (data: any) => {
    const response = await api.post('/sales/pricing', data);
    return response.data;
  },

  // Reports
  getSalesReports: async () => {
    const response = await api.get('/sales/reports');
    return response.data.data;
  },
};
