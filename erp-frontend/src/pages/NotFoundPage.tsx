import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function NotFoundPage() {
  const { isAuthenticated, defaultRoute } = useAuth();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <h1 className="display-4 fw-bold text-muted">404</h1>
        <p className="text-muted mb-4">The page you are looking for does not exist.</p>
        <Link to={isAuthenticated ? defaultRoute : '/login'} className="btn btn-primary">
          {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
        </Link>
      </div>
    </div>
  );
}
