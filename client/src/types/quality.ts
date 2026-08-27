export type InspectionType = 'INCOMING' | 'IN_PROCESS' | 'FINAL' | 'FIRST_ARTICLE';
export type InspectionStatus = 'DRAFT' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'PARTIALLY_ACCEPTED' | 'ON_HOLD' | 'CANCELLED';
export type InspectionResultStatus = 'PASS' | 'FAIL' | 'PARTIAL' | 'PENDING';
export type CharacteristicType = 'NUMERIC' | 'TEXT' | 'BOOLEAN' | 'OPTION';

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
  products?: { id: string; code: string; name: string };
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
  quantity_inspected: number;
  quantity_accepted: number;
  quantity_rejected: number;
  status: InspectionStatus;
  result: InspectionResultStatus;
  inspected_by?: string;
  inspection_date?: string;
  notes?: string;
  products?: { id: string; code: string; name: string };
  suppliers?: { id: string; supplier_code: string; company_name: string };
  goods_receipts?: { id: string; grn_number: string };
  purchase_orders?: { id: string; po_number: string };
  production_orders?: { id: string; production_order_number: string };
  inspected_by_profile?: { id: string; first_name: string; last_name: string; email: string };
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
  quantity: number;
  released_quantity: number;
  reason: string;
  status: 'ON_HOLD' | 'RELEASED' | 'REJECTED';
  placed_by?: string;
  placed_at: string;
  released_by?: string;
  released_at?: string;
  notes?: string;
  products?: { id: string; code: string; name: string };
  goods_receipts?: { id: string; grn_number: string };
  production_orders?: { id: string; production_order_number: string };
  placed_profile?: { id: string; first_name: string; last_name: string; email: string };
  created_at: string;
}

export type NCRSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NCRSourceType = 'INCOMING_INSPECTION' | 'IN_PROCESS_INSPECTION' | 'FINAL_INSPECTION' | 'SUPPLIER' | 'PRODUCTION' | 'CUSTOMER' | 'OTHER';
export type NCRStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'ACTION_REQUIRED' | 'IN_PROGRESS' | 'VERIFICATION' | 'CLOSED' | 'CANCELLED';

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
  status: NCRStatus;
  assigned_to?: string;
  root_cause?: string;
  corrective_action?: string;
  preventive_action?: string;
  due_date?: string;
  closed_at?: string;
  closed_by?: string;
  products?: { id: string; code: string; name: string };
  suppliers?: { id: string; supplier_code: string; company_name: string };
  quality_inspections?: { id: string; inspection_number: string };
  assigned_profile?: { id: string; first_name: string; last_name: string; email: string };
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
}
