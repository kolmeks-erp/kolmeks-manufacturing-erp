import { apiClient } from './api';
import {
  Employee,
  Department,
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
    if (options.employment_type) params.append('employment_type', options.employment_type);
    if (options.status) params.append('status', options.status);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const response = await apiClient.get<EmployeeListResponse>(`/employees?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch active departments list
   */
  async getDepartments(): Promise<Department[]> {
    const response = await apiClient.get<{ success: boolean; data: Department[] }>('/employees/departments');
    return response.data.data;
  },

  /**
   * Fetch single employee record by ID
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
   * Update employee status (Activate / Deactivate)
   */
  async patchStatus(id: string, status: EmployeeStatus): Promise<{ id: string; status: EmployeeStatus }> {
    const response = await apiClient.patch<{
      success: boolean;
      data: { id: string; status: EmployeeStatus };
    }>(`/employees/${id}/status`, { status });
    return response.data.data;
  },
};
