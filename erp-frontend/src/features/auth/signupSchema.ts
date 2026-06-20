import { z } from 'zod';

const signupRoles = ['ADMIN', 'HR', 'FINANCE', 'INVENTORY', 'EMPLOYEE'] as const;

export const signupSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(signupRoles, { required_error: 'Role is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const SIGNUP_ROLES = signupRoles;
