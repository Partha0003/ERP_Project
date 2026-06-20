import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '@/api/employees.api';
import { attendanceApi } from '@/api/attendance.api';
import { leavesApi } from '@/api/leaves.api';
import { salaryApi, payslipApi, performanceApi } from '@/api/salary.api';
import type { EmployeeDto } from '@/types/employee.types';
import type { AttendanceDto } from '@/types/attendance.types';
import type { PerformanceReviewDto } from '@/types/salary.types';

export function useHrMutations() {
  const queryClient = useQueryClient();

  const invalidateEmployees = () => {
    queryClient.invalidateQueries({ queryKey: ['hr', 'employees'] });
    queryClient.invalidateQueries({ queryKey: ['hr', 'employee'] });
  };

  const invalidateAttendance = () => {
    queryClient.invalidateQueries({ queryKey: ['hr', 'attendance'] });
    queryClient.invalidateQueries({ queryKey: ['employee', 'attendance'] });
  };

  const invalidateLeaves = () => {
    queryClient.invalidateQueries({ queryKey: ['hr', 'leaves'] });
    queryClient.invalidateQueries({ queryKey: ['employee', 'leaves'] });
    queryClient.invalidateQueries({ queryKey: ['hr', 'attendance'] });
    queryClient.invalidateQueries({ queryKey: ['employee', 'attendance'] });
  };

  const invalidatePayroll = () => {
    queryClient.invalidateQueries({ queryKey: ['hr', 'payroll'] });
    queryClient.invalidateQueries({ queryKey: ['hr', 'payslips'] });
  };

  const invalidatePerformance = () => {
    queryClient.invalidateQueries({ queryKey: ['hr', 'performance'] });
    queryClient.invalidateQueries({ queryKey: ['employee', 'performance'] });
  };

  return {
    createEmployee: useMutation({
      mutationFn: (data: EmployeeDto) => employeesApi.create(data),
      onSuccess: invalidateEmployees,
    }),
    updateEmployee: useMutation({
      mutationFn: ({ id, data }: { id: number; data: EmployeeDto }) => employeesApi.update(id, data),
      onSuccess: invalidateEmployees,
    }),
    deleteEmployee: useMutation({
      mutationFn: (id: number) => employeesApi.delete(id),
      onSuccess: invalidateEmployees,
    }),
    toggleEmployee: useMutation({
      mutationFn: (id: number) => employeesApi.toggleStatus(id),
      onSuccess: invalidateEmployees,
    }),
    markAttendance: useMutation({
      mutationFn: (data: AttendanceDto) => attendanceApi.mark(data),
      onSuccess: invalidateAttendance,
    }),
    markNow: useMutation({
      mutationFn: (employeeId: number) => attendanceApi.markNow(employeeId),
      onSuccess: invalidateAttendance,
    }),
    updateLeaveStatus: useMutation({
      mutationFn: ({ id, status }: { id: number; status: string }) => leavesApi.updateStatus(id, status),
      onSuccess: invalidateLeaves,
    }),
    generateSalary: useMutation({
      mutationFn: (month: string) => salaryApi.generate(month),
      onSuccess: invalidatePayroll,
    }),
    approveSalary: useMutation({
      mutationFn: (id: number) => salaryApi.approve(id),
      onSuccess: invalidatePayroll,
    }),
    forwardSalary: useMutation({
      mutationFn: (id: number) => salaryApi.forward(id),
      onSuccess: invalidatePayroll,
    }),
    regenerateSalary: useMutation({
      mutationFn: (id: number) => salaryApi.regenerate(id),
      onSuccess: invalidatePayroll,
    }),
    emailPayslip: useMutation({
      mutationFn: (id: number) => payslipApi.email(id),
    }),
    createReview: useMutation({
      mutationFn: (data: PerformanceReviewDto) => performanceApi.create(data),
      onSuccess: invalidatePerformance,
    }),
  };
}
