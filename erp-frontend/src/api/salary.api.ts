import axiosInstance from './axiosInstance';
import type {
  MyPayslipDto,
  PayslipLogDto,
  PerformanceReviewDto,
  SalaryDashboardSummaryDto,
  SalaryPayslipDto,
  SalaryRecord,
} from '@/types/salary.types';
import { downloadBlob } from '@/utils/roleUtils';

export const salaryApi = {
  generate: async (month: string): Promise<string> => {
    const response = await axiosInstance.post<string>('/api/salary/generate', null, { params: { month } });
    return response.data;
  },

  approve: async (id: number): Promise<string> => {
    const response = await axiosInstance.put<string>(`/api/salary/${id}/approve`);
    return response.data;
  },

  forward: async (id: number): Promise<string> => {
    const response = await axiosInstance.put<string>(`/api/salary/${id}/forward`);
    return response.data;
  },

  markPaid: async (id: number): Promise<string> => {
    const response = await axiosInstance.put<string>(`/api/salary/${id}/mark-paid`);
    return response.data;
  },

  regenerate: async (id: number): Promise<string> => {
    const response = await axiosInstance.put<string>(`/api/salary/regenerate/${id}`);
    return response.data;
  },

  delete: async (id: number): Promise<string> => {
    const response = await axiosInstance.delete<string>(`/api/salary/${id}`);
    return response.data;
  },

  getSummary: async (month: string): Promise<Record<string, number>> => {
    const response = await axiosInstance.get<Record<string, number>>('/api/salary/summary', {
      params: { month },
    });
    return response.data;
  },

  getDashboard: async (): Promise<SalaryDashboardSummaryDto> => {
    const response = await axiosInstance.get<SalaryDashboardSummaryDto>('/api/salary/salary/dashboard');
    return response.data;
  },

  getEmployeeHistory: async (employeeId: number): Promise<SalaryRecord[]> => {
    const response = await axiosInstance.get<SalaryRecord[]>(`/api/salary/employee/${employeeId}/history`);
    return response.data;
  },

  getStatusCount: async (month: string): Promise<Record<string, number>> => {
    const response = await axiosInstance.get<Record<string, number>>('/api/salary/status-count', {
      params: { month },
    });
    return response.data;
  },
};

export const payslipApi = {
  getById: async (id: number): Promise<SalaryPayslipDto> => {
    const response = await axiosInstance.get<SalaryPayslipDto>(`/api/payslip/payslip/${id}`);
    return response.data;
  },

  download: async (id: number, filename: string): Promise<void> => {
    const response = await axiosInstance.get(`/api/payslip/payslip/${id}/download`, {
      responseType: 'blob',
    });
    downloadBlob(response.data, filename);
  },

  downloadSelf: async (id: number): Promise<void> => {
    const response = await axiosInstance.get(`/api/payslip/payslip/${id}/download/self`, {
      responseType: 'blob',
    });
    downloadBlob(response.data, `Payslip_${id}.pdf`);
  },

  email: async (id: number): Promise<string> => {
    const response = await axiosInstance.post<string>(`/api/payslip/payslip/${id}/email`);
    return response.data;
  },

  filter: async (month: string, isPaid?: boolean, employeeName?: string): Promise<SalaryPayslipDto[]> => {
    const response = await axiosInstance.get<SalaryPayslipDto[]>('/api/payslip/payslip/filter', {
      params: { month, status: isPaid, employeeName },
    });
    return response.data;
  },

  getMyPayslips: async (): Promise<MyPayslipDto[]> => {
    const response = await axiosInstance.get<MyPayslipDto[]>('/api/payslip/my-salary');
    return response.data;
  },

  getLogsByPayslip: async (payslipId: number): Promise<PayslipLogDto[]> => {
    const response = await axiosInstance.get<PayslipLogDto[]>(`/api/payslip/logs/payslip/${payslipId}`);
    return response.data;
  },

  getLogsByEmployee: async (employeeId: number): Promise<PayslipLogDto[]> => {
    const response = await axiosInstance.get<PayslipLogDto[]>(`/api/payslip/logs/employee/${employeeId}`);
    return response.data;
  },
};

export const performanceApi = {
  getAll: async (): Promise<PerformanceReviewDto[]> => {
    const response = await axiosInstance.get<PerformanceReviewDto[]>('/api/performance-reviews');
    return response.data;
  },

  getById: async (id: number): Promise<PerformanceReviewDto> => {
    const response = await axiosInstance.get<PerformanceReviewDto>(`/api/performance-reviews/${id}`);
    return response.data;
  },

  getByEmployee: async (employeeId: number): Promise<PerformanceReviewDto[]> => {
    const response = await axiosInstance.get<PerformanceReviewDto[]>(
      `/api/performance-reviews/employee/${employeeId}`
    );
    return response.data;
  },

  getMyReviews: async (): Promise<PerformanceReviewDto[]> => {
    const response = await axiosInstance.get<PerformanceReviewDto[]>('/api/performance-reviews/my-reviews');
    return response.data;
  },

  create: async (data: PerformanceReviewDto): Promise<PerformanceReviewDto> => {
    const response = await axiosInstance.post<PerformanceReviewDto>('/api/performance-reviews', data);
    return response.data;
  },
};
