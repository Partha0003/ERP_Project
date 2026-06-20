import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { updateUserSchema, type UpdateUserFormData } from '@/features/admin/schemas/userSchemas';
import { useAdminUser } from '@/features/admin/hooks/useAdminUsers';
import { getApiErrorMessage, useAdminMutations } from '@/features/admin/hooks/useAdminMutations';
import { ROLE_LABELS, USER_ROLES } from '@/utils/constants';

const STAFF_ROLES = USER_ROLES.filter((r) => r !== 'EMPLOYEE');

export function EditUser() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const navigate = useNavigate();
  const { updateUser } = useAdminMutations();
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const userQuery = useAdminUser(userId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    if (userQuery.data) {
      const role = STAFF_ROLES.includes(userQuery.data.role as (typeof STAFF_ROLES)[number])
        ? (userQuery.data.role as UpdateUserFormData['role'])
        : 'HR';
      reset({
        fullName: userQuery.data.fullName,
        email: userQuery.data.email,
        role,
      });
    }
  }, [userQuery.data, reset]);

  const onSubmit = async (data: UpdateUserFormData) => {
    setAlert(null);
    try {
      const result = await updateUser.mutateAsync({ userId, data });
      setAlert({ type: 'success', message: result.message });
      window.setTimeout(() => navigate('/admin/users'), 1200);
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to update user') });
    }
  };

  if (userQuery.isLoading) return <PageLoader />;
  if (userQuery.error || !userQuery.data) {
    return (
      <div>
        <ErrorAlert message="User not found or failed to load" />
        <Link to="/admin/users" className="btn btn-outline-secondary mt-3">
          Back to Users
        </Link>
      </div>
    );
  }

  const user = userQuery.data;

  return (
    <div>
      <PageHeader
        title="Edit User"
        subtitle={`Updating ${user.fullName} (ID: ${user.id})`}
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
        />
      )}

      <div className="row g-4">
        <div className="col-lg-8">
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
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email.message}</div>
                    )}
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
                    {errors.role && (
                      <div className="invalid-feedback">{errors.role.message}</div>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || updateUser.isPending || !isDirty}
                  >
                    {updateUser.isPending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <Link
                    to={`/admin/users/${userId}/reset-password`}
                    className="btn btn-outline-warning"
                  >
                    <i className="bi bi-key me-1" />
                    Reset Password
                  </Link>
                  <Link to="/admin/users" className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">User Details</div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">Status</span>
                <span
                  className={`badge ${user.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}
                >
                  {user.status}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">Department</span>
                <span>{user.department ?? '—'}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">User ID</span>
                <span>{user.id}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
