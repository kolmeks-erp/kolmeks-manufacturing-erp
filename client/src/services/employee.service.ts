import { apiClient } from './api';
import {
  Employee,
  Department,
  Designation,
  EmployeeFilterOptions,
  EmployeeListResponse,
  EmployeeFormPayload,
  EmployeeStatus,
} from '../types/employee';

export const employeeService = {
  /**
   * Fetch paginated list of employees with search and filters
   */
  async getEmployees(options: EmployeeFilterOptions = {}): Promise<EmployeeListResponse> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.search) params.append('search', options.search);
    if (options.department_id) params.append('department_id', options.department_id);
    if (options.designation_id) params.append('designation_id', options.designation_id);
    if (options.manager_id) params.append('manager_id', options.manager_id);
    if (options.employment_type) params.append('employment_type', options.employment_type);
    if (options.status) params.append('status', options.status);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const response = await apiClient.get<EmployeeListResponse>(`/employees?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch departments list
   */
  async getDepartments(): Promise<Department[]> {
    const response = await apiClient.get<{ success: boolean; data: Department[] }>('/employees/departments');
    return response.data.data;
  },

  async createDepartment(payload: Partial<Department>): Promise<Department> {
    const response = await apiClient.post<{ success: boolean; data: Department }>('/employees/departments', payload);
    return response.data.data;
  },

  async updateDepartment(id: string, payload: Partial<Department>): Promise<Department> {
    const response = await apiClient.patch<{ success: boolean; data: Department }>(`/employees/departments/${id}`, payload);
    return response.data.data;
  },

  /**
   * Fetch organization structure hierarchy
   */
  async getOrganizationStructure(): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>('/employees/organization');
    return response.data.data;
  },

  /**
   * Fetch single employee record by ID (with relational metadata)
   */
  async getEmployeeById(id: string): Promise<Employee> {
    const response = await apiClient.get<{ success: boolean; data: Employee }>(`/employees/${id}`);
    return response.data.data;
  },

  /**
   * Create a new employee record
   */
  async createEmployee(payload: EmployeeFormPayload): Promise<Employee> {
    const response = await apiClient.post<{ success: boolean; data: Employee }>('/employees', payload);
    return response.data.data;
  },

  /**
   * Update existing employee record
   */
  async updateEmployee(id: string, payload: Partial<EmployeeFormPayload>): Promise<Employee> {
    const response = await apiClient.patch<{ success: boolean; data: Employee }>(`/employees/${id}`, payload);
    return response.data.data;
  },

  /**
   * Lifecycle actions
   */
  async transferEmployee(id: string, payload: any): Promise<Employee> {
    const response = await apiClient.post<{ success: boolean; data: Employee }>(`/employees/${id}/transfer`, payload);
    return response.data.data;
  },

  async promoteEmployee(id: string, payload: any): Promise<Employee> {
    const response = await apiClient.post<{ success: boolean; data: Employee }>(`/employees/${id}/promote`, payload);
    return response.data.data;
  },

  async confirmEmployee(id: string, payload: any): Promise<Employee> {
    const response = await apiClient.post<{ success: boolean; data: Employee }>(`/employees/${id}/confirm`, payload);
    return response.data.data;
  },

  async resignEmployee(id: string, payload: any): Promise<Employee> {
    const response = await apiClient.post<{ success: boolean; data: Employee }>(`/employees/${id}/resign`, payload);
    return response.data.data;
  },

  async terminateEmployee(id: string, payload: any): Promise<Employee> {
    const response = await apiClient.post<{ success: boolean; data: Employee }>(`/employees/${id}/terminate`, payload);
    return response.data.data;
  },

  /**
   * Sub-resource additions
   */
  async addSkill(employeeId: string, payload: any): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/employees/${employeeId}/skills`, payload);
    return response.data.data;
  },

  async addQualification(employeeId: string, payload: any): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/employees/${employeeId}/qualifications`, payload);
    return response.data.data;
  },

  async addCertification(employeeId: string, payload: any): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/employees/${employeeId}/certifications`, payload);
    return response.data.data;
  },

  async addHRNote(employeeId: string, payload: any): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/employees/${employeeId}/notes`, payload);
    return response.data.data;
  },

  async addDocument(employeeId: string, payload: any): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/employees/${employeeId}/documents`, payload);
    return response.data.data;
  },

  /**
   * HR Analytical Reports
   */
  async getHRReports(): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>('/employees/reports');
    return response.data.data;
  },

  /**
   * Update employee status
   */
  async patchStatus(id: string, status: EmployeeStatus): Promise<{ id: string; status: EmployeeStatus }> {
    const response = await apiClient.patch<{
      success: boolean;
      data: { id: string; status: EmployeeStatus };
    }>(`/employees/${id}/status`, { status });
    return response.data.data;
  },
};
