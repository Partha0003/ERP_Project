import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  role: z.string().min(1, 'Role is required'),
  departmentId: z.coerce.number().min(1, 'Department is required'),
  baseSalary: z.coerce.number().min(0, 'Base salary must be positive'),
  bonus: z.coerce.number().min(0).optional(),
  deduction: z.coerce.number().min(0).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export const employeeUpdateSchema = employeeSchema.omit({ password: true });

export const markAttendanceSchema = z.object({
  employeeId: z.coerce.number().min(1, 'Employee ID is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'NOT_MARKED']),
  remarks: z.string().optional(),
  overtime: z.boolean().optional(),
});

export const performanceReviewSchema = z.object({
  employeeId: z.coerce.number().min(1, 'Employee is required'),
  reviewDate: z.string().min(1, 'Review date is required'),
  performanceRating: z.string().min(1, 'Rating is required'),
  comments: z.string().min(1, 'Comments are required'),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type EmployeeUpdateFormData = z.infer<typeof employeeUpdateSchema>;
export type MarkAttendanceFormData = z.infer<typeof markAttendanceSchema>;
export type PerformanceReviewFormData = z.infer<typeof performanceReviewSchema>;
