import apiClient from './api';

export interface FixedAssetCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  default_asset_account_id?: string;
  default_accumulated_depreciation_account_id?: string;
  default_depreciation_expense_account_id?: string;
  default_useful_life_months: number;
  default_depreciation_method: string;
  is_active: boolean;
  default_asset_account?: { id: string; account_code: string; account_name: string };
  default_accumulated_depreciation_account?: { id: string; account_code: string; account_name: string };
  default_depreciation_expense_account?: { id: string; account_code: string; account_name: string };
  created_at?: string;
  updated_at?: string;
}

export type FixedAssetStatus =
  | 'DRAFT'
  | 'ACQUIRED'
  | 'PENDING_CAPITALIZATION'
  | 'CAPITALIZED'
  | 'ACTIVE'
  | 'FULLY_DEPRECIATED'
  | 'TRANSFERRED'
  | 'DISPOSED'
  | 'RETIRED';

export interface FixedAsset {
  id: string;
  asset_number: string;
  operational_asset_id?: string;
  asset_name: string;
  category_id: string;
  description?: string;
  acquisition_date: string;
  capitalization_date?: string;
  acquisition_cost: number;
  residual_value: number;
  useful_life_months: number;
  depreciation_method: string;
  accumulated_depreciation: number;
  net_book_value: number;
  status: FixedAssetStatus;
  cost_center_id?: string;
  location_id?: string;
  purchase_invoice_id?: string;
  supplier_id?: string;
  purchase_order_id?: string;
  asset_account_id?: string;
  accumulated_depreciation_account_id?: string;
  depreciation_expense_account_id?: string;
  disposal_date?: string;
  disposal_value?: number;
  gain_loss_amount?: number;
  capitalization_journal_id?: string;
  disposal_journal_id?: string;
  category?: FixedAssetCategory;
  cost_center?: { id: string; code: string; name: string };
  operational_asset?: { id: string; asset_code: string; name: string; status: string };
  purchase_invoice?: { id: string; invoice_number: string };
  supplier?: { id: string; supplier_code: string; name: string };
  asset_account?: { id: string; account_code: string; account_name: string };
  accumulated_depreciation_account?: { id: string; account_code: string; account_name: string };
  depreciation_expense_account?: { id: string; account_code: string; account_name: string };
  capitalization_journal?: { id: string; journal_number: string; entry_date: string; status: string };
  disposal_journal?: { id: string; journal_number: string; entry_date: string; status: string };
  depreciation_entries?: FixedAssetDepreciationEntry[];
  transfers?: FixedAssetTransfer[];
  disposal?: FixedAssetDisposal;
  created_at?: string;
  updated_at?: string;
}

export interface FixedAssetDepreciationEntry {
  id: string;
  asset_id: string;
  depreciation_run_id?: string;
  period_name: string;
  depreciation_date: string;
  opening_nbv: number;
  depreciation_amount: number;
  accumulated_depreciation: number;
  closing_nbv: number;
  journal_entry_id?: string;
  status: string;
  created_at?: string;
}

export interface DepreciationScheduleItem {
  period_number: number;
  period_name: string;
  opening_nbv: number;
  depreciation_amount: number;
  accumulated_depreciation: number;
  closing_nbv: number;
}

export interface DepreciationRunPreviewItem {
  asset_id: string;
  asset_number: string;
  asset_name: string;
  category_name: string;
  opening_nbv: number;
  depreciation_amount: number;
  accumulated_depreciation: number;
  closing_nbv: number;
}

export interface DepreciationRunPreview {
  period_id: string;
  period_name: string;
  total_assets_count: number;
  total_depreciation_amount: number;
  items: DepreciationRunPreviewItem[];
}

export interface DepreciationRun {
  id: string;
  run_number: string;
  period_id: string;
  period_name: string;
  run_date: string;
  total_depreciation_amount: number;
  total_assets_count: number;
  status: string;
  journal_entry_id?: string;
  posted_at?: string;
  created_at?: string;
}

export interface FixedAssetTransfer {
  id: string;
  transfer_number: string;
  asset_id: string;
  from_cost_center_id?: string;
  to_cost_center_id?: string;
  from_location?: string;
  to_location?: string;
  transfer_date: string;
  reason: string;
  approved_by?: string;
  approved_at?: string;
  asset?: { id: string; asset_number: string; asset_name: string };
  from_cost_center?: { id: string; code: string; name: string };
  to_cost_center?: { id: string; code: string; name: string };
  created_at?: string;
}

export interface FixedAssetDisposal {
  id: string;
  disposal_number: string;
  asset_id: string;
  disposal_date: string;
  disposal_reason: 'SOLD' | 'SCRAPPED' | 'LOST' | 'RETIRED' | 'OTHER';
  disposal_proceeds: number;
  book_value_at_disposal: number;
  accumulated_depreciation_at_disposal: number;
  gain_loss_amount: number;
  buyer_reference?: string;
  status: string;
  journal_entry_id?: string;
  notes?: string;
  asset?: { id: string; asset_number: string; asset_name: string; acquisition_cost: number; net_book_value: number };
  journal_entry?: { id: string; journal_number: string };
  created_at?: string;
}

export interface AssetDashboardSummary {
  total_gross_cost: number;
  total_accumulated_depreciation: number;
  total_net_book_value: number;
  current_period_depreciation: number;
  latest_depreciation_period: string;
  active_assets_count: number;
  fully_depreciated_count: number;
  pending_capitalization_count: number;
  disposed_count: number;
}

