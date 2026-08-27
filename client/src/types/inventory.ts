export type WarehouseStatus = 'active' | 'inactive';
export type LocationStatus = 'active' | 'inactive';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type MovementType =
  | 'RECEIPT'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'PRODUCTION_CONSUMPTION'
  | 'PRODUCTION_OUTPUT'
  | 'SALES_ISSUE';

export interface StorageLocation {
  id: string;
  warehouse_id: string;
  location_code: string;
  name: string;
  description?: string | null;
  status: LocationStatus;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  description?: string | null;
  status: WarehouseStatus;
  location_count?: number;
  stock_item_count?: number;
  storage_locations?: StorageLocation[];
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  location_id?: string | null;
  on_hand_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  minimum_stock: number;
  status: StockStatus;
  created_at?: string;
  updated_at: string;
  products?: {
    id: string;
    product_code: string;
    name: string;
    unit: string;
    drawing_number?: string | null;
    minimum_stock?: number;
    category_id?: string;
    categories?: {
      id: string;
      name: string;
    };
  };
  warehouses?: {
    id: string;
    code: string;
    name: string;
    city?: string;
    country?: string;
  };
  storage_locations?: {
    id: string;
    location_code: string;
    name: string;
  } | null;
}

export interface StockMovement {
  id: string;
  transaction_number: string;
  product_id: string;
  warehouse_id: string;
  location_id?: string | null;
  movement_type: MovementType;
  quantity: number;
  unit: string;
  reference_type?: string | null;
  reference_id?: string | null;
  reason?: string | null;
  notes?: string | null;
  performed_by?: string | null;
  transaction_date: string;
  created_at: string;
  products?: {
    id: string;
    product_code: string;
    name: string;
    unit: string;
  };
  warehouses?: {
    id: string;
    code: string;
    name: string;
  };
  storage_locations?: {
    id: string;
    location_code: string;
    name: string;
  } | null;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

export interface InventorySummary {
  totalStockItems: number;
  totalOnHandUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeWarehouses: number;
}

export interface StockAdjustmentPayload {
  product_id: string;
  warehouse_id: string;
  location_id?: string | null;
  adjustment_type: 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockTransferPayload {
  product_id: string;
  source_warehouse_id: string;
  source_location_id?: string | null;
  destination_warehouse_id: string;
  destination_location_id?: string | null;
  quantity: number;
  reason?: string;
  notes?: string;
}

export interface InventoryFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  product_id?: string;
  warehouse_id?: string;
  location_id?: string;
  category_id?: string;
  stock_status?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

export interface MovementFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  movement_type?: string;
  warehouse_id?: string;
  product_id?: string;
  reference_type?: string;
}
