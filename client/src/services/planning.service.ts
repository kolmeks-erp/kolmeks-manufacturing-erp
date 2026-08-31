import api from './api';

export interface ProductionPlanLine {
  id?: string;
  production_plan_id?: string;
  line_number?: number;
  product_id: string;
  planned_quantity: number;
  scheduled_quantity?: number;
  completed_quantity?: number;
  required_date: string;
  demand_source?: 'SALES_ORDER' | 'FORECAST' | 'MANUAL';
  sales_order_id?: string;
  sales_order_item_id?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  production_order_id?: string;
  status?: 'PLANNED' | 'SCHEDULED' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  product?: {
    id: string;
    product_code: string;
    name: string;
    unit?: string;
  };
  sales_order?: {
    id: string;
    order_number: string;
    customer_id?: string;
  };
  production_order?: {
    id: string;
    production_order_number: string;
    status: string;
    planned_quantity: number;
    completed_quantity: number;
  };
}

export interface ProductionPlan {
  id: string;
  plan_number: string;
  plan_name: string;
  period_type: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'CUSTOM';
  start_date: string;
  end_date: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
  created_by_profile?: { id: string; full_name: string; email: string };
  approved_by_profile?: { id: string; full_name: string; email: string };
  lines?: ProductionPlanLine[];
}

export interface MaterialRequirement {
  component_id: string;
  component_code: string;
  component_name: string;
  unit: string;
  gross_requirement: number;
  on_hand_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  shortage_quantity: number;
  status: 'AVAILABLE' | 'PARTIAL' | 'SHORTAGE' | 'UNKNOWN';
}

export interface WorkCenterCapacity {
  work_center_id: string;
  code: string;
  name: string;
  type: string;
  machines: any[];
  days_in_period: number;
  total_available_hours: number;
  maintenance_downtime_hours: number;
  net_available_hours: number;
  scheduled_hours: number;
  utilization_pct: number;
  status: 'NORMAL' | 'HIGH_LOAD' | 'OVER_CAPACITY';
}

export interface WorkOrderSchedule {
  id: string;
  schedule_number: string;
  production_order_id: string;
  production_operation_id?: string;
  work_center_id: string;
  machine_id?: string;
  planned_start: string;
  planned_end: string;
  actual_start?: string;
  actual_end?: string;
  setup_time_hours: number;
  run_time_hours: number;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CONFLICTED' | 'RESCHEDULED' | 'CANCELLED';
  notes?: string;
  production_order?: {
    id: string;
    production_order_number: string;
    product?: { id: string; product_code: string; name: string };
  };
  work_center?: { id: string; code: string; name: string };
  machine?: { id: string; code: string; name: string };
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  work_center?: string;
  machine?: string;
  status: string;
  priority: string;
  details: WorkOrderSchedule;
}

class PlanningService {
  async getDashboard() {
    const response = await api.get('/production/planning/dashboard');
    return response.data;
  }

  async getPlans(params?: { search?: string; status?: string; period_type?: string; start_date?: string; end_date?: string }) {
    const response = await api.get('/production/planning/plans', { params });
    return response.data;
  }

  async getPlanById(id: string) {
    const response = await api.get(`/production/planning/plans/${id}`);
    return response.data;
  }

  async createPlan(payload: {
    plan_name: string;
    period_type?: string;
    start_date: string;
    end_date: string;
    description?: string;
    lines?: Partial<ProductionPlanLine>[];
  }) {
    const response = await api.post('/production/planning/plans', payload);
    return response.data;
  }

  async updatePlan(id: string, payload: Partial<ProductionPlan> & { lines?: Partial<ProductionPlanLine>[] }) {
    const response = await api.patch(`/production/planning/plans/${id}`, payload);
    return response.data;
  }

  async submitPlan(id: string) {
    const response = await api.post(`/production/planning/plans/${id}/submit`);
    return response.data;
  }

  async approvePlan(id: string) {
    const response = await api.post(`/production/planning/plans/${id}/approve`);
    return response.data;
  }

  async cancelPlan(id: string) {
    const response = await api.post(`/production/planning/plans/${id}/cancel`);
    return response.data;
  }

  async generateOrdersFromPlan(id: string) {
    const response = await api.post(`/production/planning/plans/${id}/generate-orders`);
    return response.data;
  }

  async getMaterialRequirements(params?: { plan_id?: string; start_date?: string; end_date?: string }) {
    const response = await api.get('/production/planning/materials', { params });
    return response.data;
  }

  async getCapacityPlanning(params?: { start_date?: string; end_date?: string }) {
    const response = await api.get('/production/planning/capacity', { params });
    return response.data;
  }

  async getSchedules(params?: { search?: string; work_center_id?: string; machine_id?: string; status?: string; start_date?: string; end_date?: string }) {
    const response = await api.get('/production/planning/schedule', { params });
    return response.data;
  }

  async createSchedule(payload: Partial<WorkOrderSchedule>) {
    const response = await api.post('/production/planning/schedule', payload);
    return response.data;
  }

  async rescheduleWorkOrder(id: string, payload: {
    new_planned_start?: string;
    new_planned_end?: string;
    new_work_center_id?: string;
    new_machine_id?: string;
    reason?: string;
  }) {
    const response = await api.post(`/production/planning/schedule/${id}/reschedule`, payload);
    return response.data;
  }

  async getCalendarEvents(params?: { start_date?: string; end_date?: string }) {
    const response = await api.get('/production/planning/calendar', { params });
    return response.data;
  }

  async getReports(params?: { plan_id?: string }) {
    const response = await api.get('/production/planning/reports', { params });
    return response.data;
  }
}

const instance = new PlanningService();
export const planningService = instance;
export default instance;
