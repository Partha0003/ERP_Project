import axiosInstance from './axiosInstance';
import type { EmployeeDto, EmployeePageResponse } from '@/types/employee.types';

export const employeesApi = {
  getAll: async (): Promise<EmployeeDto[]> => {
    const response = await axiosInstance.get<EmployeeDto[]>('/api/employees');
    return response.data;
  },

  getPaged: async (page = 0, size = 10): Promise<EmployeePageResponse> => {
    const response = await axiosInstance.get('/api/employees/paged', { params: { page, size } });
    return response.data;
  },

  getById: async (id: number): Promise<EmployeeDto> => {
    const response = await axiosInstance.get<EmployeeDto>(`/api/employees/${id}`);
    return response.data;
  },

  create: async (data: EmployeeDto): Promise<EmployeeDto> => {
    const response = await axiosInstance.post<EmployeeDto>('/api/employees', data);
    return response.data;
  },

  update: async (id: number, data: EmployeeDto): Promise<EmployeeDto> => {
    const response = await axiosInstance.put<EmployeeDto>(`/api/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<string> => {
    const response = await axiosInstance.delete<string>(`/api/employees/${id}`);
    return response.data;
  },

  toggleStatus: async (id: number): Promise<string> => {
    const response = await axiosInstance.put<string>(`/api/employees/${id}/toggle-status`);
    return response.data;
  },

  filter: async (role: string, department: string, page = 0, size = 10): Promise<EmployeePageResponse> => {
    const response = await axiosInstance.get('/api/employees/filter', {
      params: { role, department, page, size },
    });
    return response.data;
  },
};
