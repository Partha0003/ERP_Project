import type { UserRole, UserStatus } from './auth.types';

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string | null;
}

export interface UsersPageResponse {
  users: UserResponse[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  departmentName: string;
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  role: UserRole;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

export interface CreateUserResponse {
  message: string;
  userId: number;
  email: string;
  department: string;
}
