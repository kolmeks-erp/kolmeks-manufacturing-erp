import { apiClient } from './api';
import { Warehouse, StorageLocation } from '../types/inventory';

export const warehouseService = {
  /**
   * Get all warehouses
   */
  async getWarehouses(params?: { search?: string; status?: string }): Promise<{ success: boolean; data: Warehouse[]; count: number }> {
    const response = await apiClient.get('/warehouses', { params });
    return response.data;
  },

  /**
   * Get single warehouse detail with storage locations and stock items
   */
  async getWarehouseById(id: string): Promise<{ success: boolean; data: Warehouse }> {
    const response = await apiClient.get(`/warehouses/${id}`);
    return response.data;
  },

  /**
   * Create new warehouse
   */
  async createWarehouse(data: {
    code: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    status?: 'active' | 'inactive';
  }): Promise<{ success: boolean; message: string; data: Warehouse }> {
    const response = await apiClient.post('/warehouses', data);
    return response.data;
  },

  /**
   * Update warehouse details
   */
  async updateWarehouse(
    id: string,
    data: Partial<Warehouse>
  ): Promise<{ success: boolean; message: string; data: Warehouse }> {
    const response = await apiClient.patch(`/warehouses/${id}`, data);
    return response.data;
  },

  /**
   * Toggle warehouse status (active/inactive)
   */
  async toggleWarehouseStatus(
    id: string,
    status: 'active' | 'inactive'
  ): Promise<{ success: boolean; message: string; data: Warehouse }> {
    const response = await apiClient.patch(`/warehouses/${id}/status`, { status });
    return response.data;
  },

  /**
   * Get storage locations for a warehouse
   */
  async getWarehouseLocations(warehouseId: string): Promise<{ success: boolean; data: StorageLocation[] }> {
    const response = await apiClient.get(`/warehouses/${warehouseId}/locations`);
    return response.data;
  },

  /**
   * Create storage location for a warehouse
   */
  async createWarehouseLocation(
    warehouseId: string,
    data: { location_code: string; name: string; description?: string; status?: 'active' | 'inactive' }
  ): Promise<{ success: boolean; message: string; data: StorageLocation }> {
    const response = await apiClient.post(`/warehouses/${warehouseId}/locations`, data);
    return response.data;
  },

  /**
   * Update storage location
   */
  async updateWarehouseLocation(
    warehouseId: string,
    locationId: string,
    data: Partial<StorageLocation>
  ): Promise<{ success: boolean; message: string; data: StorageLocation }> {
    const response = await apiClient.patch(`/warehouses/${warehouseId}/locations/${locationId}`, data);
    return response.data;
  },
};
