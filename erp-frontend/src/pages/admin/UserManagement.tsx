import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { ConfirmModal } from '@/features/admin/components/ConfirmModal';
import { PaginationControls } from '@/features/admin/components/PaginationControls';
import { UserFilters } from '@/features/admin/components/UserFilters';
import { UserTable } from '@/features/admin/components/UserTable';
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers';
import { getApiErrorMessage, useAdminMutations } from '@/features/admin/hooks/useAdminMutations';
import type { UserResponse } from '@/types/user.types';
import type { UserRole, UserStatus } from '@/types/auth.types';

const defaultFilters = {
  search: '',
  role: '' as UserRole | '',
  status: '' as UserStatus | '',
};

export function UserManagement() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState(defaultFilters);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { toggleStatus, deleteUser } = useAdminMutations();

  const { users, isLoading, error, totalItems, totalPages, currentPage } = useAdminUsers({
    page,
    size: pageSize,
    role: filters.role,
    status: filters.status,
    search: filters.search,
  });

  const handleFilterChange = (values: typeof defaultFilters) => {
    setFilters(values);
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setPage(0);
  };

  const handleToggleStatus = async (userId: number) => {
    setTogglingId(userId);
    setAlert(null);
    try {
      const result = await toggleStatus.mutateAsync(userId);
      setAlert({ type: 'success', message: result.message });
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to update user status') });
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setAlert(null);
    try {
      const result = await deleteUser.mutateAsync(deleteTarget.id);
      setAlert({ type: 'success', message: result.message });
      setDeleteTarget(null);
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to delete user') });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorAlert message="Failed to load users" />;

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage system users, roles, and access"
        actions={
          <Link to="/admin/users/create" className="btn btn-primary btn-sm">
            <i className="bi bi-person-plus me-1" />
            Create User
          </Link>
        }
      />

      {alert && (
        <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      <UserFilters values={filters} onChange={handleFilterChange} onReset={handleResetFilters} />

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <UserTable
            users={users}
            onToggleStatus={handleToggleStatus}
            onDelete={setDeleteTarget}
            togglingId={togglingId}
            deletingId={deletingId}
          />
        </div>
        <div className="card-footer bg-white">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
          />
        </div>
      </div>

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.fullName}? This action cannot be undone.`}
        confirmLabel="Delete User"
        loading={deleteUser.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
