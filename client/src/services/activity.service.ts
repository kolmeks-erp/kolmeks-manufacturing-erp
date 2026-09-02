import apiClient from './api';
import { ActivityStreamResponse } from '../types/activity';

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
    const response = await apiClient.get('/activity', { params });
    return response.data?.data || { logs: [], total: 0 };
  }
};
