export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'TEMPORARY';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface Employee {
  id: string;
  auth_user_id?: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id: string;
  department?: Department;
  designation: string;
  employment_type: EmploymentType;
  joining_date: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  relationship?: string;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  department_id?: string;
  employment_type?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeePagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EmployeeListResponse {
  success: boolean;
  data: Employee[];
  pagination: EmployeePagination;
}

export interface EmployeeFormPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id: string;
  designation: string;
  employment_type: EmploymentType;
  joining_date: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  relationship?: string;
  status?: EmployeeStatus;
}
