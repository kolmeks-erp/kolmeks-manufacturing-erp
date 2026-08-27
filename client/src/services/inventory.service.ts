import { apiClient } from './api';
import {
  InventoryItem,
  InventorySummary,
  StockMovement,
  StockAdjustmentPayload,
  StockTransferPayload,
  InventoryFilterParams,
  MovementFilterParams,
} from '../types/inventory';

export const inventoryService = {
  /**
   * Fetch paginated inventory balances list
   */
  async getInventory(params?: InventoryFilterParams): Promise<{
    success: boolean;
    data: InventoryItem[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const response = await apiClient.get('/inventory', { params });
    return response.data;
  },

  /**
   * Get summary telemetry metrics for inventory dashboard
   */
  async getInventorySummary(): Promise<{ success: boolean; data: InventorySummary }> {
    const response = await apiClient.get('/inventory/summary');
    return response.data;
  },

  /**
   * Get detailed stock breakdown for a product across warehouses/locations with recent movements
   */
  async getInventoryByProduct(productId: string): Promise<{
    success: boolean;
    data: {
      product: any;
      totalOnHand: number;
      totalReserved: number;
      totalAvailable: number;
      warehouseBreakdown: InventoryItem[];
      recentMovements: StockMovement[];
    };
  }> {
    const response = await apiClient.get(`/inventory/${productId}`);
    return response.data;
  },

  /**
   * Get stock movement transaction history
   */
  async getStockMovements(params?: MovementFilterParams): Promise<{
    success: boolean;
    data: StockMovement[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const response = await apiClient.get('/inventory/movements', { params });
    return response.data;
  },

  /**
   * Submit a controlled stock adjustment (IN or OUT)
   */
  async createStockAdjustment(
    payload: StockAdjustmentPayload
  ): Promise<{ success: boolean; message: string; data: { transaction: StockMovement; previousOnHand: number; newOnHand: number } }> {
    const response = await apiClient.post('/inventory/adjustments', payload);
    return response.data;
  },

  /**
   * Submit an inter-warehouse / location stock transfer
   */
  async createStockTransfer(
    payload: StockTransferPayload
  ): Promise<{ success: boolean; message: string; data: { transferRefId: string; sourceNewOnHand: number; destinationNewOnHand: number } }> {
    const response = await apiClient.post('/inventory/transfers', payload);
    return response.data;
  },
};
