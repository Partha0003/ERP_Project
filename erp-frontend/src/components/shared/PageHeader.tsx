import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
      <div>
        <h1 className="h3 mb-1 fw-bold text-dark">{title}</h1>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {actions && <div className="d-flex gap-2">{actions}</div>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="alert alert-danger" role="alert">
      {message}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center text-muted py-5">
      <p className="mb-0">{message}</p>
    </div>
  );
}
