import apiClient from './api';
import {
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowTelemetry,
  ApprovalGroup,
  WorkflowDelegation,
} from '../types/workflow';

export const workflowService = {
  getDashboardTelemetry: async (): Promise<WorkflowTelemetry> => {
    const response = await apiClient.get('/workflows/dashboard');
    return response.data?.data || {};
  },

  getDefinitions: async (): Promise<WorkflowDefinition[]> => {
    const response = await apiClient.get('/workflows/definitions');
    return response.data?.data || [];
  },

  getDefinitionById: async (id: string): Promise<WorkflowDefinition> => {
    const response = await apiClient.get(`/workflows/definitions/${id}`);
    return response.data?.data;
  },

  createDefinition: async (payload: Partial<WorkflowDefinition> & { stages?: any[] }): Promise<WorkflowDefinition> => {
    const response = await apiClient.post('/workflows/definitions', payload);
    return response.data?.data;
  },

  activateDefinition: async (id: string): Promise<WorkflowDefinition> => {
    const response = await apiClient.put(`/workflows/definitions/${id}/activate`);
    return response.data?.data;
  },

  getInstances: async (params?: { entity_type?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/workflows/instances', { params });
    return response.data || { data: [] };
  },

  getInstanceById: async (id: string): Promise<WorkflowInstance> => {
    const response = await apiClient.get(`/workflows/instances/${id}`);
    return response.data?.data;
  },

  startInstance: async (payload: {
    entity_type: string;
    entity_id: string;
    entity_reference?: string;
    module?: string;
    priority?: string;
    entity_data?: any;
  }) => {
    const response = await apiClient.post('/workflows/instances/start', payload);
    return response.data?.data;
  },

  cancelInstance: async (id: string, reason?: string) => {
    const response = await apiClient.post(`/workflows/instances/${id}/cancel`, { reason });
    return response.data?.data;
  },

  resubmitInstance: async (id: string, message?: string) => {
    const response = await apiClient.post(`/workflows/instances/${id}/resubmit`, { message });
    return response.data?.data;
  },

  getUserTasks: async (params?: { tab?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/workflows/tasks', { params });
    return response.data || { data: [] };
  },

  processTaskDecision: async (taskId: string, decision: 'Approved' | 'Rejected' | 'Changes Requested', comments?: string) => {
    const response = await apiClient.post(`/workflows/tasks/${taskId}/decision`, { decision, comments });
    return response.data?.data;
  },

  reassignTask: async (taskId: string, new_assignee_id: string, reason?: string) => {
    const response = await apiClient.post(`/workflows/tasks/${taskId}/reassign`, { new_assignee_id, reason });
    return response.data?.data;
  },

  getHistory: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/workflows/history', { params });
    return response.data || { data: [] };
  },

  getReports: async () => {
    const response = await apiClient.get('/workflows/reports');
    return response.data?.data || [];
  },

  getGroups: async (): Promise<ApprovalGroup[]> => {
    const response = await apiClient.get('/workflows/groups');
    return response.data?.data || [];
  },

  getDelegations: async (): Promise<WorkflowDelegation[]> => {
    const response = await apiClient.get('/workflows/delegations');
    return response.data?.data || [];
  },
};
