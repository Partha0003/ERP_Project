export interface SalaryDashboardSummaryDto {
  totalPayout: number;
  pendingPayslipsCount: number;
  forwardedPayslipsCount: number;
  paidCount: number;
}

export interface SalaryGenerateResultDto {
  generatedCount: number;
  skippedCount: number;
  warnings: string[];
  message: string;
}

export interface PayslipRecordDto {
  id: number;
  salaryId?: number;
  employeeName: string;
  department: string;
  month: string;
  year: number;
  netSalary: number;
  status: string;
  downloadUrl?: string;
}

export interface SalaryRecord {
  id: number;
  employeeName: string;
  department: string;
  month: string;
  baseSalary: number;
  bonus: number;
  tax: number;
  deduction: number;
  presentDays: number;
  leaveDays: number;
  absentDays: number;
  finalSalary: number;
  totalPayable: number;
  approvedByHR: boolean;
  forwardedToFinance: boolean;
  paid: boolean;
  date: string;
}

export interface SalaryPayslipDto {
  id: number;
  employeeName: string;
  employeeEmail: string;
  department: string;
  month: string;
  baseSalary: number;
  bonus: number;
  tax: number;
  deduction: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  totalEarnings: number;
  approvedByHR: boolean;
  forwardedToFinance: boolean;
  paid: boolean;
  netSalary: number;
  status: string;
  downloadUrl?: string;
}

export interface MyPayslipDto {
  id: number;
  month: string;
  year: number;
  netSalary: number;
  status: string;
  downloadUrl?: string;
}

export interface PayslipLogDto {
  id: number;
  employeeId: number;
  payslipId: number;
  action: string;
  doneBy: string;
  timestamp: string;
}

export interface PerformanceReviewDto {
  id?: number;
  employeeId: number;
  reviewDate: string;
  performanceRating: string;
  comments: string;
  bonusAmount?: number;
  performanceImpact?: number;
  finalSalary?: number;
}
