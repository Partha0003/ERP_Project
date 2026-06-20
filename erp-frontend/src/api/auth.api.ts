import axiosInstance from './axiosInstance';
import type { AuthResponse, LoginRequest, SignupRequest } from '@/types/auth.types';

export const authApi = {
  signin: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/signin', data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },
};
