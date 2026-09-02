import apiClient from './api';
import { SearchResponseData } from '../types/search';

export const searchService = {
  async search(query: string): Promise<SearchResponseData> {
    const response = await apiClient.get('/search', {
      params: { q: query },
    });
    return response.data.data;
  },
};

export default searchService;

