export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  icon?: string;
  badge?: string;
}

export interface ERPMenuItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  category?: 'core' | 'operations' | 'quality' | 'admin';
  badge?: string;
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
    status: string;
  };
}
