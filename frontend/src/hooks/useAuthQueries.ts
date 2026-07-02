import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { setCredentials, logout } from '../store';

export const useLoginMutation = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: any) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      dispatch(setCredentials({ user: data.user, token: data.accessToken }));
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    },
  });
};

export const useGenerateOTPMutation = () => {
  return useMutation({
    mutationFn: async (payload: { identifier: string; purpose: string }) => {
      const response = await api.post('/auth/generate-otp', payload);
      return response.data;
    },
  });
};

export const useVerifyOTPMutation = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { identifier: string; otp: string; purpose: string }) => {
      const response = await api.post('/auth/verify-otp', payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        dispatch(setCredentials({ user: data.user, token: data.accessToken }));
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const response = await api.post('/auth/forgot-password', payload);
      return response.data;
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post('/auth/reset-password', payload);
      return response.data;
    },
  });
};

export const useLogoutMutation = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await api.post('/auth/logout', { refreshToken });
      return response.data;
    },
    onSettled: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch(logout());
      queryClient.clear();
    },
  });
};

// Profile Query Hook
export const useProfileQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data.user;
    },
    enabled,
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData: any) => {
      const response = await api.put('/users/profile', profileData);
      return response.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Addresses CRUD hooks
export const useAddAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addressData: any) => {
      const response = await api.post('/users/addresses', addressData);
      return response.data.addresses;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUpdateAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ addressId, addressData }: { addressId: string; addressData: any }) => {
      const response = await api.put(`/users/addresses/${addressId}`, addressData);
      return response.data.addresses;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useDeleteAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addressId: string) => {
      const response = await api.delete(`/users/addresses/${addressId}`);
      return response.data.addresses;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
export default useProfileQuery;
