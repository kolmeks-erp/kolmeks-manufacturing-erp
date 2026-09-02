import apiClient from './api';
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

export class ProductService {
  /**
   * Fetch paginated products list with search, filtering and sorting
   */
  static async getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
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

    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data || { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  }

  /**
   * Fetch single product profile details by ID
   */
  static async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data?.data;
  }

  /**
   * Create a new product record
   */
  static async createProduct(payload: ProductFormData): Promise<Product> {
    const response = await apiClient.post('/products', payload);
    return response.data?.data;
  }

  /**
   * Update existing product record
   */
  static async updateProduct(id: string, payload: Partial<ProductFormData>): Promise<Product> {
    const response = await apiClient.patch(`/products/${id}`, payload);
    return response.data?.data;
  }

  /**
   * Change product status (active/inactive/discontinued)
   */
  static async patchProductStatus(id: string, status: ProductStatus): Promise<Product> {
    const response = await apiClient.patch(`/products/${id}/status`, { status });
    return response.data?.data;
  }

  /**
   * Fetch all product categories with product counts
   */
  static async getCategories(): Promise<ProductCategory[]> {
    const response = await apiClient.get<CategoryListResponse>('/products/categories');
    return response.data?.data || [];
  }

  /**
   * Create a new product category
   */
  static async createCategory(payload: CategoryFormData): Promise<ProductCategory> {
    const response = await apiClient.post('/products/categories', payload);
    return response.data?.data;
  }

  /**
   * Update product category
   */
  static async updateCategory(id: string, payload: Partial<CategoryFormData>): Promise<ProductCategory> {
    const response = await apiClient.patch(`/products/categories/${id}`, payload);
    return response.data?.data;
  }

  /**
   * Activate / Deactivate product category
   */
  static async patchCategoryStatus(id: string, status: CategoryStatus): Promise<ProductCategory> {
    const response = await apiClient.patch(`/products/categories/${id}/status`, { status });
    return response.data?.data;
  }
}

export const productService = ProductService;
