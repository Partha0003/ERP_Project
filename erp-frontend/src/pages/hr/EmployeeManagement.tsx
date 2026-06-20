import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '@/api/employees.api';
import { departmentsApi } from '@/api/departments.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { ConfirmModal } from '@/features/admin/components/ConfirmModal';
import { PaginationControls } from '@/features/admin/components/PaginationControls';
import { EmployeeTable } from '@/features/hr/components/EmployeeTable';
import { useHrMutations } from '@/features/hr/hooks/useHrMutations';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { getApiErrorMessage } from '@/utils/apiErrors';
import type { EmployeeDto, EmployeePageResponse } from '@/types/employee.types';

export function EmployeeManagement() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeDto | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { toggleEmployee, deleteEmployee } = useHrMutations();

  const query = useQuery({
    queryKey: ['hr', 'employees', page, pageSize, department, role],
    queryFn: () =>
      department && role
        ? employeesApi.filter(role, department, page, pageSize)
        : employeesApi.getPaged(page, pageSize),
  });

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  const employees = useMemo(() => {
    const list: EmployeeDto[] = (query.data as EmployeePageResponse | undefined)?.content ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (e: EmployeeDto) =>
        e.name.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term) ||
        (e.departmentName?.toLowerCase().includes(term) ?? false)
    );
  }, [query.data, search]);

  const handleToggle = async (id: number) => {
    setTogglingId(id);
    setAlert(null);
    try {
      const msg = await toggleEmployee.mutateAsync(id);
      setAlert({ type: 'success', message: msg });
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to toggle status') });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeletingId(deleteTarget.id);
    try {
      const msg = await deleteEmployee.mutateAsync(deleteTarget.id);
      setAlert({ type: 'success', message: msg });
      setDeleteTarget(null);
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to delete employee') });
    } finally {
      setDeletingId(null);
    }
  };

  if (query.isLoading) return <PageLoader />;
  if (query.error) return <ErrorAlert message="Failed to load employees" />;

  return (
    <div>
      <PageHeader
        title="Employee Management"
        subtitle="Create, update, and manage employee records"
        actions={
          <Link to="/hr/employees/create" className="btn btn-primary btn-sm">
            <i className="bi bi-person-plus me-1" />Add Employee
          </Link>
        }
      />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Search name, email, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={department} onChange={(e) => { setDepartment(e.target.value); setPage(0); }}>
                <option value="">All Departments</option>
                {(departmentsQuery.data ?? []).map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={role} onChange={(e) => { setRole(e.target.value); setPage(0); }}>
                <option value="">All Roles</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(''); setDepartment(''); setRole(''); setPage(0); }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <EmployeeTable
            employees={employees}
            onToggle={handleToggle}
            onDelete={setDeleteTarget}
            togglingId={togglingId}
            deletingId={deletingId}
          />
        </div>
        <div className="card-footer bg-white">
          <PaginationControls
            currentPage={page}
            totalPages={query.data?.totalPages ?? 1}
            totalItems={query.data?.totalElements ?? 0}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          />
        </div>
      </div>

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Employee"
        message={`Delete ${deleteTarget?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteEmployee.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
