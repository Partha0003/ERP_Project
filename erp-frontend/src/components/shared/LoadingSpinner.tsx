interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'spinner-border-sm',
  md: '',
  lg: '',
};

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClass = sizeMap[size];
  const wrapperClass = size === 'lg' ? 'spinner-border-lg-custom' : '';

  return (
    <div
      className={`spinner-border text-primary ${sizeClass} ${wrapperClass}`}
      role="status"
      style={size === 'lg' ? { width: '3rem', height: '3rem' } : undefined}
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}
