export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'TEMPORARY' | 'OTHER';

export type EmployeeStatus = 
  | 'ACTIVE' 
  | 'PROBATION' 
  | 'ON_LEAVE' 
  | 'NOTICE_PERIOD' 
  | 'SUSPENDED' 
  | 'INACTIVE' 
  | 'TERMINATED' 
  | 'RESIGNED';

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  manager_id?: string;
  manager?: {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
  };
  parent_department_id?: string;
}

export interface Designation {
  id: string;
  code: string;
  name: string;
  department_id?: string;
  department?: Department;
  description?: string;
  level?: number;
  status: 'active' | 'inactive';
}

export interface EmployeeSkill {
  id: string;
  employee_id: string;
  skill_name: string;
  proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'MASTER';
  years_of_experience: number;
  last_verified_date?: string;
  created_at: string;
}

export interface EmployeeQualification {
  id: string;
  employee_id: string;
  qualification_title: string;
  institution: string;
  year_completed?: number;
  specialization?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'DISCONTINUED';
  created_at: string;
}

export interface EmployeeCertification {
  id: string;
  employee_id: string;
  certification_name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  created_at: string;
}

export interface EmployeeHistory {
  id: string;
  employee_id: string;
  event_type: 'JOINING' | 'PROBATION' | 'CONFIRMATION' | 'TRANSFER' | 'PROMOTION' | 'STATUS_CHANGE' | 'RESIGNATION' | 'TERMINATION' | 'OTHER';
  event_date: string;
  old_department_id?: string;
  new_department_id?: string;
  old_dept?: { name: string };
  new_dept?: { name: string };
  old_designation_id?: string;
  new_designation_id?: string;
  old_desig?: { name: string };
  new_desig?: { name: string };
  old_manager_id?: string;
  new_manager_id?: string;
  old_location?: string;
  new_location?: string;
  reason?: string;
  created_at: string;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: 'JOINING_LETTER' | 'OFFER_LETTER' | 'ID_DOCUMENT' | 'QUALIFICATION' | 'CONTRACT' | 'RESUME' | 'EXPERIENCE_CERTIFICATE' | 'OTHER';
  document_name: string;
  file_url: string;
  notes?: string;
  expiry_date?: string;
  status?: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  uploaded_at: string;
}

export interface EmployeeHRNote {
  id: string;
  employee_id: string;
  note: string;
  created_by?: string;
  created_by_profile?: { full_name: string; email: string };
  created_at: string;
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
  designation_id?: string;
  designation_rel?: Designation;
  manager_id?: string;
  manager?: {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  cost_center_id?: string;
  cost_center?: { id: string; code: string; name: string };
  location?: string;
  employment_type: EmploymentType;
  joining_date: string;
  probation_start_date?: string;
  probation_end_date?: string;
  confirmation_date?: string;
  confirmation_remarks?: string;
  resignation_date?: string;
  notice_period_days?: number;
  last_working_date?: string;
  resignation_reason?: string;
  termination_date?: string;
  termination_reason?: string;
  termination_remarks?: string;
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

  // Relational aggregates (when fetched detailed)
  skills?: EmployeeSkill[];
  qualifications?: EmployeeQualification[];
  certifications?: EmployeeCertification[];
  history?: EmployeeHistory[];
  documents?: EmployeeDocument[];
  notes?: EmployeeHRNote[];
  assets?: any[];
}

export interface EmployeeFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  department_id?: string;
  designation_id?: string;
  manager_id?: string;
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
  designation_id?: string;
  manager_id?: string;
  cost_center_id?: string;
  location?: string;
  employment_type: EmploymentType;
  joining_date: string;
  probation_start_date?: string;
  probation_end_date?: string;
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
