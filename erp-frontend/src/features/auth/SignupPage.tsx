import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { signupSchema, SIGNUP_ROLES, type SignupFormData } from './signupSchema';
import { ROLE_LABELS } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/apiErrors';
import { DemoCredentials } from './DemoCredentials';

export function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'ADMIN',
    },
  });

  const mutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => {
      setError(null);
      setSuccess(true);
    },
    onError: (err) => {
      setSuccess(false);
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    },
  });

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => navigate('/login'), 2000);
    return () => window.clearTimeout(timer);
  }, [success, navigate]);

  const onSubmit = (data: SignupFormData) => {
    setError(null);
    setSuccess(false);
    mutation.mutate({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role,
    });
  };

  const isBusy = isSubmitting || mutation.isPending || success;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h4 className="mb-4 text-center fw-semibold">Create Account</h4>

      {success && (
        <div className="alert alert-success py-2" role="alert">
          Account created successfully. Redirecting to login...
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="fullName" className="form-label">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
          placeholder="John Doe"
          autoComplete="name"
          disabled={isBusy}
          {...register('fullName')}
        />
        {errors.fullName && <div className="invalid-feedback">{errors.fullName.message}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          placeholder="you@company.com"
          autoComplete="email"
          disabled={isBusy}
          {...register('email')}
        />
        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          disabled={isBusy}
          {...register('password')}
        />
        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
          placeholder="Re-enter password"
          autoComplete="new-password"
          disabled={isBusy}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <div className="invalid-feedback">{errors.confirmPassword.message}</div>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="role" className="form-label">
          Role
        </label>
        <select
          id="role"
          className={`form-select ${errors.role ? 'is-invalid' : ''}`}
          disabled={isBusy}
          {...register('role')}
        >
          {SIGNUP_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
        {errors.role && <div className="invalid-feedback">{errors.role.message}</div>}
      </div>

      <button type="submit" className="btn btn-primary w-100 mb-3" disabled={isBusy}>
        {mutation.isPending ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" />
            Creating account...
          </>
        ) : success ? (
          'Account created'
        ) : (
          'Sign Up'
        )}
      </button>

      <p className="text-center text-muted mb-0 small">
        Already have an account?{' '}
        <Link to="/login" className="text-decoration-none">
          Sign In
        </Link>
      </p>

      <DemoCredentials />
    </form>
  );
}
