interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  subtitle?: string;
}

const colorClasses = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  secondary: 'bg-secondary',
};

export function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div
            className={`rounded-3 d-flex align-items-center justify-content-center text-white ${colorClasses[color]}`}
            style={{ width: 48, height: 48, fontSize: '1.25rem' }}
          >
            <i className={`bi bi-${icon}`} />
          </div>
          <div className="ms-3 flex-grow-1">
            <p className="text-muted mb-0 small text-uppercase fw-semibold">{title}</p>
            <h3 className="mb-0 fw-bold">{value}</h3>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
        </div>
      </div>
    </div>
  );
}
