import axiosInstance from './axiosInstance';
import type { ApiResponse, DepartmentDTO } from '@/types/department.types';

export const departmentsApi = {
  getAll: async (): Promise<DepartmentDTO[]> => {
    const response = await axiosInstance.get<DepartmentDTO[]>('/api/departments');
    return response.data;
  },

  getById: async (id: number): Promise<DepartmentDTO> => {
    const response = await axiosInstance.get<DepartmentDTO>(`/api/departments/${id}`);
    return response.data;
  },

  create: async (data: DepartmentDTO): Promise<ApiResponse> => {
    const response = await axiosInstance.post<ApiResponse>('/api/departments', data);
    return response.data;
  },

  update: async (id: number, data: DepartmentDTO): Promise<ApiResponse> => {
    const response = await axiosInstance.put<ApiResponse>(`/api/departments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(`/api/departments/${id}`);
    return response.data;
  },
};
