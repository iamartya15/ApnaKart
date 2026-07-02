import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useCartQuery = (guestId?: string) => {
  return useQuery({
    queryKey: ['cart', guestId],
    queryFn: async () => {
      const response = await api.get(`/cart?guestId=${guestId || ''}`);
      return response.data;
    },
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      guestId?: string;
      productId: string;
      quantity: number;
      price: number;
      title: string;
      imageUrl: string;
      marketplace: string;
    }) => {
      const response = await api.post('/cart/add', payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart', variables.guestId] });
    },
  });
};

export const useUpdateQtyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { guestId?: string; productId: string; quantity: number }) => {
      const response = await api.post('/cart/update', payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart', variables.guestId] });
    },
  });
};

export const useMergeCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { guestId: string }) => {
      const response = await api.post('/cart/merge', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useCheckoutMutation = () => {
  return useMutation({
    mutationFn: async (payload: {
      items: any[];
      deliverySlot: string;
      couponCode?: string;
      idempotencyKey: string;
    }) => {
      const response = await api.post('/checkout', payload);
      return response.data;
    },
  });
};

export const useCreatePaymentMutation = () => {
  return useMutation({
    mutationFn: async (payload: { orderId: string; provider: string }) => {
      const response = await api.post('/payments/session', payload);
      return response.data;
    },
  });
};

export const usePlaceOrderMutation = () => {
  return useMutation({
    mutationFn: async (payload: {
      idempotencyKey: string;
      shippingAddress: any;
      billingAddress: any;
      paymentMethod: string;
      paymentProvider: string;
    }) => {
      const response = await api.post('/orders/place', payload);
      return response.data;
    },
  });
};

export const useOrdersHistoryQuery = () => {
  return useQuery({
    queryKey: ['orders-history'],
    queryFn: async () => {
      const response = await api.get('/orders/history');
      return response.data.orders || [];
    },
  });
};

export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/orders/cancel/${orderId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-history'] });
    },
  });
};

export const useReturnOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/orders/return/${orderId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-history'] });
    },
  });
};
