import axiosInstance from './axiosInstance';
import type {
  EmployeeLeaveDto,
  LeaveFilterParams,
  LeavePageResponse,
  LeaveRequestPayload,
} from '@/types/leave.types';

export const leavesApi = {
  requestLeave: async (data: LeaveRequestPayload): Promise<EmployeeLeaveDto> => {
    const response = await axiosInstance.post<EmployeeLeaveDto>('/api/leaves', data);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<EmployeeLeaveDto> => {
    const response = await axiosInstance.put<EmployeeLeaveDto>(`/api/leaves/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  getAll: async (params: LeaveFilterParams = {}): Promise<LeavePageResponse> => {
    const { page = 0, size = 10, status, employeeName, startDate, endDate } = params;
    const response = await axiosInstance.get<LeavePageResponse>('/api/leaves', {
      params: { page, size, status: status || undefined, employeeName: employeeName || undefined, startDate, endDate },
    });
    return response.data;
  },

  getMyLeaves: async (page = 0, size = 10): Promise<LeavePageResponse> => {
    const response = await axiosInstance.get<LeavePageResponse>('/api/leaves/my', {
      params: { page, size },
    });
    return response.data;
  },

  filterByDateRange: async (startDate: string, endDate: string): Promise<EmployeeLeaveDto[]> => {
    const response = await axiosInstance.get<EmployeeLeaveDto[]>('/api/leaves/filter', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
