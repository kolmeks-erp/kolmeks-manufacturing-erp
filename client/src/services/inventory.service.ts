import api from './api';

export interface ProductMaster {
  id: string;
  product_code: string;
  name: string;
  unit: string;
  drawing_number?: string;
  minimum_stock?: number;
  categories?: { id: string; name: string };
  materials?: { id: string; name: string; material_code: string };
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  description?: string;
  status: 'active' | 'inactive';
  storage_locations?: StorageLocation[];
}

export interface StorageLocation {
  id: string;
  warehouse_id: string;
  location_code: string;
  name: string;
  description?: string;
  location_type: 'RECEIVING' | 'STORAGE' | 'WIP' | 'FINISHED_GOODS' | 'QUARANTINE' | 'SCRAP' | 'OTHER';
  status: 'active' | 'inactive';
}

export interface InventoryBalance {
  id: string;
  product_id: string;
  warehouse_id: string;
  location_id?: string;
  on_hand_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  quarantined_quantity?: number;
  rejected_quantity?: number;
  damaged_quantity?: number;
  minimum_stock?: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  products?: ProductMaster;
  warehouses?: Warehouse;
  storage_locations?: StorageLocation;
  updated_at: string;
}

export interface InventorySummary {
  totalStockItems: number;
  totalOnHandUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeWarehouses: number;
}

export interface InventoryTransaction {
  id: string;
  transaction_number: string;
  product_id: string;
  warehouse_id: string;
  location_id?: string;
  movement_type:
    | 'RECEIPT'
    | 'ADJUSTMENT_IN'
    | 'ADJUSTMENT_OUT'
    | 'TRANSFER_IN'
    | 'TRANSFER_OUT'
    | 'PRODUCTION_CONSUMPTION'
    | 'PRODUCTION_OUTPUT'
    | 'SALES_ISSUE';
  quantity: number;
  unit: string;
  reference_type?: string;
  reference_id?: string;
  reason?: string;
  notes?: string;
  transaction_date: string;
  products?: ProductMaster;
  warehouses?: Warehouse;
  storage_locations?: StorageLocation;
  profiles?: { id: string; full_name: string; email: string };
}

export interface StockTransfer {
  id: string;
  transfer_number: string;
  source_warehouse_id: string;
  source_location_id?: string;
  destination_warehouse_id: string;
  destination_location_id?: string;
  product_id: string;
  quantity: number;
  status: 'DRAFT' | 'REQUESTED' | 'APPROVED' | 'TRANSFERRED_OUT' | 'COMPLETED' | 'CANCELLED';
  reason: string;
  created_at: string;
  products?: ProductMaster;
  source_warehouse?: Warehouse;
  destination_warehouse?: Warehouse;
  source_location?: StorageLocation;
  destination_location?: StorageLocation;
  requested_by_profile?: { id: string; full_name: string; email: string };
}

export interface StockAdjustment {
  id: string;
  adjustment_number: string;
  product_id: string;
  warehouse_id: string;
  location_id?: string;
  expected_quantity: number;
  counted_quantity: number;
  variance_quantity: number;
  adjustment_type: 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';
  reason: string;
  notes?: string;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'POSTED' | 'REJECTED';
  created_at: string;
  products?: ProductMaster;
  warehouses?: Warehouse;
  storage_locations?: StorageLocation;
  requested_by_profile?: { id: string; full_name: string; email: string };
}

export interface StockReservation {
  id: string;
  reservation_number: string;
  product_id: string;
  warehouse_id: string;
  location_id?: string;
  quantity: number;
  fulfilled_quantity: number;
  reference_type: 'SALES_ORDER' | 'PRODUCTION_ORDER' | 'INTERNAL' | 'OTHER';
  reference_id?: string;
  status: 'DRAFT' | 'RESERVED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'RELEASED' | 'CANCELLED';
  created_at: string;
  products?: ProductMaster;
  warehouses?: Warehouse;
  storage_locations?: StorageLocation;
  created_by_profile?: { id: string; full_name: string; email: string };
}

export interface StockBatch {
  id: string;
  batch_number: string;
  product_id: string;
  warehouse_id: string;
  manufacture_date?: string;
  expiry_date?: string;
  supplier_id?: string;
  quantity: number;
  status: 'AVAILABLE' | 'QUARANTINED' | 'EXPIRED' | 'REJECTED' | 'BLOCKED' | 'CONSUMED';
  created_at: string;
  products?: ProductMaster;
  warehouses?: Warehouse;
  suppliers?: { id: string; company_name: string };
}

export interface StockSerial {
  id: string;
  serial_number: string;
  product_id: string;
  warehouse_id: string;
  location_id?: string;
  batch_id?: string;
  status: 'IN_STOCK' | 'RESERVED' | 'ISSUED' | 'IN_PRODUCTION' | 'UNDER_MAINTENANCE' | 'SOLD' | 'SCRAPPED' | 'RETURNED';
  notes?: string;
  created_at: string;
  products?: ProductMaster;
  warehouses?: Warehouse;
  storage_locations?: StorageLocation;
  stock_batches?: { id: string; batch_number: string };
}

