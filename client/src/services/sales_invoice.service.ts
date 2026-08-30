import api from './api';
import {
  SalesInvoice,
  CustomerPayment,
  ReceivablesSummary,
  ReceivableAgingReport,
  CustomerStatementData,
} from '../types/sales_invoice';

export const salesInvoiceService = {
  // 1. Sales Invoices
  getInvoices: async (params?: {
    status?: string;
    customer_id?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }): Promise<SalesInvoice[]> => {
    const res = await api.get('/sales/invoices', { params });
    return res.data.data;
  },

  getInvoiceById: async (id: string): Promise<SalesInvoice> => {
    const res = await api.get(`/sales/invoices/${id}`);
    return res.data.data;
  },

  createInvoice: async (data: Partial<SalesInvoice>): Promise<SalesInvoice> => {
    const res = await api.post('/sales/invoices', data);
    return res.data.data;
  },

  issueInvoice: async (id: string): Promise<SalesInvoice> => {
    const res = await api.post(`/sales/invoices/${id}/issue`, {});
    return res.data.data;
  },

  voidInvoice: async (id: string, void_reason: string): Promise<SalesInvoice> => {
    const res = await api.post(`/sales/invoices/${id}/void`, { void_reason });
    return res.data.data;
  },

  // 2. Customer Payments
  getPayments: async (params?: {
    customer_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<CustomerPayment[]> => {
    const res = await api.get('/finance/payments', { params });
    return res.data.data;
  },

  getPaymentById: async (id: string): Promise<CustomerPayment> => {
    const res = await api.get(`/finance/payments/${id}`);
    return res.data.data;
  },

  recordPayment: async (data: {
    customer_id: string;
    payment_date?: string;
    amount: number;
    currency?: string;
    payment_method?: string;
    reference_number?: string;
    notes?: string;
    allocations?: { invoice_id: string; amount: number }[];
  }): Promise<CustomerPayment> => {
    const res = await api.post('/finance/payments', data);
    return res.data.data;
  },

  voidPayment: async (id: string, void_reason: string): Promise<CustomerPayment> => {
    const res = await api.post(`/finance/payments/${id}/void`, { void_reason });
    return res.data.data;
  },

  // 3. Receivables & Reports
  getReceivables: async (): Promise<ReceivablesSummary> => {
    const res = await api.get('/finance/receivables');
    return res.data.data;
  },

  getReceivableAging: async (): Promise<ReceivableAgingReport> => {
    const res = await api.get('/finance/receivables/aging');
    return res.data.data;
  },

  getCustomerStatement: async (
    customerId: string,
    params?: { start_date?: string; end_date?: string }
  ): Promise<CustomerStatementData> => {
    const res = await api.get(`/finance/customers/${customerId}/statement`, { params });
    return res.data.data;
  },
};
