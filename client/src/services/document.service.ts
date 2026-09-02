import { apiClient as api } from './api';
import {
  DocumentTelemetry,
  DocumentItem,
  DocumentTypeItem,
  DocumentCategoryItem,
  DocumentApproval,
} from '../types/document';

export const documentService = {
  // Telemetry & Dashboard Data
  getDashboardData: async (): Promise<DocumentTelemetry> => {
    const response = await api.get('/documents/dashboard');
    return response.data.data;
  },

  // Document Library & Filtering
  getDocuments: async (params: Record<string, any> = {}): Promise<{ data: DocumentItem[]; pagination: any }> => {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  // Document Detail
  getDocumentById: async (id: string): Promise<DocumentItem> => {
    const response = await api.get(`/documents/${id}`);
    return response.data.data;
  },

  // Upload New Document (FormData)
  createDocument: async (formData: FormData): Promise<DocumentItem> => {
    const response = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Update Metadata
  updateMetadata: async (id: string, payload: Record<string, any>): Promise<DocumentItem> => {
    const response = await api.patch(`/documents/${id}/metadata`, payload);
    return response.data.data;
  },

  // Upload New Revision / Version
  uploadNewVersion: async (id: string, formData: FormData): Promise<any> => {
    const response = await api.post(`/documents/${id}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Digital Approval Submission
  submitForApproval: async (id: string, payload: Record<string, any>): Promise<DocumentApproval> => {
    const response = await api.post(`/documents/${id}/approvals`, payload);
    return response.data.data;
  },

  // Process Decision (Approve / Reject / Request Changes)
  processApprovalDecision: async (approvalId: string, payload: { decision: string; comments?: string }): Promise<any> => {
    const response = await api.post(`/documents/approvals/${approvalId}/decision`, payload);
    return response.data;
  },

  // Publish & Archive
  publishDocument: async (id: string): Promise<any> => {
    const response = await api.post(`/documents/${id}/publish`);
    return response.data;
  },

  archiveDocument: async (id: string): Promise<any> => {
    const response = await api.post(`/documents/${id}/archive`);
    return response.data;
  },

  // Expiring & My Approvals
  getExpiringDocuments: async (): Promise<{ expiringSoon: DocumentItem[]; expired: DocumentItem[]; reviewDue: DocumentItem[] }> => {
    const response = await api.get('/documents/expiring');
    return response.data.data;
  },

  getMyApprovals: async (): Promise<DocumentApproval[]> => {
    const response = await api.get('/documents/approvals/my');
    return response.data.data;
  },

  getRecentDocuments: async (): Promise<DocumentItem[]> => {
    const response = await api.get('/documents/recent');
    return response.data.data;
  },

  // Types & Categories
  getDocumentTypes: async (): Promise<DocumentTypeItem[]> => {
    const response = await api.get('/documents/types');
    return response.data.data;
  },

  createDocumentType: async (payload: Record<string, any>): Promise<DocumentTypeItem> => {
    const response = await api.post('/documents/types', payload);
    return response.data.data;
  },

  getDocumentCategories: async (): Promise<DocumentCategoryItem[]> => {
    const response = await api.get('/documents/categories');
    return response.data.data;
  },

  createDocumentCategory: async (payload: Record<string, any>): Promise<DocumentCategoryItem> => {
    const response = await api.post('/documents/categories', payload);
    return response.data.data;
  },

  // Executive Reports
  getDocumentReports: async (): Promise<any> => {
    const response = await api.get('/documents/reports');
    return response.data.data;
  },
};
