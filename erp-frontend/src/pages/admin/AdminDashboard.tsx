import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { departmentsApi } from '@/api/departments.api';
import { StatCard } from '@/components/dashboard/StatCard';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { ROLE_LABELS, USER_ROLES } from '@/utils/constants';

export function AdminDashboard() {
  const usersQuery = useQuery({
    queryKey: ['admin', 'users', 0, 500],
    queryFn: () => adminApi.getAllUsers({ page: 0, size: 500 }),
  });

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  if (usersQuery.isLoading || departmentsQuery.isLoading) return <PageLoader />;
  if (usersQuery.error) return <ErrorAlert message="Failed to load dashboard data" />;

  const users = usersQuery.data?.users ?? [];
  const departments = departmentsQuery.data ?? [];
  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
  const disabledUsers = users.filter((u) => u.status === 'DISABLED').length;

  const staffRoles = USER_ROLES.filter((r) => r !== 'EMPLOYEE');

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="System overview and quick actions"
        actions={
          <div className="d-flex gap-2">
            <Link to="/admin/users/create" className="btn btn-primary btn-sm">
              <i className="bi bi-person-plus me-1" />
              Create User
            </Link>
            <Link to="/admin/departments" className="btn btn-outline-primary btn-sm">
              <i className="bi bi-diagram-3 me-1" />
              Departments
            </Link>
          </div>
        }
      />

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Total Users"
            value={usersQuery.data?.totalItems ?? users.length}
            icon="people"
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Active Users" value={activeUsers} icon="person-check" color="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Disabled Users" value={disabledUsers} icon="person-x" color="danger" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Departments" value={departments.length} icon="diagram-3" color="info" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Users by Role</span>
              <Link to="/admin/users" className="btn btn-sm btn-link">
                View all
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Role</th>
                    <th>Count</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {staffRoles.map((role) => {
                    const roleUsers = users.filter((u) => u.role === role);
                    const active = roleUsers.filter((u) => u.status === 'ACTIVE').length;
                    return (
                      <tr key={role}>
                        <td>{ROLE_LABELS[role]}</td>
                        <td>
                          <span className="badge bg-secondary">{roleUsers.length}</span>
                        </td>
                        <td>
                          <span className="badge bg-success">{active}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Departments</span>
              <Link to="/admin/departments" className="btn btn-sm btn-link">
                Manage
              </Link>
            </div>
            <ul className="list-group list-group-flush">
              {departments.length === 0 ? (
                <li className="list-group-item text-muted">No departments configured</li>
              ) : (
                departments.slice(0, 8).map((dept) => (
                  <li key={dept.id} className="list-group-item d-flex justify-content-between">
                    <span>{dept.name}</span>
                    <span className="text-muted small">ID {dept.id}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
