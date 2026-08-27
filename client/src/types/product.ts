export type ProductType =
  | 'component'
  | 'assembly'
  | 'finished_product'
  | 'raw_material'
  | 'service'
  | 'other'
  | 'motor_part'
  | 'custom';

export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export type CategoryStatus = 'active' | 'inactive';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
  status: CategoryStatus;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface Product {
  id: string;
  product_code: string;
  name: string;
  category_id?: string | null;
  category?: ProductCategory | null;
  product_type: ProductType;
  unit: string;
  material?: string | null;
  part_number?: string | null;
  revision: string;
  description?: string | null;
  minimum_stock: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  product_type?: string;
  status?: string;
  material?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductFormData {
  product_code?: string;
  name: string;
  category_id?: string;
  product_type: ProductType;
  unit: string;
  material?: string;
  part_number?: string;
  revision: string;
  description?: string;
  minimum_stock?: number;
  status: ProductStatus;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  status: CategoryStatus;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CategoryListResponse {
  success: boolean;
  data: ProductCategory[];
}
