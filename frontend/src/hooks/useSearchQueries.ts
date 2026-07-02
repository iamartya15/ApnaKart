import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useSearchQuery = (q: string, category: string = '', enabled = true) => {
  return useQuery({
    queryKey: ['search', q, category],
    queryFn: async () => {
      if (!q.trim()) return { count: 0, products: [] };
      const response = await api.get(`/search?q=${encodeURIComponent(q)}&category=${category}`);
      return response.data;
    },
    enabled: enabled && !!q.trim(),
  });
};

export const useCompareQuery = (ids: string[], enabled = true) => {
  return useQuery({
    queryKey: ['compare', ids],
    queryFn: async () => {
      if (ids.length < 2) return null;
      const response = await api.get(`/compare?ids=${ids.join(',')}`);
      return response.data.matrix;
    },
    enabled: enabled && ids.length >= 2,
  });
};

export const useSearchMetadataQuery = () => {
  return useQuery({
    queryKey: ['search-meta'],
    queryFn: async () => {
      const response = await api.get('/search/meta');
      return response.data;
    },
  });
};

export const useAutocompleteQuery = (q: string, enabled = true) => {
  return useQuery({
    queryKey: ['autocomplete', q],
    queryFn: async () => {
      if (!q.trim()) return [];
      const response = await api.get(`/search/autocomplete?q=${encodeURIComponent(q)}`);
      return response.data.suggestions || [];
    },
    enabled: enabled && !!q.trim(),
  });
};
export default useSearchQuery;
