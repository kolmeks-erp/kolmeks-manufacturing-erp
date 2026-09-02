import axios from 'axios';
import {
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowTask,
  WorkflowHistoryItem,
  WorkflowTelemetry,
  ApprovalGroup,
  WorkflowDelegation,
} from '../types/workflow';

const API_BASE = '/api/workflows';

export const workflowService = {
  getDashboardTelemetry: async (): Promise<WorkflowTelemetry> => {
    const response = await axios.get(`${API_BASE}/dashboard`);
    return response.data.data;
  },

  getDefinitions: async (): Promise<WorkflowDefinition[]> => {
    const response = await axios.get(`${API_BASE}/definitions`);
    return response.data.data;
  },

  getDefinitionById: async (id: string): Promise<WorkflowDefinition> => {
    const response = await axios.get(`${API_BASE}/definitions/${id}`);
    return response.data.data;
  },

  createDefinition: async (payload: Partial<WorkflowDefinition> & { stages?: any[] }): Promise<WorkflowDefinition> => {
    const response = await axios.post(`${API_BASE}/definitions`, payload);
    return response.data.data;
  },

  activateDefinition: async (id: string): Promise<WorkflowDefinition> => {
    const response = await axios.put(`${API_BASE}/definitions/${id}/activate`);
    return response.data.data;
  },

  getInstances: async (params?: { entity_type?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await axios.get(`${API_BASE}/instances`, { params });
    return response.data;
  },

  getInstanceById: async (id: string): Promise<WorkflowInstance> => {
    const response = await axios.get(`${API_BASE}/instances/${id}`);
    return response.data.data;
  },

  startInstance: async (payload: {
    entity_type: string;
    entity_id: string;
    entity_reference?: string;
    module?: string;
    priority?: string;
    entity_data?: any;
  }) => {
    const response = await axios.post(`${API_BASE}/instances/start`, payload);
    return response.data.data;
  },

  cancelInstance: async (id: string, reason?: string) => {
    const response = await axios.post(`${API_BASE}/instances/${id}/cancel`, { reason });
    return response.data.data;
  },

  resubmitInstance: async (id: string, message?: string) => {
    const response = await axios.post(`${API_BASE}/instances/${id}/resubmit`, { message });
    return response.data.data;
  },

  getUserTasks: async (params?: { tab?: string; page?: number; limit?: number }) => {
    const response = await axios.get(`${API_BASE}/tasks`, { params });
    return response.data;
  },

  processTaskDecision: async (taskId: string, decision: 'Approved' | 'Rejected' | 'Changes Requested', comments?: string) => {
    const response = await axios.post(`${API_BASE}/tasks/${taskId}/decision`, { decision, comments });
    return response.data.data;
  },

  reassignTask: async (taskId: string, new_assignee_id: string, reason?: string) => {
    const response = await axios.post(`${API_BASE}/tasks/${taskId}/reassign`, { new_assignee_id, reason });
    return response.data.data;
  },

  getHistory: async (params?: { page?: number; limit?: number }) => {
    const response = await axios.get(`${API_BASE}/history`, { params });
    return response.data;
  },

  getReports: async () => {
    const response = await axios.get(`${API_BASE}/reports`);
    return response.data.data;
  },

  getGroups: async (): Promise<ApprovalGroup[]> => {
    const response = await axios.get(`${API_BASE}/groups`);
    return response.data.data;
  },

  getDelegations: async (): Promise<WorkflowDelegation[]> => {
    const response = await axios.get(`${API_BASE}/delegations`);
    return response.data.data;
  },
};
