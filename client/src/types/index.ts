export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  icon?: string;
  badge?: string;
}

export type UserRoleName =
  | 'admin'
  | 'hr'
  | 'finance'
  | 'finance_manager'
  | 'accountant'
  | 'manager'
  | 'sales_manager'
  | 'purchase_manager'
  | 'production_manager'
  | 'production_planner'
  | 'production_supervisor'
  | 'quality_manager'
  | 'quality_engineer'
  | 'quality_inspector'
  | 'maintenance_manager'
  | 'maintenance_technician'
  | 'warehouse_manager'
  | 'inventory_manager'
  | 'executive';

export interface UserRole {
  id: string;
  name: UserRoleName;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string; // References auth.users(id)
  full_name: string;
  email: string;
  phone?: string;
  role_id?: string;
  role?: UserRole;
  department?: string;
  profile_image?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  updated_at?: string;
}

export interface ERPMenuItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  category?: 'core' | 'operations' | 'quality' | 'admin' | 'Sales' | 'Procurement' | 'Products' | 'Inventory' | 'Production' | 'Quality' | 'Machines' | 'Management' | string;
  badge?: string;
  roles?: UserRoleName[]; // Allowed roles for role-aware sidebar navigation
}

export interface HealthCheckResponse {
  success: boolean;
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime: string;
  database: {
    provider: string;
    connected?: boolean;
    status: string;
    message?: string;
  };
}
