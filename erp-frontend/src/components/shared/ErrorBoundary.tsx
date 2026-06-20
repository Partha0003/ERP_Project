import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Something went wrong' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
          <div className="card border-0 shadow-sm text-center" style={{ maxWidth: 480 }}>
            <div className="card-body p-4">
              <i className="bi bi-exclamation-triangle text-danger display-4 mb-3" />
              <h5 className="fw-semibold">Something went wrong</h5>
              <p className="text-muted small mb-3">{this.state.message}</p>
              <button className="btn btn-primary btn-sm" onClick={() => window.location.assign('/')}>
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
