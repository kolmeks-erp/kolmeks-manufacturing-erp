export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type NotificationCategory =
  | 'Approvals'
  | 'Documents'
  | 'Sales'
  | 'Procurement'
  | 'Inventory'
  | 'Production'
  | 'Quality'
  | 'Maintenance'
  | 'HR'
  | 'Finance'
  | 'CRM'
  | 'System';

export interface NotificationItem {
  id: string;
  notification_number: string;
  type_id?: string;
  recipient_id: string;
  sender_id?: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  related_module?: string;
  related_record_id?: string;
  related_record_reference?: string;
  related_route?: string;
  is_read: boolean;
  read_at?: string;
  is_dismissed?: boolean;
  dismissed_at?: string;
  event_key?: string;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

export interface ReminderItem {
  id: string;
  title: string;
  description?: string;
  recipient_id: string;
  due_date: string;
  reminder_time: string;
  priority: NotificationPriority;
  status: 'PENDING' | 'TRIGGERED' | 'DISMISSED' | 'COMPLETED';
  related_module?: string;
  related_record_id?: string;
  related_record_reference?: string;
  related_route?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id?: string;
  user_id: string;
  in_app_approvals: boolean;
  in_app_documents: boolean;
  in_app_procurement: boolean;
  in_app_sales: boolean;
  in_app_quality: boolean;
  in_app_maintenance: boolean;
  in_app_hr: boolean;
  in_app_finance: boolean;
  in_app_crm: boolean;
  in_app_system: boolean;
  email_approvals: boolean;
  email_urgent: boolean;
  email_daily_digest: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationTypeItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  default_priority: NotificationPriority;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface NotificationReportData {
  totalCount: number;
  unreadCount: number;
  urgentCount: number;
  categoryCounts: Record<string, number>;
  recentDeliveryLogs: Array<{
    id: string;
    notification_id: string;
    channel: string;
    status: string;
    sent_at: string;
  }>;
}
