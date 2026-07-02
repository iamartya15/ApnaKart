import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';

export const useReviewTrustQuery = (productId: string, enabled = true) => {
  return useQuery({
    queryKey: ['review-trust', productId],
    queryFn: async () => {
      const response = await api.get(`/ai/review-trust/${productId}`);
      return response.data.analysis;
    },
    enabled: enabled && !!productId,
  });
};

export const useSellerTrustQuery = (sellerId: string, enabled = true) => {
  return useQuery({
    queryKey: ['seller-trust', sellerId],
    queryFn: async () => {
      const response = await api.get(`/ai/seller-trust/${sellerId}`);
      return response.data.sellerStats;
    },
    enabled: enabled && !!sellerId,
  });
};

export const useProductSummaryQuery = (productId: string, enabled = true) => {
  return useQuery({
    queryKey: ['product-summary', productId],
    queryFn: async () => {
      const response = await api.get(`/ai/product-summary/${productId}`);
      return response.data.summary;
    },
    enabled: enabled && !!productId,
  });
};

export const useChatHistoryQuery = (conversationId: string, enabled = true) => {
  return useQuery({
    queryKey: ['chat-history', conversationId],
    queryFn: async () => {
      const response = await api.get(`/ai/chat-history/${conversationId}`);
      return response.data.history || [];
    },
    enabled: enabled && !!conversationId,
  });
};

export const useGiftMutation = () => {
  return useMutation({
    mutationFn: async (payload: { description: string }) => {
      const response = await api.post('/ai/gift', payload);
      return response.data.result.suggestions;
    },
  });
};

export const useBudgetComboMutation = () => {
  return useMutation({
    mutationFn: async (payload: { budget: number; itemsCount?: number }) => {
      const response = await api.post('/ai/budget-combo', payload);
      return response.data.result;
    },
  });
};

export const useOutfitMutation = () => {
  return useMutation({
    mutationFn: async (payload: {
      gender?: string;
      occasion?: string;
      budget?: number;
      season?: string;
    }) => {
      const response = await api.post('/ai/outfit', payload);
      return response.data.result;
    },
  });
};
