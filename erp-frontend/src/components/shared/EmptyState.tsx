interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = 'inbox', title, message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-5 px-3">
      <i className={`bi bi-${icon} text-muted display-6 d-block mb-3`} />
      <h6 className="fw-semibold text-secondary">{title}</h6>
      {message && <p className="text-muted small mb-3">{message}</p>}
      {action}
    </div>
  );
}
