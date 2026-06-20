export type UserRole = 'ADMIN' | 'HR' | 'FINANCE' | 'INVENTORY' | 'EMPLOYEE';

export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface LoginRequest {
  email: string;
  password: string;
}

export type SignupRole = 'ADMIN' | 'HR' | 'FINANCE' | 'INVENTORY' | 'EMPLOYEE';

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  role: SignupRole;
}

export interface AuthResponse {
  jwt: string;
  message: string;
  role: UserRole;
  employeeId?: number | null;
}

export interface AuthState {
  jwt: string | null;
  email: string | null;
  role: UserRole | null;
  employeeId: number | null;
  isAuthenticated: boolean;
}
