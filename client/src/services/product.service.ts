import axios from 'axios';
import { supabase } from './supabase';
import {
  Product,
  ProductCategory,
  ProductFilters,
  ProductFormData,
  CategoryFormData,
  ProductListResponse,
  CategoryListResponse,
  ProductStatus,
  CategoryStatus,
} from '../types/product';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get authenticated header containing Supabase JWT session token
 */
const getAuthHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    headers: {
      Authorization: `Bearer ${token || ''}`,
      'Content-Type': 'application/json',
    },
  };
};

export class ProductService {
  /**
   * Fetch paginated products list with search, filtering and sorting
   */
  static async getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.product_type) params.append('product_type', filters.product_type);
    if (filters.status) params.append('status', filters.status);
    if (filters.material) params.append('material', filters.material);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await axios.get(`${API_URL}/products?${params.toString()}`, headers);
    return response.data;
  }

  /**
   * Fetch single product profile details by ID
   */
  static async getProductById(id: string): Promise<Product> {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/products/${id}`, headers);
    return response.data.data;
  }

  /**
   * Create a new product record
   */
  static async createProduct(payload: ProductFormData): Promise<Product> {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/products`, payload, headers);
    return response.data.data;
  }

  /**
   * Update existing product record
   */
  static async updateProduct(id: string, payload: Partial<ProductFormData>): Promise<Product> {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/products/${id}`, payload, headers);
    return response.data.data;
  }

  /**
   * Change product status (active/inactive/discontinued)
   */
  static async patchProductStatus(id: string, status: ProductStatus): Promise<Product> {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/products/${id}/status`, { status }, headers);
    return response.data.data;
  }

  /**
   * Fetch all product categories with product counts
   */
  static async getCategories(): Promise<ProductCategory[]> {
    const headers = await getAuthHeaders();
    const response = await axios.get<CategoryListResponse>(`${API_URL}/products/categories`, headers);
    return response.data.data || [];
  }

  /**
   * Create a new product category
   */
  static async createCategory(payload: CategoryFormData): Promise<ProductCategory> {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/products/categories`, payload, headers);
    return response.data.data;
  }

  /**
   * Update product category
   */
  static async updateCategory(id: string, payload: Partial<CategoryFormData>): Promise<ProductCategory> {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/products/categories/${id}`, payload, headers);
    return response.data.data;
  }

  /**
   * Activate / Deactivate product category
   */
  static async patchCategoryStatus(id: string, status: CategoryStatus): Promise<ProductCategory> {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/products/categories/${id}/status`, { status }, headers);
    return response.data.data;
  }
}
