import api from './api';
import {
  PayrollDashboardKPIs,
  PayrollPeriod,
  PayrollRun,
  PayrollEntry,
} from '../types/payroll';

export const payrollService = {
  // Dashboard Telemetry KPIs
  getDashboardKPIs: async (): Promise<PayrollDashboardKPIs> => {
    const res = await api.get('/payroll/dashboard/kpis');
    return res.data.data;
  },

  // Employee Compensation Management
  getCompensations: async (): Promise<any[]> => {
    const res = await api.get('/payroll/compensations');
    return res.data.data;
  },

  updateCompensation: async (employeeId: string, data: { basic_salary: number; allowances: number; hourly_rate: number; currency?: string }): Promise<any> => {
    const res = await api.post(`/payroll/compensations/${employeeId}`, data);
    return res.data.data;
  },

  // Payroll Periods
  getPeriods: async (): Promise<PayrollPeriod[]> => {
    const res = await api.get('/payroll/periods');
    return res.data.data;
  },

  createPeriod: async (data: { period_code: string; name: string; start_date: string; end_date: string }): Promise<PayrollPeriod> => {
    const res = await api.post('/payroll/periods', data);
    return res.data.data;
  },

  updatePeriodStatus: async (id: string, status: string): Promise<PayrollPeriod> => {
    const res = await api.patch(`/payroll/periods/${id}/status`, { status });
    return res.data.data;
  },

  // Payroll Runs Engine
  getRuns: async (): Promise<PayrollRun[]> => {
    const res = await api.get('/payroll/runs');
    return res.data.data;
  },

  createRun: async (payroll_period_id: string): Promise<PayrollRun> => {
    const res = await api.post('/payroll/runs', { payroll_period_id });
    return res.data.data;
  },

  getRunById: async (id: string): Promise<{ run: PayrollRun; entries: PayrollEntry[] }> => {
    const res = await api.get(`/payroll/runs/${id}`);
    return res.data.data;
  },

  calculateRun: async (id: string): Promise<{ run: PayrollRun; entries: PayrollEntry[] }> => {
    const res = await api.post(`/payroll/runs/${id}/calculate`, {});
    return res.data.data;
  },

  approveRun: async (id: string): Promise<PayrollRun> => {
    const res = await api.post(`/payroll/runs/${id}/approve`, {});
    return res.data.data;
  },

  postRunToGL: async (id: string): Promise<{ run: PayrollRun; journalEntry: any }> => {
    const res = await api.post(`/payroll/runs/${id}/post`, {});
    return res.data.data;
  },

  // Payslips (Self-Service + HR View)
  getPayslips: async (params?: { employee_id?: string }): Promise<PayrollEntry[]> => {
    const res = await api.get('/payroll/payslips', { params });
    return res.data.data;
  },

  getPayslipById: async (id: string): Promise<PayrollEntry> => {
    const res = await api.get(`/payroll/payslips/${id}`);
    return res.data.data;
  },

  // Reports
  getPayrollReports: async (payroll_period_id?: string): Promise<PayrollEntry[]> => {
    const res = await api.get('/payroll/reports', { params: { payroll_period_id } });
    return res.data.data;
  },
};
