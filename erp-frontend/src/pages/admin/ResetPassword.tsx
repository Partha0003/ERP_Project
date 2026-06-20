import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/features/admin/schemas/userSchemas';
import { useAdminUser } from '@/features/admin/hooks/useAdminUsers';
import { getApiErrorMessage, useAdminMutations } from '@/features/admin/hooks/useAdminMutations';

export function ResetPassword() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const navigate = useNavigate();
  const { resetPassword } = useAdminMutations();
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const userQuery = useAdminUser(userId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setAlert(null);
    try {
      const result = await resetPassword.mutateAsync({
        userId,
        data: { newPassword: data.newPassword },
      });
      setAlert({ type: 'success', message: result.message });
      reset();
      window.setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to reset password') });
    }
  };

  if (userQuery.isLoading) return <PageLoader />;
  if (userQuery.error || !userQuery.data) {
    return (
      <div>
        <ErrorAlert message="User not found" />
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
        title="Reset Password"
        subtitle={`Set a new password for ${user.fullName}`}
        actions={
          <Link to={`/admin/users/${userId}/edit`} className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1" />
            Back to Edit
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

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="mb-4 p-3 bg-light rounded">
                <div className="small text-muted">User</div>
                <div className="fw-semibold">{user.fullName}</div>
                <div className="text-muted">{user.email}</div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label fw-semibold">
                    New Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                      {...register('newPassword')}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`} />
                    </button>
                    {errors.newPassword && (
                      <div className="invalid-feedback d-block">{errors.newPassword.message}</div>
                    )}
                  </div>
                  <div className="form-text">Minimum 8 characters</div>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label fw-semibold">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-warning"
                    disabled={isSubmitting || resetPassword.isPending}
                  >
                    {resetPassword.isPending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-key me-1" />
                        Reset Password
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
      </div>
    </div>
  );
}
