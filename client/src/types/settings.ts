export interface OrganizationProfile {
  id?: string;
  org_name: string;
  legal_name?: string;
  display_name?: string;
  company_code?: string;
  registration_number?: string;
  tax_id?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  default_timezone: string;
  default_currency: string;
  date_format: string;
  number_format: string;
  quantity_precision?: number;
  price_precision?: number;
}

export interface LocationItem {
  id?: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state_province?: string;
  country: string;
  postal_code?: string;
  timezone?: string;
  currency?: string;
  contact_email?: string;
  contact_phone?: string;
  manager_id?: string;
  status: 'Active' | 'Inactive';
}

export interface DepartmentItem {
  id?: string;
  code: string;
  name: string;
  description?: string;
  manager_id?: string;
  parent_department_id?: string;
  location_id?: string;
  status: 'active' | 'inactive' | 'Active' | 'Inactive';
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export type LocationSetting = LocationItem;
export type DepartmentSetting = DepartmentItem;

export interface UserItem {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  department?: string;
  status: 'active' | 'inactive' | 'suspended' | 'Active' | 'Inactive';
  is_active?: boolean;
  is_master_admin?: boolean;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
  created_at: string;
}

export interface RoleItem {
  id?: string;
  name: string;
  description?: string;
  permission_ids?: string[];
  role_permissions?: Array<{
    permission: {
      id: string;
      code: string;
      name: string;
      category: string;
    };
  }>;
}

export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
}

export interface NumberingSequence {
  id?: string;
  entity_type: string;
  label: string;
  prefix: string;
  sequence_length: number;
  current_value: number;
  starting_number?: number;
  suffix?: string;
  pattern: string;
  reset_period: 'Never' | 'Yearly' | 'Monthly';
}

export interface CurrencyItem {
  id?: string;
  code: string;
  name: string;
  symbol: string;
  decimal_precision: number;
  is_default: boolean;
  exchange_rate_to_default: number;
  status: 'Active' | 'Inactive';
}

export interface UnitItem {
  id?: string;
  code: string;
  name: string;
  category: 'Quantity' | 'Weight' | 'Length' | 'Volume' | 'Time' | 'Area';
  symbol: string;
  conversion_factor: number;
  base_unit_code?: string;
  status: 'Active' | 'Inactive';
}

export interface MasterOption {
  id?: string;
  category: string;
  code: string;
  label: string;
  description?: string;
  sort_order: number;
  is_default: boolean;
  status: 'Active' | 'Inactive';
}

export interface AuditLogItem {
  id: string;
  actor_id?: string;
  actor?: {
    id: string;
    full_name: string;
    email: string;
  };
  action: string;
  module: string;
  target_record?: string;
  old_values?: any;
  new_values?: any;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';
  created_at: string;
}

export interface AdminTelemetry {
  organization: OrganizationProfile;
  metrics: {
    totalLocations: number;
    activeLocations: number;
    totalDepartments: number;
    totalUsers: number;
    activeUsers: number;
    totalRoles: number;
    pendingIssues: number;
    securityStatus: string;
  };
  locations: LocationItem[];
  recentAuditActivity: AuditLogItem[];
}
