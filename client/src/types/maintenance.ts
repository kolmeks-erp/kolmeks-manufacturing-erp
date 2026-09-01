export type AssetType = 
  | 'CNC_MACHINE'
  | 'MILLING_MACHINE'
  | 'TURNING_MACHINE'
  | 'GRINDING_MACHINE'
  | 'COMPRESSOR'
  | 'ELECTRICAL'
  | 'INSPECTION_EQUIPMENT'
  | 'MATERIAL_HANDLING'
  | 'OTHER';

export type AssetStatus = 
  | 'ACTIVE'
  | 'AVAILABLE'
  | 'RUNNING'
  | 'UNDER_MAINTENANCE'
  | 'BREAKDOWN'
  | 'INACTIVE'
  | 'RETIRED';

export type AssetCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type MaintenanceType = 
  | 'PREVENTIVE'
  | 'CORRECTIVE'
  | 'INSPECTION'
  | 'CALIBRATION'
  | 'LUBRICATION'
  | 'CLEANING'
  | 'OTHER';

export type FrequencyType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM_DAYS';

export type ScheduleStatus = 'ACTIVE' | 'INACTIVE' | 'OVERDUE' | 'COMPLETED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type RequestStatus = 'OPEN' | 'REVIEWED' | 'APPROVED' | 'CONVERTED_TO_WORK_ORDER' | 'CANCELLED';

export type WorkOrderStatus = 'DRAFT' | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export type DowntimeStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Asset {
  id: string;
  asset_code: string;
  name: string;
  asset_type: AssetType;
  machine_id?: string;
  work_center_id?: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  installation_date?: string;
  location?: string;
  status: AssetStatus;
  criticality: AssetCriticality;
  description?: string;
  machines?: { id: string; code: string; name: string };
  work_centers?: { id: string; code: string; name: string };
  schedules?: MaintenanceSchedule[];
  workOrders?: WorkOrder[];
  downtimes?: DowntimeLog[];
  activities?: MaintenanceActivity[];
  created_at: string;
  updated_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  schedule_number: string;
  asset_id: string;
  maintenance_type: MaintenanceType;
  title: string;
  description?: string;
  frequency_type: FrequencyType;
  frequency_value: number;
  last_completed_date?: string;
  next_due_date: string;
  assigned_to?: string;
  priority: Priority;
  status: ScheduleStatus;
  assets?: { id: string; asset_code: string; name: string; location?: string };
  assigned_profile?: { id: string; first_name: string; last_name: string; email: string };
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: string;
  request_number: string;
  asset_id: string;
  issue: string;
  priority: Priority;
  reported_by?: string;
  reported_date: string;
  description: string;
  status: RequestStatus;
  assets?: { id: string; asset_code: string; name: string; location?: string };
  reported_profile?: { id: string; first_name: string; last_name: string; email: string };
  created_at: string;
  updated_at: string;
}

export interface WorkOrderChecklist {
  id: string;
  work_order_id: string;
  title: string;
  description?: string;
  sequence: number;
  required: boolean;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
  notes?: string;
}

export interface SparePartUsed {
  id: string;
  work_order_id: string;
  product_id: string;
  warehouse_id: string;
  location_id?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  inventory_transaction_id?: string;
  used_by?: string;
  used_at: string;
  notes?: string;
  products?: { id: string; code: string; name: string };
  warehouses?: { id: string; code: string; name: string };
  storage_locations?: { id: string; location_code: string; name: string };
}

export interface DowntimeLog {
  id: string;
  asset_id: string;
  work_order_id?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  reason: string;
  status: DowntimeStatus;
  notes?: string;
  assets?: { id: string; asset_code: string; name: string; location?: string };
  maintenance_work_orders?: { id: string; work_order_number: string; title: string };
  created_at: string;
}

export interface MaintenanceActivity {
  id: string;
  asset_id?: string;
  work_order_id?: string;
  schedule_id?: string;
  request_id?: string;
  actor_id?: string;
  actor_name?: string;
  activity_type: string;
  description: string;
  created_at: string;
}

export interface WorkOrder {
  id: string;
  work_order_number: string;
  asset_id: string;
  maintenance_schedule_id?: string;
  maintenance_request_id?: string;
  maintenance_type: MaintenanceType;
  title: string;
  description?: string;
  priority: Priority;
  status: WorkOrderStatus;
  assigned_to?: string;
  planned_start?: string;
  planned_end?: string;
  actual_start?: string;
  actual_end?: string;
  downtime_minutes: number;
  root_cause?: string;
  resolution?: string;
  notes?: string;
  assets?: { id: string; asset_code: string; name: string; location?: string; criticality?: AssetCriticality };
  assigned_profile?: { id: string; first_name: string; last_name: string; email: string };
  checklists?: WorkOrderChecklist[];
  parts?: SparePartUsed[];
  downtimes?: DowntimeLog[];
  activities?: MaintenanceActivity[];
  created_at: string;
  updated_at: string;
}

export interface MaintenanceKPIs {
  totalAssets: number;
  assetsUnderMaintenance: number;
  breakdownAssets: number;
  totalWorkOrders: number;
  openWorkOrders: number;
  completedWorkOrders: number;
  overduePMs: number;
  upcomingPMs: number;
  openRequests: number;
  activeDowntimeMinutes: number;
}

export type FailureType = 'MECHANICAL' | 'ELECTRICAL' | 'SOFTWARE' | 'HYDRAULIC' | 'PNEUMATIC' | 'OTHER';
export type BreakdownStatus = 'OPEN' | 'INVESTIGATING' | 'CONVERTED_TO_WORK_ORDER' | 'RESOLVED' | 'CLOSED';

export interface Breakdown {
  id: string;
  breakdown_number: string;
  asset_id: string;
  work_center_id?: string;
  production_order_id?: string;
  failure_date: string;
  failure_type: FailureType;
  severity: Priority;
  description: string;
  immediate_cause?: string;
  root_cause?: string;
  corrective_action?: string;
  preventive_action?: string;
  technician_id?: string;
  downtime_minutes: number;
  status: BreakdownStatus;
  ncr_id?: string;
  capa_id?: string;
  work_order_id?: string;
  assets?: { id: string; asset_code: string; name: string; location?: string; criticality?: AssetCriticality };
  work_centers?: { id: string; code: string; name: string };
  production_orders?: { id: string; order_number: string };
  technician_profile?: { id: string; full_name?: string; email?: string };
  created_at: string;
  updated_at: string;
}

export interface ReliabilityAnalytics {
  totalAssetsCount: number;
  totalBreakdownsCount: number;
  totalRepairsCount: number;
  totalDowntimeHours: number;
  actualOperatingHours: number;
  mtbfHours: number | null;
  mttrHours: number | null;
  availabilityPercentage: number;
  repeatedFailureAssets: Array<Asset & { failure_count: number }>;
}

export interface MaintenanceCostSummary {
  summary: {
    totalLabor: number;
    totalParts: number;
    totalService: number;
    totalOther: number;
    totalOverall: number;
  };
  workOrders: Array<{
    id: string;
    work_order_number: string;
    title: string;
    maintenance_type: string;
    status: string;
    labor_cost: number;
    parts_cost: number;
    external_service_cost: number;
    other_cost: number;
    total_cost: number;
    assets?: { id: string; asset_code: string; name: string };
    cost_centers?: { id: string; code: string; name: string; budget_amount?: number };
  }>;
}

export interface MaintenanceCalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'PREVENTIVE' | 'WORK_ORDER' | 'BREAKDOWN';
  priority: string;
  status: string;
}

