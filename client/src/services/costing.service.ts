import api from './api';

export interface ManufacturingCost {
  id: string;
  costing_number: string;
  production_order_id: string;
  product_id: string;
  cost_center_id?: string;
  planned_quantity: number;
  completed_quantity: number;
  wip_quantity: number;
  material_cost: number;
  labor_cost: number;
  overhead_cost: number;
  total_cost: number;
  unit_cost: number;
  planned_material_cost: number;
  planned_labor_cost: number;
  planned_overhead_cost: number;
  planned_total_cost: number;
  material_variance: number;
  labor_variance: number;
  overhead_variance: number;
  total_variance: number;
  total_variance_pct: number;
  status: 'DRAFT' | 'CALCULATED' | 'REVIEW' | 'POSTED' | 'CLOSED' | 'VOIDED';
  costing_method: string;
  calculated_at?: string;
  posted_at?: string;
  journal_entry_id?: string;
  notes?: string;
  product?: {
    id: string;
    product_code: string;
    name: string;
    unit?: string;
    price?: number;
    cost_price?: number;
  };
  order?: {
    id: string;
    production_order_number: string;
  };
}

export interface CostComponent {
  id: string;
  manufacturing_cost_id: string;
  component_type: 'MATERIAL' | 'LABOR' | 'OVERHEAD';
  description: string;
  planned_quantity: number;
  actual_quantity: number;
  unit_of_measure: string;
  unit_rate: number;
  planned_cost: number;
  actual_cost: number;
  variance: number;
}

export interface WIPRecord {
  id: string;
  wip_number: string;
  production_order_id: string;
  product_id: string;
  wip_quantity: number;
  material_wip: number;
  labor_wip: number;
  overhead_wip: number;
  total_wip: number;
  as_of_date: string;
  status: 'OPEN' | 'PARTIALLY_COMPLETED' | 'COMPLETED' | 'CLOSED';
  age_days?: number;
  product?: {
    id: string;
    product_code: string;
    name: string;
    unit?: string;
  };
  production_order?: {
    id: string;
    production_order_number: string;
    planned_quantity: number;
    completed_quantity: number;
    status: string;
    actual_start?: string;
  };
}

export interface CostingConfiguration {
  id?: string;
  costing_method: 'ACTUAL_COST' | 'STANDARD_COST';
  default_hourly_labor_rate: number;
  default_hourly_overhead_rate: number;
  overhead_allocation_basis: 'PER_HOUR' | 'PER_UNIT' | 'PERCENT_DIRECT_LABOR';
  raw_material_account_id?: string;
  wip_account_id?: string;
  finished_goods_account_id?: string;
  labor_cost_account_id?: string;
  overhead_cost_account_id?: string;
  variance_account_id?: string;
  raw_material_account?: { id: string; account_code: string; account_name: string };
  wip_account?: { id: string; account_code: string; account_name: string };
  finished_goods_account?: { id: string; account_code: string; account_name: string };
  labor_cost_account?: { id: string; account_code: string; account_name: string };
  overhead_cost_account?: { id: string; account_code: string; account_name: string };
  variance_account?: { id: string; account_code: string; account_name: string };
}

class CostingService {
  async getDashboard() {
    const response = await api.get('/production/costing/dashboard');
    return response.data;
  }

  async getProductionCostOrders(params?: { page?: number; limit?: number; search?: string; status?: string; product_id?: string }) {
    const response = await api.get('/production/costing/orders', { params });
    return response.data;
  }

  async getProductionCostOrderById(id: string) {
    const response = await api.get(`/production/costing/orders/${id}`);
    return response.data;
  }

  async calculateCost(id: string) {
    const response = await api.post(`/production/costing/orders/${id}/calculate`);
    return response.data;
  }

  async postCost(id: string) {
    const response = await api.post(`/production/costing/orders/${id}/post`);
    return response.data;
  }

  async getWIPRecords(params?: { search?: string; status?: string; product_id?: string }) {
    const response = await api.get('/production/wip', { params });
    return response.data;
  }

  async closeWIPRecord(id: string) {
    const response = await api.post(`/production/wip/${id}/close`);
    return response.data;
  }

  async getVariances(params?: { search?: string; product_id?: string }) {
    const response = await api.get('/production/costing/variance', { params });
    return response.data;
  }

  async getConfiguration() {
    const response = await api.get('/production/costing/configuration');
    return response.data;
  }

  async updateConfiguration(payload: Partial<CostingConfiguration> & { wc_rates?: any[] }) {
    const response = await api.patch('/production/costing/configuration', payload);
    return response.data;
  }

  async getReports(params?: { report_type?: string }) {
    const response = await api.get('/production/costing/reports', { params });
    return response.data;
  }
}

const instance = new CostingService();
export const costingService = instance;
export default instance;
