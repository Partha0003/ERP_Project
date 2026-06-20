import { Link } from 'react-router-dom';
import type { EmployeeDto } from '@/types/employee.types';

interface EmployeeTableProps {
  employees: EmployeeDto[];
  onToggle: (id: number) => void;
  onDelete: (emp: EmployeeDto) => void;
  togglingId: number | null;
  deletingId: number | null;
}

export function EmployeeTable({
  employees,
  onToggle,
  onDelete,
  togglingId,
  deletingId,
}: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <i className="bi bi-person-badge fs-1 d-block mb-2" />
        No employees found
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Salary</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td className="fw-medium">{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.departmentName ?? '—'}</td>
              <td><span className="badge bg-primary">{emp.role}</span></td>
              <td>{emp.baseSalary?.toLocaleString() ?? '—'}</td>
              <td>
                <span className={`badge ${emp.active ? 'bg-success' : 'bg-secondary'}`}>
                  {emp.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="text-end">
                <div className="btn-group btn-group-sm">
                  <Link to={`/hr/employees/${emp.id}/edit`} className="btn btn-outline-primary">
                    <i className="bi bi-pencil" />
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-warning"
                    disabled={togglingId === emp.id}
                    onClick={() => emp.id && onToggle(emp.id)}
                  >
                    {togglingId === emp.id ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <i className="bi bi-toggle-on" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    disabled={deletingId === emp.id}
                    onClick={() => onDelete(emp)}
                  >
                    {deletingId === emp.id ? (
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
