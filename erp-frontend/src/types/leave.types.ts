export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EmployeeLeaveDto {
  id?: number;
  employeeId?: number;
  employeeName?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status?: LeaveStatus | string;
  appliedDate?: string;
}

export interface LeaveRequestPayload {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeavePageResponse {
  content: EmployeeLeaveDto[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface LeaveFilterParams {
  page?: number;
  size?: number;
  status?: string;
  employeeName?: string;
  startDate?: string;
  endDate?: string;
}
