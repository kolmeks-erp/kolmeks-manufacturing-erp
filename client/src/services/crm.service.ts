import api from './api';
import {
  CRMLead,
  CRMOpportunity,
  CRMActivity,
  CRMFollowup,
  CRMTask,
  CRMDashboardKPIs,
  PipelineStageBoard,
} from '../types/crm';

export const crmService = {
  // 1. Dashboard
  getDashboardKPIs: async (): Promise<CRMDashboardKPIs> => {
    const response = await api.get('/crm/dashboard');
    return response.data.data;
  },

  // 2. Leads
  getLeads: async (params?: Record<string, any>): Promise<{ data: CRMLead[]; pagination: any }> => {
    const response = await api.get('/crm/leads', { params });
    return response.data;
  },

  getLeadById: async (id: string): Promise<{ lead: CRMLead; activities: CRMActivity[]; tasks: CRMTask[]; followups: CRMFollowup[]; auditLogs: any[] }> => {
    const response = await api.get(`/crm/leads/${id}`);
    return response.data.data;
  },

  createLead: async (leadData: Partial<CRMLead>): Promise<CRMLead> => {
    const response = await api.post('/crm/leads', leadData);
    return response.data.data;
  },

  updateLead: async (id: string, leadData: Partial<CRMLead>): Promise<CRMLead> => {
    const response = await api.patch(`/crm/leads/${id}`, leadData);
    return response.data.data;
  },

  qualifyLead: async (id: string, payload: any): Promise<CRMLead> => {
    const response = await api.post(`/crm/leads/${id}/qualify`, payload);
    return response.data.data;
  },

  convertLead: async (id: string, payload: any): Promise<any> => {
    const response = await api.post(`/crm/leads/${id}/convert`, payload);
    return response.data;
  },

  // 3. Opportunities & Pipeline
  getOpportunities: async (params?: Record<string, any>): Promise<{ data: CRMOpportunity[]; pagination: any }> => {
    const response = await api.get('/crm/opportunities', { params });
    return response.data;
  },

  getOpportunityById: async (id: string): Promise<{ opportunity: CRMOpportunity; activities: CRMActivity[]; tasks: CRMTask[]; followups: CRMFollowup[]; auditLogs: any[] }> => {
    const response = await api.get(`/crm/opportunities/${id}`);
    return response.data.data;
  },

  createOpportunity: async (oppData: Partial<CRMOpportunity>): Promise<CRMOpportunity> => {
    const response = await api.post('/crm/opportunities', oppData);
    return response.data.data;
  },

  updateOpportunityStage: async (id: string, stage: string, lost_reason?: string): Promise<CRMOpportunity> => {
    const response = await api.post(`/crm/opportunities/${id}/stage`, { stage, lost_reason });
    return response.data.data;
  },

  winOpportunity: async (id: string, payload?: any): Promise<CRMOpportunity> => {
    const response = await api.post(`/crm/opportunities/${id}/win`, payload);
    return response.data.data;
  },

  loseOpportunity: async (id: string, lost_reason: string, notes?: string): Promise<CRMOpportunity> => {
    const response = await api.post(`/crm/opportunities/${id}/lost`, { lost_reason, notes });
    return response.data.data;
  },

  getPipelineBoard: async (): Promise<Record<string, PipelineStageBoard>> => {
    const response = await api.get('/crm/pipeline');
    return response.data.data;
  },

  // 4. Activities & Tasks & Followups
  getActivities: async (params?: Record<string, any>): Promise<CRMActivity[]> => {
    const response = await api.get('/crm/activities', { params });
    return response.data.data;
  },

  createActivity: async (activityData: Partial<CRMActivity>): Promise<CRMActivity> => {
    const response = await api.post('/crm/activities', activityData);
    return response.data.data;
  },

  getTasks: async (params?: Record<string, any>): Promise<CRMTask[]> => {
    const response = await api.get('/crm/tasks', { params });
    return response.data.data;
  },

  createTask: async (taskData: Partial<CRMTask>): Promise<CRMTask> => {
    const response = await api.post('/crm/tasks', taskData);
    return response.data.data;
  },

  updateTaskStatus: async (id: string, status: string): Promise<CRMTask> => {
    const response = await api.patch(`/crm/tasks/${id}/status`, { status });
    return response.data.data;
  },

  getFollowups: async (params?: Record<string, any>): Promise<CRMFollowup[]> => {
    const response = await api.get('/crm/follow-ups', { params });
    return response.data.data;
  },

  createFollowup: async (fuData: Partial<CRMFollowup>): Promise<CRMFollowup> => {
    const response = await api.post('/crm/follow-ups', fuData);
    return response.data.data;
  },

  // 5. Customer Timeline & Notes
  getCustomerTimeline: async (customerId: string): Promise<{ customer: any; timeline: any[] }> => {
    const response = await api.get(`/crm/customers/${customerId}/timeline`);
    return response.data.data;
  },

  addCustomerNote: async (customerId: string, note: string): Promise<any> => {
    const response = await api.post(`/crm/customers/${customerId}/notes`, { note });
    return response.data.data;
  },

  // 6. Reports
  getCRMReports: async (): Promise<any> => {
    const response = await api.get('/crm/reports');
    return response.data.data;
  },
};
