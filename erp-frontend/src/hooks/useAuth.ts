import { useAuthStore } from '@/store/authStore';
import { getDefaultRoute } from '@/utils/roleUtils';
import type { UserRole } from '@/types/auth.types';

export function useAuth() {
  const jwt = useAuthStore((s) => s.jwt);
  const email = useAuthStore((s) => s.email);
  const role = useAuthStore((s) => s.role);
  const employeeId = useAuthStore((s) => s.employeeId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const setEmployeeId = useAuthStore((s) => s.setEmployeeId);

  const defaultRoute = role ? getDefaultRoute(role) : '/login';

  const hasRole = (roles: UserRole[]) => (role ? roles.includes(role) : false);

  return {
    jwt,
    email,
    role,
    employeeId,
    isAuthenticated,
    login,
    logout,
    setEmployeeId,
    defaultRoute,
    hasRole,
  };
}
