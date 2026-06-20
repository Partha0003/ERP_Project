import axiosInstance from './axiosInstance';
import type {
  CreateUserRequest,
  CreateUserResponse,
  MessageResponse,
  ResetPasswordRequest,
  UpdateUserRequest,
  UsersPageResponse,
  UserResponse,
} from '@/types/user.types';
import type { UserRole, UserStatus } from '@/types/auth.types';

export const adminApi = {
  getAllUsers: async (params: {
    page?: number;
    size?: number;
    role?: UserRole;
    status?: UserStatus;
  }): Promise<UsersPageResponse> => {
    const response = await axiosInstance.get<UsersPageResponse>('/admin/all-users', { params });
    return response.data;
  },

  createUser: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
    const response = await axiosInstance.post<CreateUserResponse>('/admin/create-user-management', data);
    return response.data;
  },

  updateUser: async (userId: number, data: UpdateUserRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.put<MessageResponse>(`/admin/update-user/${userId}`, data);
    return response.data;
  },

  resetPassword: async (userId: number, data: ResetPasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.put<MessageResponse>(`/admin/reset-password/${userId}`, data);
    return response.data;
  },

  toggleUserStatus: async (userId: number): Promise<MessageResponse> => {
    const response = await axiosInstance.put<MessageResponse>(`/admin/change-status/${userId}`);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<MessageResponse> => {
    const response = await axiosInstance.delete<MessageResponse>(`/admin/delete-user/${userId}`);
    return response.data;
  },
};

export type { UserResponse };
