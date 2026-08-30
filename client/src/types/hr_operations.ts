import { Employee } from './employee';

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'ON_LEAVE'
  | 'HOLIDAY'
  | 'WEEK_OFF';

export type LeaveRequestStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type LeaveHalfDayOption = 'NONE' | 'FIRST_HALF' | 'SECOND_HALF';

export interface Designation {
  id: string;
  code: string;
  name: string;
  department_id?: string;
  department?: { id: string; code: string; name: string };
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Shift {
  id: string;
  shift_code: string;
  name: string;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
  grace_minutes: number;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeShiftAssignment {
  id: string;
  employee_id: string;
  shift_id: string;
  employee?: Partial<Employee>;
  shift?: Shift;
  start_date: string;
  end_date?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  attendance_date: string;
  shift_id?: string;
  check_in?: string;
  check_out?: string;
  status: AttendanceStatus;
  worked_minutes: number;
  late_minutes: number;
  early_exit_minutes?: number;
  notes?: string;
  employee?: Partial<Employee> & { department?: { name: string } };
  shift?: Partial<Shift>;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceCorrection {
  id: string;
  attendance_id?: string;
  employee_id: string;
  requested_check_in?: string;
  requested_check_out?: string;
  requested_status?: AttendanceStatus;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  created_at?: string;
}

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  description?: string;
  paid: boolean;
  default_days: number;
  default_days_per_year?: number;
  carry_forward_allowed?: boolean;
  requires_approval: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  allocated_days: number;
  used_days: number;
  pending_days: number;
  adjustment_days: number;
  remaining_days: number;
  leave_type?: LeaveType;
  employee?: Partial<Employee>;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveRequest {
  id: string;
  request_number: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  half_day: LeaveHalfDayOption;
  leave_days: number;
  reason: string;
  status: LeaveRequestStatus;
  approver_id?: string;
  approved_at?: string;
  rejection_reason?: string;
  employee?: Partial<Employee> & { department?: { name: string } };
  leave_type?: LeaveType;
  approver?: { first_name: string; last_name: string };
  created_at?: string;
  updated_at?: string;
}

export interface Holiday {
  id: string;
  name: string;
  holiday_date: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: 'OFFER_LETTER' | 'ID_DOCUMENT' | 'QUALIFICATION' | 'CONTRACT' | 'RESUME' | 'OTHER';
  document_name: string;
  file_url: string;
  notes?: string;
  uploaded_at?: string;
}

export interface HRDashboardKPIs {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  lateToday: number;
  pendingLeaveRequests: number;
  upcomingHolidays: Holiday[];
}

export interface MyProfileData {
  employee: Employee & { department?: { name: string }; shift?: Shift };
  leaveBalances: LeaveBalance[];
  recentAttendance: AttendanceRecord[];
}

export interface MyLeaveData {
  balances: LeaveBalance[];
  requests: LeaveRequest[];
}
