export type InspectionType = 'INCOMING' | 'IN_PROCESS' | 'FINAL' | 'FIRST_ARTICLE' | 'CUSTOMER_RETURN' | 'SUPPLIER_MATERIAL' | 'MANUAL_CHECK';
export type InspectionStatus = 'DRAFT' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'PARTIALLY_ACCEPTED' | 'ON_HOLD' | 'CANCELLED';
export type InspectionResultStatus = 'PASS' | 'FAIL' | 'PARTIAL' | 'PENDING';
export type CharacteristicType = 'NUMERIC' | 'TEXT' | 'BOOLEAN' | 'OPTION' | 'ENUM';

export interface QualityDefect {
  id: string;
  defect_code: string;
  name: string;
  description?: string;
  category: 'DIMENSIONAL' | 'SURFACE_FINISH' | 'MATERIAL_DEFECT' | 'ASSEMBLY' | 'ELECTRICAL' | 'PACKAGING' | 'DOCUMENTATION' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InspectionPlanItem {
  id?: string;
  plan_id?: string;
  sequence: number;
  name: string;
  description?: string;
  type: CharacteristicType;
  target_value?: number;
  min_value?: number;
  max_value?: number;
  unit?: string;
  required: boolean;
  sampling_type?: '100%' | 'SAMPLE';
  sample_quantity?: number;
}

export interface InspectionPlan {
  id: string;
  plan_number: string;
  product_id: string;
  version: string;
  inspection_type: InspectionType;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OBSOLETE';
  description?: string;
  effective_from?: string;
  effective_to?: string;
  products?: { id: string; code?: string; product_code?: string; name: string };
  inspection_plan_items?: InspectionPlanItem[];
  created_at: string;
  updated_at: string;
}

export interface InspectionResult {
  id: string;
  inspection_id: string;
  plan_item_id?: string;
  characteristic_name: string;
  characteristic_type: CharacteristicType;
  target_value?: number;
  min_value?: number;
  max_value?: number;
  measured_value?: number;
  text_value?: string;
  boolean_value?: boolean;
  unit?: string;
  result: 'PASS' | 'FAIL' | 'PENDING';
  notes?: string;
}

export interface QualityInspection {
  id: string;
  inspection_number: string;
  inspection_type: InspectionType;
  product_id: string;
  supplier_id?: string;
  grn_id?: string;
  po_id?: string;
  production_order_id?: string;
  production_operation_id?: string;
  inspection_plan_id?: string;
  batch_id?: string;
  serial_number_id?: string;
  customer_id?: string;
  work_order_id?: string;
  quantity_inspected: number;
  quantity_accepted: number;
  quantity_rejected: number;
  sample_size?: number;
  lot_quantity?: number;
  evidence_url?: string;
  status: InspectionStatus;
  result: InspectionResultStatus;
  inspected_by?: string;
  inspection_date?: string;
  notes?: string;
  products?: { id: string; code?: string; product_code?: string; name: string };
  suppliers?: { id: string; supplier_code?: string; company_name: string };
  goods_receipts?: { id: string; grn_number: string };
  purchase_orders?: { id: string; po_number: string };
  production_orders?: { id: string; production_order_number: string };
  inspected_by_profile?: { id: string; full_name?: string; email: string };
  results?: InspectionResult[];
  created_at: string;
  updated_at: string;
}

export interface QualityHold {
  id: string;
  hold_number: string;
  product_id: string;
  warehouse_id?: string;
  location_id?: string;
  grn_id?: string;
  production_order_id?: string;
  inspection_id?: string;
  batch_id?: string;
  serial_number_id?: string;
  ncr_id?: string;
  quantity: number;
  released_quantity: number;
  rejected_quantity?: number;
  scrapped_quantity?: number;
  reason: string;
  status: 'ON_HOLD' | 'RELEASED' | 'REJECTED' | 'SCRAPPED';
  placed_by?: string;
  placed_at: string;
  released_by?: string;
  released_at?: string;
  notes?: string;
  products?: { id: string; code?: string; product_code?: string; name: string };
  goods_receipts?: { id: string; grn_number: string };
  production_orders?: { id: string; production_order_number: string };
  placed_profile?: { id: string; full_name?: string; email: string };
  created_at: string;
}

export type NCRSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NCRSourceType = 'INCOMING_INSPECTION' | 'IN_PROCESS_INSPECTION' | 'FINAL_INSPECTION' | 'SUPPLIER' | 'PRODUCTION' | 'CUSTOMER' | 'OTHER';
export type NCRStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'CONTAINMENT' | 'ROOT_CAUSE' | 'ACTION_REQUIRED' | 'IN_PROGRESS' | 'VERIFICATION' | 'CLOSED' | 'CANCELLED';

export interface RootCauseAnalysis {
  id?: string;
  ncr_id: string;
  root_cause: string;
  analysis_method: '5_WHY' | 'FISHBONE' | 'MANUAL_ANALYSIS' | '8D_REPORT';
  why_1?: string;
  why_2?: string;
  why_3?: string;
  why_4?: string;
  why_5?: string;
  category_manpower?: string;
  category_machine?: string;
  category_material?: string;
  category_method?: string;
  category_measurement?: string;
  category_environment?: string;
  evidence_url?: string;
  analyst_id?: string;
  analysis_date?: string;
}

export interface NonConformanceReport {
  id: string;
  ncr_number: string;
  title: string;
  description: string;
  severity: NCRSeverity;
  source_type: NCRSourceType;
  source_id?: string;
  inspection_id?: string;
  product_id?: string;
  supplier_id?: string;
  production_order_id?: string;
  grn_id?: string;
  batch_id?: string;
  serial_number_id?: string;
  customer_id?: string;
  work_order_id?: string;
  containment_action?: string;
  owner_id?: string;
  evidence_url?: string;
  status: NCRStatus;
  assigned_to?: string;
  root_cause?: string;
  corrective_action?: string;
  preventive_action?: string;
  due_date?: string;
  closed_at?: string;
  closed_by?: string;
  products?: { id: string; code?: string; product_code?: string; name: string };
  suppliers?: { id: string; supplier_code?: string; company_name: string };
  quality_inspections?: { id: string; inspection_number: string };
  assigned_profile?: { id: string; full_name?: string; email: string };
  created_at: string;
  updated_at: string;
}

export type CAPAPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CAPAStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'CLOSED' | 'OVERDUE' | 'CANCELLED';

export interface CAPAAction {
  id: string;
  capa_id: string;
  action_type: 'CORRECTIVE' | 'PREVENTIVE';
  description: string;
  owner_id?: string;
  due_date?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'CANCELLED';
  completion_notes?: string;
  completed_at?: string;
  evidence_url?: string;
  verified_by?: string;
  verified_at?: string;
  owner_profile?: { id: string; full_name?: string; email: string };
}

export interface CAPARecord {
  id: string;
  capa_number: string;
  ncr_id?: string;
  title: string;
  description: string;
  source_type?: string;
  owner_id?: string;
  priority: CAPAPriority;
  status: CAPAStatus;
  due_date?: string;
  completed_at?: string;
  verified_by?: string;
  verified_at?: string;
  closed_by?: string;
  closed_at?: string;
  non_conformance_reports?: { id: string; ncr_number: string; title: string };
  owner_profile?: { id: string; full_name?: string; email: string };
  actions?: CAPAAction[];
  created_at: string;
  updated_at: string;
}

export interface SupplierQualityMetric {
  id: string;
  supplier_code?: string;
  company_name: string;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  ncrCount: number;
  totalInspectedQty: number;
  totalRejectedQty: number;
  passRate: number;
  ppm: number;
}

export interface CustomerComplaint {
  id: string;
  complaint_number: string;
  customer_id?: string;
  product_id?: string;
  sales_order_id?: string;
  batch_number?: string;
  serial_number?: string;
  complaint_date?: string;
  description: string;
  severity: NCRSeverity;
  status: 'OPEN' | 'INVESTIGATING' | 'ACTION_REQUIRED' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
  ncr_id?: string;
  capa_id?: string;
  resolution_notes?: string;
  assigned_to?: string;
  customers?: { id: string; company_name: string };
  products?: { id: string; product_code?: string; name: string };
  non_conformance_reports?: { id: string; ncr_number: string };
  capa_records?: { id: string; capa_number: string };
  created_at: string;
  updated_at: string;
}

export interface QualityKPIs {
  totalInspections: number;
  pendingInspections: number;
  passedInspections: number;
  failedInspections: number;
  passRate: number;
  activeHolds: number;
  openNCRs: number;
  overdueNCRs: number;
  openCAPAs?: number;
}
