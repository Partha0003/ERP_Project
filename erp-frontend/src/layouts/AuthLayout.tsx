import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AuthLayout() {
  const { isAuthenticated, defaultRoute } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={defaultRoute} replace />;
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="text-center mb-4">
              <i className="bi bi-building text-primary" style={{ fontSize: '3rem' }} />
              <h2 className="fw-bold mt-2">ERP System</h2>
              <p className="text-muted">Enterprise Resource Planning</p>
            </div>
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
