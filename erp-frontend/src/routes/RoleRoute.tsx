import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/auth.types';
import { USER_ROLES } from '@/utils/constants';

interface RoleRouteProps {
  roles: UserRole[];
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const { role, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !USER_ROLES.includes(role)) {
    logout();
    return <Navigate to="/login" replace state={{ reason: 'invalid-role' }} />;
  }

  if (!roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
