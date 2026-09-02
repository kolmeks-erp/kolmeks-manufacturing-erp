import axios from 'axios';
import { ActivityStreamResponse } from '../types/activity';

const API_URL = '/api/activity';

const getAuthHeaders = () => {
  const token = localStorage.getItem('supabase.auth.token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const activityService = {
  async getActivity(params: {
    view?: 'my' | 'team' | 'system';
    datePreset?: string;
    customStart?: string;
    customEnd?: string;
    module?: string;
    action?: string;
    limit?: number;
  } = {}): Promise<ActivityStreamResponse> {
    const response = await axios.get(API_URL, {
      params,
      headers: getAuthHeaders()
    });
    return response.data.data;
  }
};
