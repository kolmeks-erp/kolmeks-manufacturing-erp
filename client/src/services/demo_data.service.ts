import apiClient from './api';

export interface DemoDataCounts {
  employees: number;
  customers: number;
  suppliers: number;
  products: number;
  leads: number;
  opportunities: number;
  quotations: number;
  salesOrders: number;
  purchaseRequisitions: number;
  rfqs: number;
  purchaseOrders: number;
  goodsReceipts: number;
  productionOrders: number;
  fixedAssets: number;
  documents: number;
  workflows: number;
  inspectionPlans: number;
  inventory: number;
}

export interface DemoDataStatusResponse {
  success: boolean;
  isSeeded: boolean;
  totalParentRecords: number;
  counts: DemoDataCounts;
  lastCheckedAt: string;
  error?: string;
}

export interface DemoDataActionResponse {
  success: boolean;
  message: string;
  totalParentRecords?: number;
  counts?: DemoDataCounts;
  isAlreadySeeded?: boolean;
  error?: string;
}

export const demoDataService = {
  getStatus: async (): Promise<DemoDataStatusResponse> => {
    const res = await apiClient.get<DemoDataStatusResponse>('/system/demo-data/status');
    return res.data;
  },

  createDemoData: async (): Promise<DemoDataActionResponse> => {
    const res = await apiClient.post<DemoDataActionResponse>('/system/demo-data/create');
    return res.data;
  },

  deleteDemoData: async (): Promise<DemoDataActionResponse> => {
    const res = await apiClient.delete<DemoDataActionResponse>('/system/demo-data/delete');
    return res.data;
  },
};
