export type WorkCenterStatus = 'ACTIVE' | 'INACTIVE';

export type MachineStatus = 'AVAILABLE' | 'RUNNING' | 'MAINTENANCE' | 'BREAKDOWN' | 'INACTIVE';

export type BOMStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OBSOLETE';

export type RoutingStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OBSOLETE';

export type ProductionOrderStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'RELEASED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED';

export type ProductionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type OperationStatus =
  | 'PENDING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'CANCELLED';

export interface WorkCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  type?: string;
  capacity: number;
  status: WorkCenterStatus;
  machine_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Machine {
  id: string;
  code: string;
  name: string;
  machine_type: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  work_center_id?: string;
  work_center?: {
    id: string;
    code: string;
    name: string;
    type?: string;
  };
  status: MachineStatus;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface BOMItem {
  id: string;
  bom_id: string;
  component_id: string;
  component?: {
    id: string;
    product_code: string;
    name: string;
    unit: string;
    category?: { name: string };
  };
  quantity_per: number;
  unit: string;
  scrap_percentage: number;
  notes?: string;
  line_order: number;
}

export interface BOM {
  id: string;
  bom_number: string;
  product_id: string;
  product?: {
    id: string;
    product_code: string;
    name: string;
    unit: string;
    specifications?: string;
    category?: { name: string };
  };
  version: string;
  status: BOMStatus;
  description?: string;
  effective_from?: string;
  effective_to?: string;
  items?: BOMItem[];
  created_by?: string;
  created_by_profile?: { full_name: string };
  created_at: string;
  updated_at: string;
}

export interface RoutingOperation {
  id: string;
  routing_id: string;
  sequence: number;
  operation_name: string;
  work_center_id?: string;
  work_center?: { id: string; code: string; name: string };
  machine_id?: string;
  machine?: { id: string; code: string; name: string };
  setup_time_mins: number;
  run_time_mins: number;
  description?: string;
}

export interface Routing {
  id: string;
  routing_number: string;
  product_id: string;
  product?: {
    id: string;
    product_code: string;
    name: string;
    unit: string;
    category?: { name: string };
  };
  version: string;
  status: RoutingStatus;
  description?: string;
  operations?: RoutingOperation[];
  created_by?: string;
  created_by_profile?: { full_name: string };
  created_at: string;
  updated_at: string;
}

export interface ProductionOperation {
  id: string;
  production_order_id: string;
  routing_operation_id?: string;
  sequence: number;
  operation_name: string;
  work_center_id?: string;
  work_center?: { id: string; code: string; name: string };
  machine_id?: string;
  machine?: { id: string; code: string; name: string };
  operator_id?: string;
  operator?: { id: string; full_name: string };
  planned_quantity: number;
  completed_quantity: number;
  rejected_quantity: number;
  status: OperationStatus;
  planned_start?: string;
  planned_end?: string;
  actual_start?: string;
  actual_end?: string;
  notes?: string;
}

export interface MaterialRequirement {
  id: string;
  component_id: string;
  component_code?: string;
  component_name?: string;
  unit: string;
  quantity_per: number;
  scrap_percentage: number;
  required_quantity: number;
  available_quantity: number;
  shortage_quantity: number;
}

export interface MaterialConsumption {
  id: string;
  production_order_id: string;
  product_id: string;
  product?: { id: string; product_code: string; name: string; unit: string };
  warehouse_id: string;
  warehouse?: { id: string; code: string; name: string };
  location_id?: string;
  location?: { id: string; code: string; name: string };
  quantity: number;
  unit: string;
  consumed_by_profile?: { full_name: string };
  consumed_at: string;
  notes?: string;
}

export interface ProductionOutput {
  id: string;
  production_order_id: string;
  product_id: string;
  product?: { id: string; product_code: string; name: string; unit: string };
  quantity: number;
  rejected_quantity: number;
  warehouse_id: string;
  warehouse?: { id: string; code: string; name: string };
  location_id?: string;
  location?: { id: string; code: string; name: string };
  produced_by_profile?: { full_name: string };
  produced_at: string;
  notes?: string;
}

export interface ProductionActivity {
  id: string;
  production_order_id: string;
  actor_name?: string;
  activity_type: string;
  description: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface ProductionOrder {
  id: string;
  production_order_number: string;
  sales_order_id?: string;
  sales_order?: {
    id: string;
    order_number: string;
    order_date?: string;
    requested_delivery_date?: string;
    customer?: { id: string; company_name: string; customer_code?: string };
  };
  product_id: string;
  product?: {
    id: string;
    product_code: string;
    name: string;
    unit: string;
    category?: { name: string };
  };
  bom_id?: string;
  bom?: { id: string; bom_number: string; version: string; status: string };
  routing_id?: string;
  routing?: { id: string; routing_number: string; version: string; status: string };
  planned_quantity: number;
  completed_quantity: number;
  rejected_quantity: number;
  priority: ProductionPriority;
  status: ProductionOrderStatus;
  planned_start?: string;
  planned_end?: string;
  actual_start?: string;
  actual_end?: string;
  notes?: string;
  operations?: ProductionOperation[];
  material_requirements?: MaterialRequirement[];
  has_material_shortage?: boolean;
  consumptions?: MaterialConsumption[];
  outputs?: ProductionOutput[];
  activities?: ProductionActivity[];
  created_by_profile?: { full_name: string };
  created_at: string;
  updated_at: string;
}

export interface ProductionFilterParams {
  search?: string;
  status?: string;
  priority?: string;
  product_id?: string;
  sales_order_id?: string;
  page?: number;
  limit?: number;
}

export interface ProductionSummary {
  total_orders: number;
  planned_count: number;
  in_progress_count: number;
  completed_count: number;
  on_hold_count: number;
  running_machines: number;
  total_machines: number;
}

export interface CreateWorkCenterPayload {
  code: string;
  name: string;
  description?: string;
  type?: string;
  capacity?: number;
  status?: WorkCenterStatus;
}

export interface CreateMachinePayload {
  code: string;
  name: string;
  machine_type: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  work_center_id?: string;
  status?: MachineStatus;
  description?: string;
}

export interface CreateBOMPayload {
  product_id: string;
  version?: string;
  description?: string;
  effective_from?: string;
  effective_to?: string;
  items: Array<{
    component_id: string;
    quantity_per: number;
    unit?: string;
    scrap_percentage?: number;
    notes?: string;
  }>;
}

export interface CreateRoutingPayload {
  product_id: string;
  version?: string;
  description?: string;
  operations: Array<{
    sequence?: number;
    operation_name: string;
    work_center_id?: string;
    machine_id?: string;
    setup_time_mins?: number;
    run_time_mins?: number;
    description?: string;
  }>;
}

export interface CreateProductionOrderPayload {
  sales_order_id?: string;
  product_id: string;
  bom_id?: string;
  routing_id?: string;
  planned_quantity: number;
  priority?: ProductionPriority;
  planned_start?: string;
  planned_end?: string;
  notes?: string;
}

export interface RecordMaterialConsumptionPayload {
  product_id: string;
  warehouse_id: string;
  location_id?: string;
  quantity: number;
  notes?: string;
}

export interface RecordProductionOutputPayload {
  warehouse_id: string;
  location_id?: string;
  quantity: number;
  rejected_quantity?: number;
  notes?: string;
}
