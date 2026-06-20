import type { DepartmentDTO } from '@/types/department.types';

interface DepartmentTableProps {
  departments: DepartmentDTO[];
  onEdit: (dept: DepartmentDTO) => void;
  onDelete: (dept: DepartmentDTO) => void;
  deletingId: number | null;
}

export function DepartmentTable({ departments, onEdit, onDelete, deletingId }: DepartmentTableProps) {
  if (departments.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <i className="bi bi-diagram-3 fs-1 d-block mb-2" />
        No departments found
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Department Name</th>
            <th scope="col" className="text-end">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id}>
              <td>{dept.id}</td>
              <td className="fw-medium">{dept.name}</td>
              <td className="text-end">
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => onEdit(dept)}
                  >
                    <i className="bi bi-pencil me-1" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    disabled={deletingId === dept.id}
                    onClick={() => onDelete(dept)}
                  >
                    {deletingId === dept.id ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <>
                        <i className="bi bi-trash me-1" />
                        Delete
                      </>
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