export interface ReorderDashboardItem {
  product: ProductMaster;
  on_hand: number;
  reserved: number;
  available: number;
  minimum_stock: number;
  reorder_point: number;
  safety_stock: number;
  reorder_quantity: number;
  status: 'HEALTHY' | 'REORDER_NEEDED' | 'CRITICAL_SAFETY_BREACH' | 'OUT_OF_STOCK';
  suggested_order_qty: number;
}

export interface ReorderDashboardResponse {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  healthyCount: number;
  items: ReorderDashboardItem[];
}

export interface ATPResponse {
  product_id: string;
  warehouse_id: string;
  onHand: number;
  reserved: number;
  quarantined: number;
  netAvailable: number;
  expectedIncoming: number;
  atp: number;
}

export interface InventoryValuationResponse {
  totalValuation: number;
  totalItemsCount: number;
  warehouseValuation: { name: string; value: number }[];
  categoryValuation: { name: string; value: number }[];
}

class InventoryService {
  async getInventory(params?: {
    page?: number;
    limit?: number;
    search?: string;
    warehouse_id?: string;
    location_id?: string;
    category_id?: string;
    stock_status?: string;
    sort_by?: string;
    order?: string;
  }) {
    const response = await api.get('/inventory', { params });
    return response.data;
  }

  async getInventorySummary() {
    const response = await api.get('/inventory/summary');
    return response.data;
  }

  async getInventoryByProduct(productId: string) {
    const response = await api.get(`/inventory/${productId}`);
    return response.data;
  }

  async getAvailableToPromise(productId: string, warehouseId?: string) {
    const response = await api.get('/inventory/atp', {
      params: { product_id: productId, warehouse_id: warehouseId },
    });
    return response.data;
  }

  async getStockMovements(params?: {
    page?: number;
    limit?: number;
    search?: string;
    movement_type?: string;
    warehouse_id?: string;
    product_id?: string;
  }) {
    const response = await api.get('/inventory/movements', { params });
    return response.data;
  }

  async getStockTransfers(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const response = await api.get('/inventory/transfers', { params });
    return response.data;
  }

  async createStockTransfer(payload: {
    product_id: string;
    source_warehouse_id: string;
    source_location_id?: string;
    destination_warehouse_id: string;
    destination_location_id?: string;
    quantity: number;
    reason: string;
    notes?: string;
  }) {
    const response = await api.post('/inventory/transfers', payload);
    return response.data;
  }

  async getStockAdjustments(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const response = await api.get('/inventory/adjustments', { params });
    return response.data;
  }

  async createStockAdjustment(payload: {
    product_id: string;
    warehouse_id: string;
    location_id?: string;
    expected_quantity: number;
    counted_quantity: number;
    reason: string;
    notes?: string;
  }) {
    const response = await api.post('/inventory/adjustments/create', payload);
    return response.data;
  }

  async getStockReservations(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const response = await api.get('/inventory/reservations', { params });
    return response.data;
  }

  async createStockReservation(payload: {
    product_id: string;
    warehouse_id: string;
    location_id?: string;
    quantity: number;
    reference_type: string;
    reference_id?: string;
  }) {
    const response = await api.post('/inventory/reservations', payload);
    return response.data;
  }

  async releaseStockReservation(id: string) {
    const response = await api.post(`/inventory/reservations/${id}/release`);
    return response.data;
  }

  async getBatches(params?: { page?: number; limit?: number; search?: string; status?: string; product_id?: string }) {
    const response = await api.get('/inventory/batches', { params });
    return response.data;
  }

  async createBatch(payload: {
    product_id: string;
    warehouse_id: string;
    manufacture_date?: string;
    expiry_date?: string;
    supplier_id?: string;
    quantity: number;
    status?: string;
  }) {
    const response = await api.post('/inventory/batches', payload);
    return response.data;
  }

  async getSerialNumbers(params?: { page?: number; limit?: number; search?: string; status?: string; product_id?: string }) {
    const response = await api.get('/inventory/serial-numbers', { params });
    return response.data;
  }

  async createSerialNumber(payload: {
    serial_number: string;
    product_id: string;
    warehouse_id: string;
    location_id?: string;
    batch_id?: string;
    status?: string;
    notes?: string;
  }) {
    const response = await api.post('/inventory/serial-numbers', payload);
    return response.data;
  }

  async getReorderDashboard() {
    const response = await api.get('/inventory/reorder');
    return response.data;
  }

  async upsertReorderLevel(payload: {
    product_id: string;
    warehouse_id: string;
    minimum_stock: number;
    reorder_point: number;
    safety_stock: number;
    reorder_quantity: number;
  }) {
    const response = await api.post('/inventory/reorder', payload);
    return response.data;
  }

  async getInventoryValuation() {
    const response = await api.get('/inventory/valuation');
    return response.data;
  }

  async getWarehouses() {
    const response = await api.get('/warehouses');
    return response.data;
  }

  async getWarehouseById(id: string) {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  }

  async getStorageLocations(warehouseId?: string) {
    const response = await api.get('/warehouses/locations', { params: { warehouse_id: warehouseId } });
    return response.data;
  }

  async createStorageLocation(payload: {
    warehouse_id: string;
    location_code: string;
    name: string;
    description?: string;
    location_type?: string;
  }) {
    const response = await api.post('/warehouses/locations', payload);
    return response.data;
  }
}

const instance = new InventoryService();
export const inventoryService = instance;
export default instance;
