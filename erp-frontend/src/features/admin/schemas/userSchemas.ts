import { z } from 'zod';

const staffRoles = ['ADMIN', 'HR', 'FINANCE', 'INVENTORY'] as const;

export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(staffRoles, { required_error: 'Role is required' }),
  departmentName: z.string().min(1, 'Department is required'),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  role: z.enum(staffRoles, { required_error: 'Role is required' }),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type DepartmentFormData = z.infer<typeof departmentSchema>;
