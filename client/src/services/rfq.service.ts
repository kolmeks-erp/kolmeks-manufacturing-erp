import { apiClient } from './api';

export interface RFQFormPayload {
  full_name: string;
  company: string;
  email: string;
  phone?: string;
  country: string;
  requirement_type: string;
  other_requirement?: string;
  project_name: string;
  description: string;
  estimated_quantity: number;
  unit: string;
  target_delivery_date?: string;
  material?: string;
  surface_finish?: string;
  tolerance_requirements?: string;
  hp_field?: string; // Honeypot field
  files?: File[];
}

export interface RFQResponseData {
  requestNumber: string;
  id: string;
  createdAt: string;
  filesAttachedCount: number;
}

export interface RFQSubmissionResponse {
  success: boolean;
  message: string;
  data: RFQResponseData;
}

/**
 * Sends a B2B Request for Quotation (RFQ) payload with supporting file attachments to the backend API.
 */
export const submitRFQPayload = async (payload: RFQFormPayload): Promise<RFQSubmissionResponse> => {
  const formData = new FormData();

  // Append text fields
  formData.append('full_name', payload.full_name);
  formData.append('company', payload.company);
  formData.append('email', payload.email);
  if (payload.phone) formData.append('phone', payload.phone);
  formData.append('country', payload.country);
  formData.append('requirement_type', payload.requirement_type);
  if (payload.other_requirement) formData.append('other_requirement', payload.other_requirement);
  formData.append('project_name', payload.project_name);
  formData.append('description', payload.description);
  formData.append('estimated_quantity', payload.estimated_quantity.toString());
  formData.append('unit', payload.unit || 'Pcs');
  if (payload.target_delivery_date) formData.append('target_delivery_date', payload.target_delivery_date);
  if (payload.material) formData.append('material', payload.material);
  if (payload.surface_finish) formData.append('surface_finish', payload.surface_finish);
  if (payload.tolerance_requirements) formData.append('tolerance_requirements', payload.tolerance_requirements);
  if (payload.hp_field) formData.append('hp_field', payload.hp_field);

  // Append file attachments
  if (payload.files && payload.files.length > 0) {
    payload.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response = await apiClient.post<RFQSubmissionResponse>('/rfq', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // Extended 60s timeout for CAD file uploads
  });

  return response.data;
};
