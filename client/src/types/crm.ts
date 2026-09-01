export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED' | 'LOST' | 'CLOSED';
export type LeadPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type OpportunityStage = 'QUALIFICATION' | 'NEEDS_ANALYSIS' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type ActivityType = 'CALL' | 'MEETING' | 'EMAIL' | 'NOTE' | 'TASK' | 'OTHER';
export type ActivityStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type FollowupStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';

export interface CRMLead {
  id: string;
  lead_number: string;
  lead_name: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  source: string;
  owner_id?: string;
  customer_id?: string;
  status: LeadStatus;
  priority: LeadPriority;
  expected_value: number;
  qualification_status?: string;
  expected_close_date?: string;
  requirement?: string;
  product_interest?: string;
  notes?: string;
  converted_customer_id?: string;
  converted_opportunity_id?: string;
  converted_at?: string;
  converted_by?: string;
  next_followup_date?: string;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_code: string;
  };
  customer?: {
    id: string;
    company_name: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface CRMOpportunity {
  id: string;
  opportunity_number: string;
  name: string;
  customer_id: string;
  contact_id?: string;
  lead_id?: string;
  owner_id?: string;
  expected_value: number;
  probability: number;
  forecast_value?: number;
  expected_close_date?: string;
  stage: OpportunityStage;
  priority: LeadPriority;
  source?: string;
  lost_reason?: string;
  lost_date?: string;
  quotation_id?: string;
  sales_order_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    customer_code?: string;
    company_name: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_code?: string;
  };
  quotation?: {
    id: string;
    quotation_number: string;
    grand_total?: number;
    status?: string;
  };
  sales_order?: {
    id: string;
    order_number: string;
    grand_total?: number;
    status?: string;
  };
}

export interface CRMActivity {
  id: string;
  activity_type: ActivityType;
  customer_id?: string;
  contact_id?: string;
  lead_id?: string;
  opportunity_id?: string;
  owner_id?: string;
  activity_date: string;
  activity_time?: string;
  duration_minutes?: number;
  subject: string;
  description?: string;
  outcome?: string;
  status: ActivityStatus;
  created_at: string;
  customer?: {
    company_name?: string;
    first_name?: string;
    last_name?: string;
  };
  owner?: {
    first_name?: string;
    last_name?: string;
  };
  contact?: {
    first_name?: string;
    last_name?: string;
  };
}

export interface CRMFollowup {
  id: string;
  customer_id?: string;
  lead_id?: string;
  opportunity_id?: string;
  owner_id?: string;
  followup_date: string;
  purpose: string;
  notes?: string;
  status: FollowupStatus;
  created_at: string;
  customer?: {
    company_name?: string;
    first_name?: string;
    last_name?: string;
  };
  owner?: {
    first_name?: string;
    last_name?: string;
  };
  opportunity?: {
    name?: string;
    opportunity_number?: string;
  };
}

export interface CRMTask {
  id: string;
  task_title: string;
  lead_id?: string;
  opportunity_id?: string;
  customer_id?: string;
  contact_id?: string;
  owner_id?: string;
  due_date: string;
  priority: LeadPriority;
  status: TaskStatus;
  description?: string;
  created_at: string;
  customer?: {
    company_name?: string;
    first_name?: string;
    last_name?: string;
  };
  owner?: {
    first_name?: string;
    last_name?: string;
  };
}

export interface CRMDashboardKPIs {
  newLeads: number;
  qualifiedLeads: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: string;
  openOpportunities: number;
  totalPipelineValue: number;
  weightedPipelineValue: number;
  wonDeals: number;
  lostDeals: number;
  overdueFollowups: number;
  activitiesToday: number;
  recentActivities: CRMActivity[];
  upcomingFollowups: CRMFollowup[];
}

export interface PipelineStageBoard {
  stage: OpportunityStage;
  count: number;
  total_value: number;
  weighted_value: number;
  opportunities: CRMOpportunity[];
}
