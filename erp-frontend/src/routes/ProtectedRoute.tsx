import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLES } from '@/utils/constants';

export function ProtectedRoute() {
  const { isAuthenticated, role, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !USER_ROLES.includes(role)) {
    logout();
    return <Navigate to="/login" replace state={{ reason: 'invalid-role' }} />;
  }

  return <Outlet />;
}
