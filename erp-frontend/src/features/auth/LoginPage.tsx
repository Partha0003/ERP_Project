import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from './loginSchema';
import { getDefaultRoute } from '@/utils/roleUtils';
import { DemoCredentials } from './DemoCredentials';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: authApi.signin,
    onSuccess: (data, variables) => {
      login(data.jwt, variables.email, data.role, data.employeeId);
      navigate(getDefaultRoute(data.role));
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      const msg =
        err.response?.data?.message ||
        (err as { message?: string }).message ||
        'Invalid email or password';
      setError(typeof msg === 'string' ? msg : 'Login failed');
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h4 className="mb-4 text-center fw-semibold">Sign In</h4>

      {error && (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      )}

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
          {...register('email')}
        />
        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          placeholder="Enter password"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100 mb-3"
        disabled={isSubmitting || mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <p className="text-center text-muted mb-0 small">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-decoration-none">
          Sign Up
        </Link>
      </p>

      <DemoCredentials />
    </form>
  );
}
