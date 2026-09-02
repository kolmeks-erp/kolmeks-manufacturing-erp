export interface WorkflowDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
  entity_type: string;
  status: 'Draft' | 'Active' | 'Inactive' | 'Archived';
  active_version_number: number;
  owner_id?: string;
  created_at: string;
  updated_at: string;
  workflow_versions?: WorkflowVersion[];
}

export interface WorkflowVersion {
  id: string;
  workflow_id: string;
  version_number: number;
  change_summary?: string;
  status: 'Draft' | 'Active' | 'Inactive' | 'Archived';
  effective_date: string;
  created_at: string;
  workflow_stages?: WorkflowStage[];
}

export interface WorkflowStage {
  id: string;
  version_id: string;
  sequence: number;
  name: string;
  description?: string;
  approval_mode: 'SINGLE' | 'SEQUENTIAL' | 'PARALLEL' | 'ANY_ONE' | 'ALL_REQUIRED';
  rejection_behavior: 'REJECT_WORKFLOW' | 'RETURN_TO_REQUESTER' | 'RETURN_TO_PREVIOUS_STAGE' | 'CHANGES_REQUESTED';
  deadline_hours: number;
  workflow_steps?: WorkflowStep[];
  workflow_conditions?: WorkflowCondition[];
}

export interface WorkflowStep {
  id: string;
  stage_id: string;
  sequence: number;
  step_name: string;
  approver_type: 'SPECIFIC_USER' | 'EMPLOYEE_ROLE' | 'DEPARTMENT_MANAGER' | 'DEPARTMENT' | 'RECORD_OWNER' | 'APPROVAL_GROUP';
  approver_value: string;
}

export interface WorkflowCondition {
  id: string;
  stage_id: string;
  field_name: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'contains' | 'is_empty' | 'is_not_empty';
  value_text: string;
  logic_group: 'AND' | 'OR';
}

export interface WorkflowInstance {
  id: string;
  instance_number: string;
  workflow_id: string;
  version_id: string;
  entity_type: string;
  entity_id: string;
  entity_reference?: string;
  current_stage_id?: string;
  status: 'Pending' | 'In Progress' | 'Approved' | 'Rejected' | 'Changes Requested' | 'Cancelled' | 'Completed' | 'Failed' | 'Suspended';
  attempt_number: number;
  started_by?: string;
  due_date?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  started_at: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  workflow_definitions?: { name: string; module: string };
  workflow_stages?: { name: string };
  workflow_tasks?: WorkflowTask[];
  workflow_history?: WorkflowHistoryItem[];
}

export interface WorkflowTask {
  id: string;
  instance_id: string;
  stage_id?: string;
  step_id?: string;
  assignee_id?: string;
  assignee_role?: string;
  status: 'Pending' | 'In Progress' | 'Approved' | 'Rejected' | 'Changes Requested' | 'Cancelled' | 'Completed' | 'Expired';
  assigned_at: string;
  due_date?: string;
  completed_at?: string;
  decision?: 'Approved' | 'Rejected' | 'Changes Requested';
  comments?: string;
  workflow_instances?: WorkflowInstance;
  workflow_stages?: { name: string };
  profiles?: { full_name: string; role: string; email: string };
}

export interface WorkflowHistoryItem {
  id: string;
  instance_id: string;
  event_type: string;
  actor_id?: string;
  stage_id?: string;
  task_id?: string;
  notes?: string;
  metadata?: any;
  created_at: string;
  profiles?: { full_name: string; role: string };
  workflow_instances?: { instance_number: string; entity_type: string; entity_reference: string };
}

export interface ApprovalGroup {
  id: string;
  code: string;
  name: string;
  description?: string;
  approval_group_members?: { user_id: string; role: string; profiles?: { full_name: string; email: string } }[];
}

export interface WorkflowDelegation {
  id: string;
  delegator_id: string;
  delegate_id: string;
  start_date: string;
  end_date: string;
  scope_module: string;
  status: 'ACTIVE' | 'INACTIVE';
  delegator?: { full_name: string };
  delegate?: { full_name: string };
}

export interface WorkflowTelemetry {
  activeWorkflows: number;
  myPendingTasks: number;
  overdueTasks: number;
  rejectedWorkflows: number;
  changesRequested: number;
  exceptions: number;
}
