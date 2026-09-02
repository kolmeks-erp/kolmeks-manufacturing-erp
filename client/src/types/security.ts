export interface SecurityUserRecord {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  status: 'active' | 'suspended' | 'inactive';
  created_at: string;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface UserSessionRecord {
  id: string;
  user_id: string;
  device_info: string;
  browser: string;
  ip_address: string;
  status: 'active' | 'revoked' | 'expired';
  last_activity: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface SecurityEventRecord {
  id: string;
  event_timestamp: string;
  actor_id?: string;
  actor_email?: string;
  event_type: string;
  category: 'AUTHENTICATION' | 'AUTHORIZATION' | 'SESSION' | 'SECURITY_POLICY' | 'DATA_ACCESS' | 'EXPORT' | 'SYSTEM_CONFIG';
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  module: string;
  target_entity?: string;
  target_id?: string;
  ip_address: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface SecurityPolicyRecord {
  id: string;
  policy_name: string;
  category: string;
  policy_key: string;
  value: Record<string, any>;
  is_enabled: boolean;
  description: string;
  updated_at: string;
}

export interface SystemAuditLogRecord {
  id: string;
  created_at: string;
  action: string;
  module: string;
  entity_type: string;
  entity_id?: string;
  severity?: string;
  actor_id?: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  ip_address?: string;
  actor?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface SecurityOverviewMetrics {
  users: {
    total: number;
    active: number;
    suspended: number;
    inactive: number;
  };
  sessions: {
    activeCount: number;
  };
  events: {
    totalLast30Days: number;
    criticalCount: number;
    failedLoginAttempts: number;
    privilegeChangesCount: number;
    exportActivitiesCount: number;
  };
  policiesCount: number;
}
