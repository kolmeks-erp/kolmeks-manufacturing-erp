import api from './api';
import {
  PurchaseInvoice,
  SupplierPayment,
  PayablesSummary,
  PayableAgingReport,
  SupplierStatementData,
} from '../types/purchase_invoice';

export const purchaseInvoiceService = {
  // --- INVOICES ---
  getInvoices: async (params?: {
    supplier_id?: string;
    status?: string;
    match_status?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PurchaseInvoice[]> => {
    const response = await api.get('/purchases/invoices', { params });
    return response.data.data;
  },

  getInvoiceById: async (id: string): Promise<PurchaseInvoice> => {
    const response = await api.get(`/purchases/invoices/${id}`);
    return response.data.data;
  },

  createInvoice: async (payload: Partial<PurchaseInvoice>): Promise<PurchaseInvoice> => {
    const response = await api.post('/purchases/invoices', payload);
    return response.data.data;
  },

  approveInvoice: async (id: string, variance_reason?: string): Promise<PurchaseInvoice> => {
    const response = await api.post(`/purchases/invoices/${id}/approve`, { variance_reason });
    return response.data.data;
  },

  postInvoice: async (id: string): Promise<PurchaseInvoice> => {
    const response = await api.post(`/purchases/invoices/${id}/post`);
    return response.data.data;
  },

  voidInvoice: async (id: string, void_reason: string): Promise<PurchaseInvoice> => {
    const response = await api.post(`/purchases/invoices/${id}/void`, { void_reason });
    return response.data.data;
  },

  // --- SUPPLIER PAYMENTS & AP ---
  getPayables: async (): Promise<PayablesSummary> => {
    const response = await api.get('/finance/payables');
    return response.data.data;
  },

  getPayableAging: async (report_date?: string): Promise<PayableAgingReport> => {
    const response = await api.get('/finance/payables/aging', { params: { report_date } });
    return response.data.data;
  },

  getSupplierStatement: async (
    supplierId: string,
    params?: { start_date?: string; end_date?: string }
  ): Promise<SupplierStatementData> => {
    const response = await api.get(`/finance/payables/supplier/${supplierId}/statement`, { params });
    return response.data.data;
  },

  getPayments: async (params?: { supplier_id?: string; status?: string }): Promise<SupplierPayment[]> => {
    const response = await api.get('/finance/supplier-payments', { params });
    return response.data.data;
  },

  getPaymentById: async (id: string): Promise<SupplierPayment> => {
    const response = await api.get(`/finance/supplier-payments/${id}`);
    return response.data.data;
  },

  recordPayment: async (payload: {
    supplier_id: string;
    payment_date: string;
    amount: number;
    payment_method: string;
    reference_number?: string;
    bank_account_id?: string;
    notes?: string;
    allocations?: { purchase_invoice_id: string; amount: number }[];
  }): Promise<SupplierPayment> => {
    const response = await api.post('/finance/supplier-payments', payload);
    return response.data.data;
  },

  voidPayment: async (id: string, void_reason: string): Promise<SupplierPayment> => {
    const response = await api.post(`/finance/supplier-payments/${id}/void`, { void_reason });
    return response.data.data;
  },
};
