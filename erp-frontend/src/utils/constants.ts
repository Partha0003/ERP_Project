import type { UserRole } from '@/types/auth.types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const ROLE_ROUTES: Record<UserRole, string> = {
  ADMIN: '/admin/dashboard',
  HR: '/hr/dashboard',
  FINANCE: '/finance/dashboard',
  INVENTORY: '/inventory/dashboard',
  EMPLOYEE: '/employee/dashboard',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  HR: 'Human Resources',
  FINANCE: 'Finance',
  INVENTORY: 'Inventory',
  EMPLOYEE: 'Employee',
};

export const LEAVE_STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export const ATTENDANCE_STATUS_OPTIONS = [
  'PRESENT',
  'ABSENT',
  'LEAVE',
  'HALF_DAY',
  'NOT_MARKED',
] as const;

/** Statuses HR can manually set — LEAVE comes from approved leave workflow only */
export const MANUAL_ATTENDANCE_STATUS_OPTIONS = [
  'PRESENT',
  'ABSENT',
  'HALF_DAY',
  'NOT_MARKED',
] as const;

export const LEAVE_TYPE_OPTIONS = ['Sick', 'Casual', 'Annual', 'Unpaid'] as const;

export const ADMIN_STAFF_ROLES = ['ADMIN', 'HR', 'FINANCE', 'INVENTORY'] as const;

export const USER_ROLES: UserRole[] = ['ADMIN', 'HR', 'FINANCE', 'INVENTORY', 'EMPLOYEE'];
