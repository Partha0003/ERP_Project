import { useEffect } from 'react';

interface AlertBannerProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  autoDismiss?: number;
}

export function AlertBanner({ type, message, onClose, autoDismiss = 5000 }: AlertBannerProps) {
  useEffect(() => {
    if (!onClose || !autoDismiss) return;
    const timer = window.setTimeout(onClose, autoDismiss);
    return () => window.clearTimeout(timer);
  }, [onClose, autoDismiss, message]);

  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      <i
        className={`bi bi-${
          type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'
        } me-2`}
      />
      {message}
      {onClose && (
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
      )}
    </div>
  );
}
