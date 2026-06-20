import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { departmentsApi } from '@/api/departments.api';
import { PageHeader, PageLoader } from '@/components/shared/PageHeader';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { createUserSchema, type CreateUserFormData } from '@/features/admin/schemas/userSchemas';
import { getApiErrorMessage, useAdminMutations } from '@/features/admin/hooks/useAdminMutations';
import { ROLE_LABELS, USER_ROLES } from '@/utils/constants';

const STAFF_ROLES = USER_ROLES.filter((r) => r !== 'EMPLOYEE');

export function CreateUser() {
  const navigate = useNavigate();
  const { createUser } = useAdminMutations();
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'HR',
      departmentName: '',
    },
  });

  const onSubmit = async (data: CreateUserFormData) => {
    setAlert(null);
    try {
      const result = await createUser.mutateAsync(data);
      setAlert({
        type: 'success',
        message: `${result.message} (ID: ${result.userId}, ${result.email})`,
      });
      reset();
      window.setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to create user') });
    }
  };

  if (departmentsQuery.isLoading) return <PageLoader />;

  const departments = departmentsQuery.data ?? [];

  return (
    <div>
      <PageHeader
        title="Create User"
        subtitle="Add a new staff user to the system"
        actions={
          <Link to="/admin/users" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1" />
            Back to Users
          </Link>
        }
      />

      {alert && (
        <AlertBanner
          type={alert.type}
          message={alert.message}
          onClose={alert.type === 'danger' ? () => setAlert(null) : undefined}
          autoDismiss={alert.type === 'success' ? 3000 : 0}
        />
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="fullName" className="form-label fw-semibold">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  id="fullName"
                  className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <div className="invalid-feedback">{errors.fullName.message}</div>
                )}
              </div>

              <div className="col-md-6">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  {...register('email')}
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>

              <div className="col-md-6">
                <label htmlFor="password" className="form-label fw-semibold">
                  Password <span className="text-danger">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password')}
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password.message}</div>
                )}
                <div className="form-text">Minimum 8 characters</div>
              </div>

              <div className="col-md-6">
                <label htmlFor="role" className="form-label fw-semibold">
                  Role <span className="text-danger">*</span>
                </label>
                <select
                  id="role"
                  className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                  {...register('role')}
                >
                  {STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
                {errors.role && <div className="invalid-feedback">{errors.role.message}</div>}
              </div>

              <div className="col-md-6">
                <label htmlFor="departmentName" className="form-label fw-semibold">
                  Department <span className="text-danger">*</span>
                </label>
                <select
                  id="departmentName"
                  className={`form-select ${errors.departmentName ? 'is-invalid' : ''}`}
                  {...register('departmentName')}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentName && (
                  <div className="invalid-feedback">{errors.departmentName.message}</div>
                )}
                {departments.length === 0 && (
                  <div className="form-text text-warning">
                    No departments available.{' '}
                    <Link to="/admin/departments">Create a department first</Link>.
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || createUser.isPending}
              >
                {createUser.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-1" />
                    Create User
                  </>
                )}
              </button>
              <Link to="/admin/users" className="btn btn-outline-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
