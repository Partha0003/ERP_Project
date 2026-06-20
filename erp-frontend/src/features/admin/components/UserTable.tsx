import { Link } from 'react-router-dom';
import type { UserResponse } from '@/types/user.types';
import { ROLE_LABELS } from '@/utils/constants';

interface UserTableProps {
  users: UserResponse[];
  onToggleStatus: (userId: number) => void;
  onDelete: (user: UserResponse) => void;
  togglingId: number | null;
  deletingId: number | null;
}

export function UserTable({
  users,
  onToggleStatus,
  onDelete,
  togglingId,
  deletingId,
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <i className="bi bi-people fs-1 d-block mb-2" />
        No users found matching your criteria
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Full Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Department</th>
            <th scope="col">Status</th>
            <th scope="col" className="text-end">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td className="fw-medium">{user.fullName}</td>
              <td>{user.email}</td>
              <td>
                <span className="badge bg-primary">{ROLE_LABELS[user.role] ?? user.role}</span>
              </td>
              <td>{user.department ?? '—'}</td>
              <td>
                <span className={`badge ${user.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                  {user.status}
                </span>
              </td>
              <td className="text-end">
                <div className="btn-group btn-group-sm">
                  <Link to={`/admin/users/${user.id}/edit`} className="btn btn-outline-primary" title="Edit">
                    <i className="bi bi-pencil" />
                  </Link>
                  <Link
                    to={`/admin/users/${user.id}/reset-password`}
                    className="btn btn-outline-warning"
                    title="Reset Password"
                  >
                    <i className="bi bi-key" />
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-info"
                    title="Toggle Status"
                    disabled={togglingId === user.id}
                    onClick={() => onToggleStatus(user.id)}
                  >
                    {togglingId === user.id ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <i className="bi bi-toggle-on" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    title="Delete"
                    disabled={deletingId === user.id}
                    onClick={() => onDelete(user)}
                  >
                    {deletingId === user.id ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <i className="bi bi-trash" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
