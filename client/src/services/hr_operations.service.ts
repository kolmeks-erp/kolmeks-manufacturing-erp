import api from './api';
import {
  HRDashboardKPIs,
  Designation,
  Shift,
  EmployeeShiftAssignment,
  AttendanceRecord,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  Holiday,
  MyProfileData,
  MyLeaveData,
  OvertimeRecord,
  WorkingCalendarSettings,
} from '../types/hr_operations';

export const hrOperationsService = {
  // Dashboard Telemetry KPIs
  getDashboardKPIs: async (): Promise<HRDashboardKPIs> => {
    const res = await api.get('/hr/dashboard/kpis');
    return res.data.data;
  },

  // Designations
  getDesignations: async (): Promise<Designation[]> => {
    const res = await api.get('/hr/designations');
    return res.data.data;
  },

  createDesignation: async (data: Partial<Designation>): Promise<Designation> => {
    const res = await api.post('/hr/designations', data);
    return res.data.data;
  },

  // Shifts
  getShifts: async (): Promise<Shift[]> => {
    const res = await api.get('/hr/shifts');
    return res.data.data;
  },

  createShift: async (data: Partial<Shift>): Promise<Shift> => {
    const res = await api.post('/hr/shifts', data);
    return res.data.data;
  },

  assignEmployeeShift: async (data: { employee_id: string; shift_id: string; start_date?: string }): Promise<EmployeeShiftAssignment> => {
    const res = await api.post('/hr/shifts/assign', data);
    return res.data.data;
  },

  // Attendance Engine
  checkIn: async (): Promise<AttendanceRecord> => {
    const res = await api.post('/hr/attendance/check-in', {});
    return res.data.data;
  },

  checkOut: async (): Promise<AttendanceRecord> => {
    const res = await api.post('/hr/attendance/check-out', {});
    return res.data.data;
  },

  getAttendanceRecords: async (params?: Record<string, any>): Promise<{ data: AttendanceRecord[]; pagination: any }> => {
    const res = await api.get('/hr/attendance', { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  requestAttendanceCorrection: async (data: { attendance_id?: string; requested_check_in?: string; requested_check_out?: string; requested_status?: string; reason: string }): Promise<any> => {
    const res = await api.post('/hr/attendance/correction-request', data);
    return res.data.data;
  },

  // Leave Management
  getLeaveTypes: async (): Promise<LeaveType[]> => {
    const res = await api.get('/hr/leave/types');
    return res.data.data;
  },

  createLeaveType: async (data: Partial<LeaveType>): Promise<LeaveType> => {
    const res = await api.post('/hr/leave/types', data);
    return res.data.data;
  },

  getLeaveBalances: async (params?: { employee_id?: string; year?: number }): Promise<LeaveBalance[]> => {
    const res = await api.get('/hr/leave/balances', { params });
    return res.data.data;
  },

  allocateLeaveBalance: async (data: { employee_id: string; leave_type_id: string; year?: number; allocated_days: number }): Promise<LeaveBalance> => {
    const res = await api.post('/hr/leave/balances/allocate', data);
    return res.data.data;
  },

  getLeaveRequests: async (params?: Record<string, any>): Promise<{ data: LeaveRequest[]; pagination: any }> => {
    const res = await api.get('/hr/leave/requests', { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  createLeaveRequest: async (data: { leave_type_id: string; start_date: string; end_date: string; half_day?: string; reason: string; employee_id?: string }): Promise<LeaveRequest> => {
    const res = await api.post('/hr/leave/requests', data);
    return res.data.data;
  },

  approveLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const res = await api.post(`/hr/leave/requests/${id}/approve`, {});
    return res.data.data;
  },

  rejectLeaveRequest: async (id: string, rejection_reason?: string): Promise<LeaveRequest> => {
    const res = await api.post(`/hr/leave/requests/${id}/reject`, { rejection_reason });
    return res.data.data;
  },

  // Holidays
  getHolidays: async (year?: number): Promise<Holiday[]> => {
    const res = await api.get('/hr/holidays', { params: { year } });
    return res.data.data;
  },

  createHoliday: async (data: Partial<Holiday>): Promise<Holiday> => {
    const res = await api.post('/hr/holidays', data);
    return res.data.data;
  },

  // Employee Self-Service ("My HR")
  getMyProfile: async (): Promise<MyProfileData> => {
    const res = await api.get('/hr/me/profile');
    return res.data.data;
  },

  getMyAttendance: async (): Promise<AttendanceRecord[]> => {
    const res = await api.get('/hr/me/attendance');
    return res.data.data;
  },

  getMyLeave: async (): Promise<MyLeaveData> => {
    const res = await api.get('/hr/me/leave');
    return res.data.data;
  },

  // Overtime Management
  getOvertimeRecords: async (params?: Record<string, any>): Promise<{ data: OvertimeRecord[]; pagination: any }> => {
    const res = await api.get('/hr/overtime', { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  createOvertimeRequest: async (data: { employee_id?: string; overtime_date?: string; hours: number; reason: string }): Promise<OvertimeRecord> => {
    const res = await api.post('/hr/overtime', data);
    return res.data.data;
  },

  approveOvertimeRequest: async (id: string, hourly_rate?: number): Promise<OvertimeRecord> => {
    const res = await api.post(`/hr/overtime/${id}/approve`, { hourly_rate });
    return res.data.data;
  },

  rejectOvertimeRequest: async (id: string, rejection_reason?: string): Promise<OvertimeRecord> => {
    const res = await api.post(`/hr/overtime/${id}/reject`, { rejection_reason });
    return res.data.data;
  },

  // Working Calendar Settings
  getWorkingCalendarSettings: async (): Promise<WorkingCalendarSettings> => {
    const res = await api.get('/hr/calendar-settings');
    return res.data.data;
  },

  updateWorkingCalendarSettings: async (data: Partial<WorkingCalendarSettings>): Promise<WorkingCalendarSettings> => {
    const res = await api.post('/hr/calendar-settings', data);
    return res.data.data;
  },
};
