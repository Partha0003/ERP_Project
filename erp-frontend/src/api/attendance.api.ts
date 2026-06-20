import axiosInstance from './axiosInstance';
import type {
  AttendanceDto,
  AttendancePageResponse,
  AttendanceResponseDto,
  AttendanceSummaryDto,
  WeeklyAttendanceDto,
} from '@/types/attendance.types';
import { downloadBlob } from '@/utils/roleUtils';

export const attendanceApi = {
  mark: async (data: AttendanceDto) => {
    const response = await axiosInstance.post('/api/attendance', data);
    return response.data;
  },

  markNow: async (employeeId: number): Promise<string> => {
    const response = await axiosInstance.post<string>(`/api/attendance/mark-now/${employeeId}`);
    return response.data;
  },

  getByEmployee: async (employeeId: number): Promise<AttendanceDto[]> => {
    const response = await axiosInstance.get<AttendanceDto[]>(`/api/attendance/employee/${employeeId}`);
    return response.data;
  },

  getEmployeePaged: async (employeeId: number, page = 0, size = 10): Promise<AttendancePageResponse> => {
    const response = await axiosInstance.get<AttendancePageResponse>(
      `/api/attendance/employee/${employeeId}/page`,
      { params: { page, size } }
    );
    return response.data;
  },

  getDashboard: async (employeeId: number): Promise<Record<string, unknown>> => {
    const response = await axiosInstance.get(`/api/attendance/dashboard/${employeeId}`);
    return response.data;
  },

  getMonthlySummary: async (employeeId: number, month: number, year: number) => {
    const response = await axiosInstance.get<Record<string, number>>(
      `/api/attendance/summary/${employeeId}`,
      { params: { month, year } }
    );
    return response.data;
  },

  getAllPaged: async (page = 0, size = 10): Promise<{ content: AttendanceResponseDto[]; totalElements: number; totalPages: number }> => {
    const response = await axiosInstance.get('/api/attendance/all/page', { params: { page, size } });
    return response.data;
  },

  getFiltered: async (params: {
    startDate?: string;
    endDate?: string;
    employeeId?: number;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: AttendanceResponseDto[]; totalElements: number; totalPages: number }> => {
    const response = await axiosInstance.get('/api/attendance/attendance/filter', { params });
    return response.data;
  },

  getOrgMonthlySummary: async (month: string): Promise<AttendanceSummaryDto> => {
    const response = await axiosInstance.get<AttendanceSummaryDto>('/api/attendance/summary/monthly', {
      params: { month },
    });
    return response.data;
  },

  getOrgWeeklySummary: async (startDate: string, endDate: string): Promise<WeeklyAttendanceDto> => {
    const response = await axiosInstance.get<WeeklyAttendanceDto>('/api/attendance/summary/weekly', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  exportExcel: async (params?: { employeeId?: number; startDate?: string; endDate?: string }) => {
    const response = await axiosInstance.get('/api/attendance/export/excel', {
      params,
      responseType: 'blob',
    });
    downloadBlob(response.data, 'attendance.xlsx');
  },

  exportPdf: async (params?: { employeeId?: number; startDate?: string; endDate?: string }) => {
    const response = await axiosInstance.get('/api/attendance/export/pdf', {
      params,
      responseType: 'blob',
    });
    downloadBlob(response.data, 'attendance.pdf');
  },
};
