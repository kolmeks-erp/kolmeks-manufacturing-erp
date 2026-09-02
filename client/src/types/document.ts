export type DocumentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type ConfidentialityLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'HIGHLY_CONFIDENTIAL';

export type ERPModuleName =
  | 'Employee'
  | 'Supplier'
  | 'Customer'
  | 'Product'
  | 'SalesOrder'
  | 'Quotation'
  | 'Delivery'
  | 'PurchaseRequisition'
  | 'RFQ'
  | 'PurchaseOrder'
  | 'GRN'
  | 'SupplierInvoice'
  | 'QualityInspection'
  | 'NCR'
  | 'CAPA'
  | 'MaintenanceWorkOrder'
  | 'Asset'
  | 'ProductionOrder'
  | 'Invoice'
  | 'Payment'
  | 'General';

export interface DocumentTypeItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface DocumentCategoryItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_id?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  storage_path: string;
  storage_url: string;
  change_summary?: string;
  created_by?: string;
  creator?: { full_name?: string };
  status: DocumentStatus;
  is_current: boolean;
  created_at: string;
}

export interface DocumentRelationship {
  id: string;
  document_id: string;
  module_name: ERPModuleName;
  record_id: string;
  record_reference?: string;
  created_at: string;
}

export interface DocumentApprovalStep {
  id: string;
  approval_id: string;
  step_number: number;
  approver_id?: string;
  approver?: { full_name?: string };
  approver_role?: string;
  decision: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  comments?: string;
  decided_at?: string;
  created_at: string;
}

export interface DocumentApproval {
  id: string;
  document_id: string;
  version_id: string;
  requester_id?: string;
  requester?: { full_name?: string };
  approval_type: 'SEQUENTIAL' | 'PARALLEL';
  target_role?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  due_date?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  message?: string;
  created_at: string;
  updated_at: string;
  document?: DocumentItem;
  version?: DocumentVersion;
  steps?: DocumentApprovalStep[];
}

export interface DocumentAuditLog {
  id: string;
  document_id?: string;
  version_id?: string;
  actor_id?: string;
  actor?: { full_name?: string };
  action: string;
  old_value?: any;
  new_value?: any;
  reason?: string;
  ip_address?: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  document_number: string;
  title: string;
  description?: string;
  type_id?: string;
  type?: DocumentTypeItem;
  category_id?: string;
  category?: DocumentCategoryItem;
  tags?: string[];
  owner_id?: string;
  owner?: { full_name?: string; email?: string };
  department_id?: string;
  uploaded_by?: string;
  uploader?: { full_name?: string; email?: string };
  status: DocumentStatus;
  confidentiality_level: ConfidentialityLevel;
  effective_date?: string;
  review_date?: string;
  next_review_date?: string;
  expiry_date?: string;
  retention_category?: string;
  retention_start_date?: string;
  retention_end_date?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  current_version?: DocumentVersion;
  versions?: DocumentVersion[];
  relationships?: DocumentRelationship[];
  approvals?: DocumentApproval[];
  audit_trail?: DocumentAuditLog[];
}

export interface DocumentTelemetry {
  totalDocumentsCount: number;
  activeDocumentsCount: number;
  pendingApprovalsCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  reviewDueCount: number;
  categoryBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
}