export interface AssetFinancialReports {
  asset_register: FixedAsset[];
  by_category: {
    code: string;
    name: string;
    asset_count: number;
    gross_cost: number;
    accumulated_depreciation: number;
    net_book_value: number;
  }[];
  by_cost_center: {
    cost_center_code: string;
    cost_center_name: string;
    asset_count: number;
    gross_cost: number;
    accumulated_depreciation: number;
    net_book_value: number;
  }[];
}

export interface CreateAssetPayload {
  operational_asset_id?: string;
  asset_name: string;
  category_id: string;
  description?: string;
  acquisition_date: string;
  acquisition_cost: number;
  residual_value?: number;
  useful_life_months?: number;
  depreciation_method?: string;
  cost_center_id?: string;
  location_id?: string;
  purchase_invoice_id?: string;
  supplier_id?: string;
  purchase_order_id?: string;
  asset_account_id?: string;
  accumulated_depreciation_account_id?: string;
  depreciation_expense_account_id?: string;
}

export interface CreateCategoryPayload {
  code: string;
  name: string;
  description?: string;
  default_asset_account_id?: string;
  default_accumulated_depreciation_account_id?: string;
  default_depreciation_expense_account_id?: string;
  default_useful_life_months?: number;
  default_depreciation_method?: string;
}

export const assetService = {
  // Categories
  getCategories: async (): Promise<FixedAssetCategory[]> => {
    const res = await apiClient.get<{ success: boolean; data: FixedAssetCategory[] }>('/finance/asset-categories');
    return res.data.data;
  },

  createCategory: async (payload: CreateCategoryPayload) => {
    const res = await apiClient.post<{ success: boolean; data: FixedAssetCategory; message: string }>('/finance/asset-categories', payload);
    return res.data;
  },

  updateCategory: async (id: string, payload: Partial<FixedAssetCategory>) => {
    const res = await apiClient.patch<{ success: boolean; data: FixedAssetCategory; message: string }>(`/finance/asset-categories/${id}`, payload);
    return res.data;
  },

  // Assets
  getAssets: async (params?: { category_id?: string; status?: string; cost_center_id?: string; search?: string }): Promise<FixedAsset[]> => {
    const res = await apiClient.get<{ success: boolean; data: FixedAsset[] }>('/finance/assets', { params });
    return res.data.data;
  },

  getAssetById: async (id: string): Promise<FixedAsset> => {
    const res = await apiClient.get<{ success: boolean; data: FixedAsset }>(`/finance/assets/${id}`);
    return res.data.data;
  },

  createAsset: async (payload: CreateAssetPayload) => {
    const res = await apiClient.post<{ success: boolean; data: FixedAsset; message: string }>('/finance/assets', payload);
    return res.data;
  },

  updateAsset: async (id: string, payload: Partial<CreateAssetPayload>) => {
    const res = await apiClient.patch<{ success: boolean; data: FixedAsset; message: string }>(`/finance/assets/${id}`, payload);
    return res.data;
  },

  capitalizeAsset: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: FixedAsset; journal_entry: any; message: string }>(`/finance/assets/${id}/capitalize`);
    return res.data;
  },

  // Depreciation
  getDepreciationSchedule: async (id: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        asset_number: string;
        asset_name: string;
        acquisition_cost: number;
        residual_value: number;
        useful_life_months: number;
        depreciable_amount: number;
        monthly_depreciation: number;
        schedule: DepreciationScheduleItem[];
      };
    }>(`/finance/assets/${id}/depreciation-schedule`);
    return res.data.data;
  },

  previewDepreciationRun: async (period_id: string): Promise<DepreciationRunPreview> => {
    const res = await apiClient.post<{ success: boolean; data: DepreciationRunPreview }>('/finance/assets/depreciation/preview', { period_id });
    return res.data.data;
  },

  postDepreciationRun: async (period_id: string) => {
    const res = await apiClient.post<{ success: boolean; data: DepreciationRun; journal_entry: any; message: string }>('/finance/assets/depreciation/post', { period_id });
    return res.data;
  },

  // Transfers
  getTransfers: async (): Promise<FixedAssetTransfer[]> => {
    const res = await apiClient.get<{ success: boolean; data: FixedAssetTransfer[] }>('/finance/assets/transfers');
    return res.data.data;
  },

  transferAsset: async (id: string, payload: { to_cost_center_id?: string; to_location?: string; transfer_date?: string; reason: string }) => {
    const res = await apiClient.post<{ success: boolean; data: FixedAssetTransfer; message: string }>(`/finance/assets/${id}/transfer`, payload);
    return res.data;
  },

  // Disposals
  getDisposals: async (): Promise<FixedAssetDisposal[]> => {
    const res = await apiClient.get<{ success: boolean; data: FixedAssetDisposal[] }>('/finance/assets/disposals');
    return res.data.data;
  },

  disposeAsset: async (
    id: string,
    payload: { disposal_date?: string; disposal_reason: 'SOLD' | 'SCRAPPED' | 'LOST' | 'RETIRED' | 'OTHER'; disposal_proceeds?: number; buyer_reference?: string; notes?: string }
  ) => {
    const res = await apiClient.post<{ success: boolean; data: FixedAssetDisposal; journal_entry: any; message: string }>(`/finance/assets/${id}/dispose`, payload);
    return res.data;
  },

  // Dashboard & Reports
  getDashboardSummary: async (): Promise<AssetDashboardSummary> => {
    const res = await apiClient.get<{ success: boolean; data: AssetDashboardSummary }>('/finance/assets/dashboard/summary');
    return res.data.data;
  },

  getReports: async (): Promise<AssetFinancialReports> => {
    const res = await apiClient.get<{ success: boolean; data: AssetFinancialReports }>('/finance/assets/reports/summary');
    return res.data.data;
  },
};

export default assetService;
