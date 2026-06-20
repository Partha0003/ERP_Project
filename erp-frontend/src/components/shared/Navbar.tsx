import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/utils/constants';

export function Navbar() {
  const { email, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 py-2">
      <div className="container-fluid px-0">
        <span className="navbar-text text-muted d-none d-md-inline">
          Enterprise Resource Planning
        </span>
        <div className="ms-auto d-flex align-items-center gap-3">
          {role && (
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
              {ROLE_LABELS[role]}
            </span>
          )}
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-2"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-circle" />
              <span className="d-none d-sm-inline">{email}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item text-danger" type="button" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
