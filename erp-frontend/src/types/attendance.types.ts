export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HALF_DAY' | 'NOT_MARKED';

export interface AttendanceDto {
  employeeId: number;
  employeeName?: string;
  date: string;
  status: AttendanceStatus;
  present: boolean;
  overtime: boolean;
  remarks?: string;
}

export interface AttendanceSummaryDto {
  present: number;
  absent: number;
  leave: number;
  notMarked: number;
}

export interface WeeklyAttendanceDto {
  dailyStatus: Record<string, Record<string, number>>;
}

export interface AttendanceResponseDto {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  status: AttendanceStatus;
  present: boolean;
  overtime: boolean;
  remarks?: string;
}

export interface AttendancePageResponse {
  content: AttendanceResponseDto[];
  totalElements: number;
  totalPages: number;
  number: number;
}
