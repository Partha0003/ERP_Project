import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types/auth.types';

interface AuthStore {
  jwt: string | null;
  email: string | null;
  role: UserRole | null;
  employeeId: number | null;
  isAuthenticated: boolean;
  login: (jwt: string, email: string, role: UserRole, employeeId?: number | null) => void;
  logout: () => void;
  setEmployeeId: (id: number) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      jwt: null,
      email: null,
      role: null,
      employeeId: null,
      isAuthenticated: false,

      login: (jwt, email, role, employeeId = null) =>
        set({
          jwt,
          email,
          role,
          employeeId: employeeId ?? null,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          jwt: null,
          email: null,
          role: null,
          employeeId: null,
          isAuthenticated: false,
        }),

      setEmployeeId: (id) => set({ employeeId: id }),
    }),
    {
      name: 'erp-auth-storage',
      partialize: (state) => ({
        jwt: state.jwt,
        email: state.email,
        role: state.role,
        employeeId: state.employeeId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
