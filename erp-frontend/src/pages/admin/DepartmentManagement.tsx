import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi } from '@/api/departments.api';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { ConfirmModal } from '@/features/admin/components/ConfirmModal';
import { DepartmentTable } from '@/features/admin/components/DepartmentTable';
import { departmentSchema, type DepartmentFormData } from '@/features/admin/schemas/userSchemas';
import { getApiErrorMessage } from '@/features/admin/hooks/useAdminMutations';
import type { DepartmentDTO } from '@/types/department.types';

export function DepartmentManagement() {
  const queryClient = useQueryClient();
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [editingDept, setEditingDept] = useState<DepartmentDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentDTO | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const query = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: '' },
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => departmentsApi.create({ id: 0, name }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setAlert({ type: 'success', message: data.message });
      reset({ name: '' });
    },
    onError: (err) => {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to create department') });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      departmentsApi.update(id, { id, name }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setAlert({ type: 'success', message: data.message });
      setEditingDept(null);
      reset({ name: '' });
    },
    onError: (err) => {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to update department') });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => departmentsApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setAlert({ type: 'success', message: data.message });
      setDeleteTarget(null);
    },
    onError: (err) => {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to delete department') });
    },
  });

  const onSubmit = (data: DepartmentFormData) => {
    setAlert(null);
    if (editingDept) {
      updateMutation.mutate({ id: editingDept.id, name: data.name.trim() });
    } else {
      createMutation.mutate(data.name.trim());
    }
  };

  const handleEdit = (dept: DepartmentDTO) => {
    setEditingDept(dept);
    setValue('name', dept.name);
    setAlert(null);
  };

  const handleCancelEdit = () => {
    setEditingDept(null);
    reset({ name: '' });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
    } finally {
      setDeletingId(null);
    }
  };

  if (query.isLoading) return <PageLoader />;
  if (query.error) return <ErrorAlert message="Failed to load departments" />;

  const departments = (query.data ?? []).filter((dept) =>
    dept.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Department Management" subtitle="Create and manage organizational departments" />

      {alert && (
        <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">
            {editingDept ? `Edit Department: ${editingDept.name}` : 'Add Department'}
          </h5>
          <form onSubmit={handleSubmit(onSubmit)} className="row g-3 align-items-end">
            <div className="col-md-8">
              <label htmlFor="deptName" className="form-label fw-semibold">
                Department Name <span className="text-danger">*</span>
              </label>
              <input
                id="deptName"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="e.g. Engineering"
                {...register('name')}
              />
              {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
            </div>
            <div className="col-md-4 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary flex-grow-1"
                disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              >
                {editingDept ? 'Update' : 'Add'} Department
              </button>
              {editingDept && (
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search" />
            </span>
            <input
              type="search"
              className="form-control"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <DepartmentTable
            departments={departments}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            deletingId={deletingId}
          />
        </div>
        <div className="card-footer bg-white text-muted small">
          {departments.length} department{departments.length !== 1 ? 's' : ''} shown
        </div>
      </div>

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Department"
        message={`Delete "${deleteTarget?.name}"? Users linked to this department may be affected.`}
        confirmLabel="Delete Department"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
