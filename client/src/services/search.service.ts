import axios from 'axios';
import { SearchResponseData } from '../types/search';

const API_URL = '/api/search';

const getAuthHeaders = () => {
  const token = localStorage.getItem('supabase.auth.token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const searchService = {
  async search(query: string): Promise<SearchResponseData> {
    const response = await axios.get(API_URL, {
      params: { q: query },
      headers: getAuthHeaders()
    });
    return response.data.data;
  }
};
